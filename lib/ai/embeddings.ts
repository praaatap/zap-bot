import { getRequestExecutionContext } from "vinext/shims/request-context";

/**
 * Cloudflare Workers AI Embedding Engine
 * This uses Cloudflare's GPUs to generate embeddings, keeping the bundle TINY.
 */

/**
 * Generate a vector for a given text.
 * @param text The text to embed
 * @returns An array of floating point numbers representing the vector
 */
export async function getEmbeddings(text: string): Promise<number[]> {
    try {
        const ctx = getRequestExecutionContext();
        
        // If we are in local development and AI isn't available, or in a non-worker context
        if (!ctx?.env?.AI) {
            console.warn("[AI] AI binding not found, falling back to empty vector (check wrangler.jsonc)");
            return new Array(384).fill(0); // all-MiniLM-L6-v2 dimension
        }

        const output = await ctx.env.AI.run("@cf/baai/bge-small-en-v1.5", {
            text: [text]
        });
        
        return output.data[0];
    } catch (error) {
        console.error("[AI] Embedding generation failed:", error);
        throw new Error("Failed to generate AI embeddings");
    }
}
