import { databases, Query, ID } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";

/**
 * Appwrite-based Vector Store
 * Stores embeddings in the database and performs in-memory similarity search.
 * This is a highly efficient way to provide RAG for small-to-medium datasets
 * without external vector database costs.
 */

export interface VectorChunk {
    userId: string;
    meetingId: string;
    text: string;
    embedding: number[];
}

/**
 * Calculate cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        mA += a[i] * a[i];
        mB += b[i] * b[i];
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    if (!mA || !mB) return 0;
    return dotProduct / (mA * mB);
}

/**
 * Store multiple transcript chunks with their embeddings in Appwrite.
 */
export async function storeChunks(chunks: VectorChunk[]) {
    console.log(`[AI] Storing ${chunks.length} chunks to Appwrite (${APPWRITE_IDS.transcriptChunksCollectionId})...`);
    
    // We process these in sequence or small batches to avoid rate limits if any
    const results = [];
    for (const chunk of chunks) {
        const doc = await databases.createDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.transcriptChunksCollectionId,
            ID.unique(),
            chunk
        );
        results.push(doc);
    }
    return results;
}

/**
 * Query the vector store for the most relevant chunks.
 */
export async function querySimilar(params: {
    userId: string;
    vector: number[];
    meetingId?: string;
    limit?: number;
}) {
    const { userId, vector, meetingId, limit = 5 } = params;

    const queries = [
        Query.equal("userId", userId),
        Query.limit(100), // Fetch a reasonable candidate pool to rank in-memory
        Query.orderDesc("$createdAt")
    ];

    if (meetingId) {
        queries.push(Query.equal("meetingId", meetingId));
    }

    try {
        const { documents } = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.transcriptChunksCollectionId,
            queries
        );

        const scored = documents.map((doc: any) => ({
            text: doc.text,
            meetingId: doc.meetingId,
            score: cosineSimilarity(vector, doc.embedding || [])
        }));

        // Sort by similarity score descending
        return scored
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, limit);
    } catch (error) {
        console.error("[AI] Vector query failed:", error);
        return [];
    }
}

/**
 * Delete all chunks for a specific meeting.
 */
export async function deleteMeetingChunks(meetingId: string) {
    try {
        const { documents } = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.transcriptChunksCollectionId,
            [Query.equal("meetingId", meetingId)]
        );

        for (const doc of documents) {
            await databases.deleteDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.transcriptChunksCollectionId,
                doc.$id
            );
        }
    } catch (error) {
        console.error("[AI] Failed to delete meeting chunks:", error);
    }
}
