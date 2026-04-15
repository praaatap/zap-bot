import { OpenAI } from 'openai';

/**
 * OpenAI Embedding Engine
 * This uses the text-embedding-3-small model for high-efficiency vectors.
 */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Generate a vector for a given text using OpenAI.
 * @param text The text to embed
 * @returns An array of floating point numbers representing the vector
 */
export async function getEmbeddings(text: string): Promise<number[]> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("[AI] OPENAI_API_KEY is missing, returning zero vector for now.");
            return new Array(1536).fill(0); // OpenAI small model uses 1536 dims
        }

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.replace(/\n/g, " "),
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error("[AI] OpenAI Embedding generation failed:", error);
        // Fallback to zero vector to prevent total failure in production
        return new Array(1536).fill(0);
    }
}
