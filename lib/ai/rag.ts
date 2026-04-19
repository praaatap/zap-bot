import { getEmbeddings } from "./embeddings";
import { storeChunks, querySimilar, VectorChunk } from "./vector-store";
import { transcriptToText } from "@/lib/transcript";

/**
 * Intelligent RAG (Retrieval-Augmented Generation) Service
 * Refactored to use local embeddings and Appwrite storage.
 */

/**
 * Split transcript text into chunks for optimal context retrieval.
 */
function chunkText(text: string, maxWords = 250): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
        // Overlay chunks slightly for better context continuity
        const start = i;
        const end = i + maxWords;
        chunks.push(words.slice(start, end).join(" "));
    }
    return chunks;
}

/**
 * Process a meeting transcript: chunk, embed, and store in Appwrite.
 */
export async function processTranscriptForRAG(params: {
    meetingId: string;
    userId: string;
    transcript: any;
    meetingTitle?: string;
}) {
    const { meetingId, userId, transcript } = params;
    const transcriptText = transcriptToText(transcript);

    if (!transcriptText.trim()) {
        console.warn(`[RAG] Empty transcript for meeting ${meetingId}, skipping indexing.`);
        return 0;
    }

    const textChunks = chunkText(transcriptText);
    const vectorChunks: VectorChunk[] = [];

    console.log(`[RAG] Processing ${textChunks.length} chunks for meeting ${meetingId}...`);

    for (const chunk of textChunks) {
        if (chunk.trim().length < 10) continue; // Skip tiny chunks
        
        const embedding = await getEmbeddings(chunk);
        vectorChunks.push({
            userId,
            meetingId,
            text: chunk,
            embedding
        });
    }

    if (vectorChunks.length > 0) {
        await storeChunks(vectorChunks);
    }

    return vectorChunks.length;
}

/**
 * Query the RAG system to find relevant context for a question.
 */
export async function queryRAG(params: {
    userId: string;
    question: string;
    meetingId?: string;
    topK?: number;
}) {
    const { userId, question, meetingId, topK = 5 } = params;

    try {
        const queryVector = await getEmbeddings(question);
        
        const results = await querySimilar({
            userId,
            vector: queryVector,
            meetingId,
            limit: topK
        });

        const context = results
            .map((res: any) => res.text)
            .join("\n\n---\n\n");

        return {
            context,
            sources: results.map((res: any) => ({
                meetingId: res.meetingId,
                score: res.score
            }))
        };
    } catch (error) {
        console.error("[RAG] Query failed:", error);
        return { context: "", sources: [] };
    }
}
