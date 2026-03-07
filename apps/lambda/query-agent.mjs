import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { Pinecone } from "@pinecone-database/pinecone";

const region = process.env.AWS_REGION || "us-east-1";
const embedModelId = process.env.BEDROCK_EMBED_MODEL_ID || "amazon.titan-embed-text-v2:0";
const chatModelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";
const groqApiKey = process.env.GROQ_API_KEY || "";
const groqEmbedModel = process.env.GROQ_EMBED_MODEL_ID || "nomic-embed-text-v1_5";
const groqBaseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

const bedrock = new BedrockRuntimeClient({ region });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function parseEvent(event) {
  if (!event) return {};
  if (event.body) {
    try {
      return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch {
      return {};
    }
  }
  return event;
}

async function embedQueryWithGroq(text) {
  if (!groqApiKey || !groqEmbedModel) {
    throw new Error("Groq embedding not configured");
  }

  const res = await fetch(`${groqBaseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`
    },
    body: JSON.stringify({ model: groqEmbedModel, input: text })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq embedding failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const vector = json?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) {
    throw new Error("Invalid Groq embedding response");
  }

  return vector;
}

async function embedQueryWithBedrock(text) {
  const cmd = new InvokeModelCommand({
    modelId: embedModelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({ inputText: text, dimensions: 1024, normalize: true })
  });
  const res = await bedrock.send(cmd);
  return JSON.parse(new TextDecoder().decode(res.body)).embedding;
}

async function embedQuery(text) {
  if (groqApiKey && groqEmbedModel) {
    try {
      const vector = await embedQueryWithGroq(text);
      return { vector, provider: "groq" };
    } catch (error) {
      console.warn("Groq query embedding failed, falling back to Bedrock:", error.message);
    }
  }

  const vector = await embedQueryWithBedrock(text);
  return { vector, provider: "bedrock" };
}

async function answerWithBedrock(prompt) {
  const cmd = new InvokeModelCommand({
    modelId: chatModelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const res = await bedrock.send(cmd);
  return JSON.parse(new TextDecoder().decode(res.body)).content[0].text;
}

export const handler = async (event) => {
  const input = parseEvent(event);
  const meetingId = input.meetingId;
  const query = input.query;
  const topK = Number(input.topK || 5);

  if (!meetingId || !query) {
    return response(400, { error: "meetingId and query are required" });
  }

  const embedded = await embedQuery(query);
  const indexName = process.env.PINECONE_INDEX || "zap-bot";
  const result = await pinecone.Index(indexName).query({
    vector: embedded.vector,
    topK,
    includeMetadata: true,
    filter: { meetingId: { "$eq": meetingId } }
  });

  const context = (result.matches || [])
    .map((m) => m.metadata?.text)
    .filter(Boolean)
    .join("\n---\n") || "No transcript context found for this meeting.";

  const prompt = `You are a meeting assistant.
Answer the user question based on meeting context.
If uncertain, say what is missing.

Meeting ID: ${meetingId}
Context:\n${context}

Question: ${query}
Answer:`;

  const answer = await answerWithBedrock(prompt);

  return response(200, {
    answer,
    meetingId,
    topK,
    matches: (result.matches || []).length,
    embedProvider: embedded.provider
  });
};
