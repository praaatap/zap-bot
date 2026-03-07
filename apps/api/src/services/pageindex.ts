/**
 * PageIndex AI Service
 * Vectorless, reasoning-based RAG for complex document analysis.
 */

const PAGEINDEX_API_KEY = process.env.PAGEINDEX_API_KEY || "";
const PAGEINDEX_API_URL = "https://api.pageindex.ai/v1";

export interface PageIndexSource {
    id: string;
    title: string;
    type: "transcript" | "document";
}

export async function indexTranscript(meetingId: string, transcript: string, title: string) {
    if (!PAGEINDEX_API_KEY) {
        console.warn("⚠️ PAGEINDEX_API_KEY not found. Mocking indexing.");
        return { sourceId: `pageindex-${meetingId}` };
    }

    try {
        const response = await fetch(`${PAGEINDEX_API_URL}/sources`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${PAGEINDEX_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                content: transcript,
                metadata: { meetingId }
            }),
        });

        const data = await response.json();
        return { sourceId: data.id };
    } catch (err) {
        console.error("❌ PageIndex indexing error:", err);
        throw err;
    }
}

export async function pageIndexChat(query: string, sourceIds: string[]) {
    if (!PAGEINDEX_API_KEY) {
        return `[PageIndex Mock] Reasoning across sources ${sourceIds.join(", ")} for query: "${query}". 
        Since this is vectorless RAG, I've analyzed the entire tree structure to find the answer.`;
    }

    try {
        const response = await fetch(`${PAGEINDEX_API_URL}/chat`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${PAGEINDEX_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                sourceIds,
                stream: false,
                reasoning: true // Enable agentic reasoning
            }),
        });

        const data = await response.json();
        return data.answer || "No answer returned from PageIndex AI";
    } catch (err) {
        console.error("❌ PageIndex Chat error:", err);
        throw err;
    }
}
