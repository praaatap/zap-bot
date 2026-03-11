import { Groq } from "groq-sdk";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

interface RAGResponse {
  answer: string;
  sources: Array<{
    chunkId: string;
    text: string;
    relevanceScore: number;
  }>;
  confidence: number;
}

export class RAGService {
  private groq: Groq;
  private bedrock: BedrockRuntimeClient;
  private useGroq: boolean;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    this.useGroq = !!process.env.GROQ_API_KEY;
  }

  async generateAnswer(
    query: string,
    retrievedChunks: Array<{ content: string; chunkId: string; score: number }>
  ): Promise<RAGResponse> {
    const context = retrievedChunks
      .map((chunk) => `[Chunk ${chunk.chunkId}] ${chunk.content}`)
      .join("\n\n");

    const systemPrompt = `You are an intelligent interview analysis assistant. Your role is to answer questions about interview transcripts based on the provided context.
    
Guidelines:
- Answer questions based ONLY on the provided interview context
- Be concise and specific
- If information is not in the context, say "This information is not covered in the interview transcript"
- Provide relevant details that support your answer
- For candidate assessment: focus on factual statements, not assumptions`;

    const userPrompt = `Interview Context:
${context}

Question: ${query}

Please provide a helpful answer based on the interview context above.`;

    let answer: string;

    if (this.useGroq) {
      answer = await this.generateWithGroq(userPrompt, systemPrompt);
    } else {
      answer = await this.generateWithBedrock(userPrompt, systemPrompt);
    }

    return {
      answer,
      sources: retrievedChunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        text: chunk.content.substring(0, 200),
        relevanceScore: chunk.score,
      })),
      confidence: Math.min(...retrievedChunks.map((c) => c.score)),
    };
  }

  private async generateWithGroq(
    userPrompt: string,
    systemPrompt: string
  ): Promise<string> {
    const response = await this.groq.messages.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    return "Unable to generate response";
  }

  private async generateWithBedrock(
    userPrompt: string,
    systemPrompt: string
  ): Promise<string> {
    const response = await this.bedrock.send(
      new InvokeModelCommand({
        modelId: "anthropic.claude-3-5-sonnet-20241022",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-06-01",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      })
    );

    const result = JSON.parse(new TextDecoder().decode(response.body));
    if (result.content && result.content[0]) {
      return result.content[0].text;
    }

    return "Unable to generate response";
  }

  async generateInterviewSummary(
    fullTranscript: string
  ): Promise<string> {
    const systemPrompt = `You are an expert interview summarizer. Create a concise summary highlighting:
- Candidate's key qualifications
- Technical skills demonstrated
- Communication style
- Notable strengths and areas for development
- Overall fit assessment

Be objective and fact-based.`;

    const userPrompt = `Please summarize this interview transcript:\n\n${fullTranscript}`;

    if (this.useGroq) {
      return this.generateWithGroq(userPrompt, systemPrompt);
    } else {
      return this.generateWithBedrock(userPrompt, systemPrompt);
    }
  }
}

export const ragService = new RAGService();
