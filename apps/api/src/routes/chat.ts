import { Router } from "express";
import { store } from "../store.js";
import { pageIndexChat } from "../services/pageindex.js";

export const chatRouter: Router = Router();

function buildLocalSuggestionFallback(query: string, snippets: string[]): string {
    const context = snippets.slice(0, 2).join(" ").slice(0, 180);
    return [
        "Suggested response:",
        `\"Based on what we discussed, ${context || "we should align on scope, owner, and next step"}.\"`,
        "",
        "Follow-up to ask:",
        `\"Should we lock owner + deadline for ${query}?\"`,
    ].join("\n");
}

/**
 * POST /api/chat
 * Ask a question about a specific meeting using PageIndex AI (Vectorless RAG)
 */
chatRouter.post("/", async (req, res) => {
    const { meetingId, query } = req.body;

    if (!meetingId || !query) {
        res.status(400).json({ success: false, error: "meetingId and query are required" });
        return;
    }

    const meeting = store.getMeeting(meetingId);
    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" });
        return;
    }

    try {
        const sourceId = `pageindex-${meetingId}`;
        const answer = await pageIndexChat(query, [sourceId]);

        res.json({ success: true, answer, backend: "pageindex-ai" });
    } catch (error) {
        console.error("PageIndex Chat Error:", error);
        res.json({
            success: true,
            answer: `(Fallback) I encountered an error with PageIndex AI. Based on the transcript summary: ${meeting.summary || "No summary available."}`
        });
    }
});

/**
 * POST /api/chat/all
 * Global RAG chat across all user meetings using PageIndex AI
 */
chatRouter.post("/all", async (req, res) => {
    const { query } = req.body;

    if (!query) {
        res.status(400).json({ success: false, error: "query is required" });
        return;
    }

    try {
        store.addChatMessage({ content: query, isBot: false });

        const meetings = store.getAllMeetings();
        const sourceIds = meetings.map(m => `pageindex-${m.id}`);

        const answer = await pageIndexChat(query, sourceIds);

        store.addChatMessage({ content: answer, isBot: true });

        res.json({ success: true, answer, backend: "pageindex-ai-global" });
    } catch (error) {
        console.error("Chat All Error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * POST /api/chat/suggest
 * Generate short in-meeting response suggestions from latest transcript context
 * Note: Keeping this separate from RAG as it's a real-time copilot feature.
 */
chatRouter.post("/suggest", async (req, res) => {
    const { meetingId, prompt } = req.body;

    if (!meetingId || !prompt) {
        res.status(400).json({ success: false, error: "meetingId and prompt are required" });
        return;
    }

    const meeting = store.getMeeting(meetingId);
    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" });
        return;
    }

    const transcript = store.getTranscript(meetingId);
    const recentEntries = transcript?.entries.slice(-8) || [];
    const snippetText = recentEntries.map((entry) => `${entry.speaker}: ${entry.text}`);

    // Mocking for now to avoid Bedrock dependency in this route rewrite
    res.json({
        success: true,
        suggestion: buildLocalSuggestionFallback(prompt, snippetText)
    });
});
