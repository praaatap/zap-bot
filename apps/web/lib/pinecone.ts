import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
});

const INDEX_NAME = process.env.PINECONE_INDEX || "zap-bot";

/**
 * Get Pinecone index
 */
export async function getPineconeIndex() {
    return pinecone.index(INDEX_NAME);
}

/**
 * Generate embeddings using Groq
 */
async function generateEmbedding(text: string): Promise<number[]> {
    // Using a simple embedding approach for now
    // In production, you'd use a proper embedding model via Groq or another service
    const response = await fetch("https://api.groq.com/openai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "text-embedding-3-small", // Adjust based on Groq's available models
            input: text,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate embedding");
    }

    const data = await response.json();
    return data.data[0].embedding;
}

/**
 * Store meeting transcript chunks in Pinecone
 */
export async function indexTranscriptChunks(
    meetingId: string,
    chunks: Array<{ text: string; speaker?: string; timestamp?: number }>
): Promise<void> {
    const index = await getPineconeIndex();

    const vectors = await Promise.all(
        chunks.map(async (chunk, idx) => {
            const embedding = await generateEmbedding(chunk.text);

            return {
                id: `${meetingId}-chunk-${idx}`,
                values: embedding,
                metadata: {
                    meetingId,
                    text: chunk.text,
                    speaker: chunk.speaker || "Unknown",
                    timestamp: chunk.timestamp || Date.now(),
                    chunkIndex: idx,
                },
            };
        })
    );

    // Upsert vectors to Pinecone (batch operation)
    if (vectors.length > 0) {
        await index.namespace("").upsert({ records: vectors });
    }
}

/**
 * Query similar transcript chunks
 */
export async function queryTranscripts(
    query: string,
    topK: number = 5,
    meetingId?: string
): Promise<any[]> {
    const index = await getPineconeIndex();

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Query Pinecone
    const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        ...(meetingId && {
            filter: {
                meetingId: { $eq: meetingId },
            },
        }),
    });

    return queryResponse.matches || [];
}

/**
 * Delete meeting data from Pinecone
 */
export async function deleteMeetingVectors(meetingId: string): Promise<void> {
    const index = await getPineconeIndex();

    // Delete all vectors for this meeting
    await index.deleteMany({
        filter: {
            meetingId: { $eq: meetingId },
        },
    });
}

/**
 * Get meeting context for AI queries
 */
export async function getMeetingContext(
    meetingId: string,
    query: string,
    topK: number = 3
): Promise<string> {
    const results = await queryTranscripts(query, topK, meetingId);

    // Combine the most relevant chunks
    const context = results
        .map((match) => {
            const metadata = match.metadata as any;
            return `[${metadata.speaker}]: ${metadata.text}`;
        })
        .join("\n\n");

    return context;
}

/**
 * Generate an answer grounded in meeting transcript context.
 */
export async function answerMeetingQuestion(
    question: string,
    context: string,
    meetingTitle?: string
): Promise<string> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content:
                        "You are Zap Bot, a meeting assistant. Answer using only the provided meeting context. If context is incomplete, clearly say what is missing.",
                },
                {
                    role: "user",
                    content: `Meeting: ${meetingTitle || "Untitled Meeting"}\n\nContext:\n${context}\n\nQuestion: ${question}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Failed to generate answer (${response.status}): ${body}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || "I could not generate an answer right now.";
}
