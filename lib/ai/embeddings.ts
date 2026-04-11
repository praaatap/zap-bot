import { pipeline } from '@xenova/transformers';

/**
 * Local Embedding Engine using Transformers.js (Xenova)
 * This runs entirely in your Node.js runtime, providing FREE embeddings.
 */

let embedder: any = null;

/**
 * Initialize the embedding pipeline.
 * Uses the small but powerful all-MiniLM-L6-v2 model.
 */
async function initEmbedder() {
    if (!embedder) {
        console.log("[AI] Initializing local embedding engine (all-MiniLM-L6-v2)...");
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embedder;
}

/**
 * Generate a vector for a given text.
 * @param text The text to embed
 * @returns An array of floating point numbers representing the vector
 */
export async function getEmbeddings(text: string): Promise<number[]> {
    try {
        const pipe = await initEmbedder();
        const output = await pipe(text, { 
            pooling: 'mean', 
            normalize: true 
        });
        
        // Convert to standard array for storage
        return Array.from(output.data);
    } catch (error) {
        console.error("[AI] Embedding generation failed:", error);
        throw new Error("Failed to generate local embeddings");
    }
}
