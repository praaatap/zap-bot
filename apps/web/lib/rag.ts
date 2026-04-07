import { prisma } from "./prisma";
import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

function getPineconeClient() {
    if (pineconeClient) {
        return pineconeClient;
    }

    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
        throw new Error("Missing PINECONE_API_KEY");
    }

    pineconeClient = new Pinecone({ apiKey });
    return pineconeClient;
}
const groqApiKey = process.env.GROQ_API_KEY || "";
const groqEmbedModel = process.env.GROQ_EMBED_MODEL_ID || "nomic-embed-text-v1_5";
const groqBaseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

export async function embedTextWithGroq(text: string) {
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

function chunkTranscriptText(text: string, maxWords = 300) {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(" "));
    }
    return chunks;
}

export async function processTranscript(
    meetingId: string,
    userId: string,
    transcript: any,
    meetingTitle?: string
) {
    let transcriptText = "";
    if (Array.isArray(transcript)) {
        transcriptText = transcript
            .map((item: any) => `[${item.speaker || "Speaker"}] ${item.words?.map((w: any) => w.word).join(" ") || item.text || ""}`)
            .join("\n");
    } else if (typeof transcript === "string") {
        transcriptText = transcript;
    }

    if (!transcriptText.trim()) {
        return 0;
    }

    const chunks = chunkTranscriptText(transcriptText).filter((chunk) => chunk.trim().length > 0);
    if (chunks.length === 0) {
        return 0;
    }

    const vectors: any[] = [];

    for (const [idx, chunk] of chunks.entries()) {
        const vector = await embedTextWithGroq(chunk);
        vectors.push({
            id: `${meetingId}-chunk-${idx}`,
            values: vector,
            metadata: {
                meetingId,
                userId,
                text: chunk,
                meetingTitle: meetingTitle || "Untitled Meeting",
            },
        });
    }

    const indexName = process.env.PINECONE_INDEX || "zap-bot";
    await getPineconeClient().Index(indexName).upsert({ records: vectors });

    console.log(`✅ Indexed ${chunks.length} chunks to Pinecone for meeting ${meetingId}`);
    return chunks.length;
}

export async function queryMeetingRAG(userId: string, question: string, meetingId?: string) {
    try {
        const vector = await embedTextWithGroq(question);
        const indexName = process.env.PINECONE_INDEX || "zap-bot";
        const index = getPineconeClient().Index(indexName);

        const filter: any = { userId };
        if (meetingId) {
            filter.meetingId = meetingId;
        }

        const results = await index.query({
            vector,
            topK: 5,
            includeMetadata: true,
            filter
        });

        const context = results.matches
            ?.map((match: any) => match.metadata?.text || "")
            .join("\n\n---\n\n");

        return {
            context,
            sources: results.matches?.map((match: any) => ({
                meetingId: match.metadata?.meetingId,
                text: match.metadata?.text,
                score: match.score
            }))
        };
    } catch (error) {
        console.error("Error querying RAG:", error);
        return { context: "", sources: [] };
    }
}
