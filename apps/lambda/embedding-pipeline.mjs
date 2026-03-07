import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { Pinecone } from "@pinecone-database/pinecone";

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET || "zap-bot-meetings";
const embedModelId = process.env.BEDROCK_EMBED_MODEL_ID || "amazon.titan-embed-text-v2:0";
const groqApiKey = process.env.GROQ_API_KEY || "";
const groqEmbedModel = process.env.GROQ_EMBED_MODEL_ID || "nomic-embed-text-v1_5";
const groqBaseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

const s3 = new S3Client({ region });
const bedrock = new BedrockRuntimeClient({ region });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

function chunkTranscript(entries, maxWords = 380) {
    const chunks = [];
    let current = [];
    let wordCount = 0;

    for (const entry of entries || []) {
        const text = `[${entry.speaker}] ${entry.text}`;
        const words = text.split(/\s+/).length;

        if (wordCount + words > maxWords && current.length > 0) {
            chunks.push(current);
            current = [entry];
            wordCount = words;
        } else {
            current.push(entry);
            wordCount += words;
        }
    }

    if (current.length > 0) chunks.push(current);
    return chunks;
}

async function readTranscriptFromS3(effectiveBucket, transcriptKey) {
    const obj = await s3.send(new GetObjectCommand({ Bucket: effectiveBucket, Key: transcriptKey }));
    const parts = [];
    for await (const p of obj.Body) parts.push(Buffer.from(p));
    return JSON.parse(Buffer.concat(parts).toString("utf-8"));
}

async function embedTextWithGroq(text) {
    if (!groqApiKey || !groqEmbedModel) {
        throw new Error("Groq embedding not configured");
    }

    const res = await fetch(`${groqBaseUrl}/embeddings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
            model: groqEmbedModel,
            input: text,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Groq embedding request failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const vector = json?.data?.[0]?.embedding;
    if (!Array.isArray(vector)) {
        throw new Error("Groq embedding response did not include vector");
    }

    return vector;
}

async function embedTextWithBedrock(text) {
    const cmd = new InvokeModelCommand({
        modelId: embedModelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({ inputText: text, dimensions: 1024, normalize: true }),
    });
    const res = await bedrock.send(cmd);
    return JSON.parse(new TextDecoder().decode(res.body)).embedding;
}

async function embedText(text) {
    if (groqApiKey && groqEmbedModel) {
        try {
            const vector = await embedTextWithGroq(text);
            return { vector, provider: "groq" };
        } catch (error) {
            console.warn("Groq embedding failed, falling back to Bedrock:", error.message);
        }
    }

    const vector = await embedTextWithBedrock(text);
    return { vector, provider: "bedrock" };
}

export const handler = async (event) => {
    const meetingId = event.meetingId;
    const effectiveBucket = event.bucket || bucket;
    const transcriptKey = event.s3TranscriptKey || `transcripts/${meetingId}.json`;

    if (!meetingId) {
        return { statusCode: 400, error: "meetingId is required" };
    }

    const transcript = await readTranscriptFromS3(effectiveBucket, transcriptKey);
    const grouped = chunkTranscript(transcript.entries || []);

    const vectors = [];
    let providerUsed = "bedrock";
    for (const [idx, group] of grouped.entries()) {
        const text = group.map((e) => `[${e.speaker}] ${e.text}`).join("\n");
        const embedded = await embedText(text);
        providerUsed = embedded.provider;

        vectors.push({
            id: `${meetingId}-chunk-${idx}`,
            values: embedded.vector,
            metadata: {
                meetingId,
                text,
                provider: embedded.provider,
                startTime: group[0]?.startTime || 0,
                endTime: group[group.length - 1]?.endTime || 0,
            },
        });
    }

    const indexName = process.env.PINECONE_INDEX || "zap-bot";
    await pinecone.Index(indexName).upsert(vectors);

    return {
        statusCode: 200,
        meetingId,
        chunkCount: vectors.length,
        index: indexName,
        embedProvider: providerUsed,
    };
};
