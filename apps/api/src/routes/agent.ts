import { Router } from "express";
import { store } from "../store.js";
import { pageIndexChat } from "../services/pageindex.js";

export const agentRouter: Router = Router();

type AgentHistoryItem = {
    role: "user" | "assistant";
    content: string;
};

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || "http://localhost:8000";
const DEFAULT_BRIDGE_MODE = process.env.AGENT_BRIDGE_MODE || "auto";

async function callPythonAgent(message: string, history: AgentHistoryItem[]) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
        const res = await fetch(`${PYTHON_AGENT_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history }),
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`Python agent returned ${res.status}`);
        }

        const json = await res.json() as { success?: boolean; response?: string; error?: string };
        if (!json.response) {
            throw new Error(json.error || "Python agent did not return a response");
        }

        return json.response;
    } finally {
        clearTimeout(timeout);
    }
}

async function callNodeFallback(message: string, history: AgentHistoryItem[]) {
    const meetings = store.getAllMeetings();
    const sourceIds = meetings.map(m => `pageindex-${m.id}`);

    // History combined with query
    const contextBonus = history.slice(-3).map(h => `${h.role}: ${h.content}`).join("\n");
    const query = `${contextBonus}\n\nUser Question: ${message}`;

    const answer = await pageIndexChat(query, sourceIds);
    return answer;
}

agentRouter.get("/health", async (_req, res) => {
    let pythonOk = false;
    try {
        const ping = await fetch(`${PYTHON_AGENT_URL}/health`);
        pythonOk = ping.ok;
    } catch {
        pythonOk = false;
    }

    res.json({
        success: true,
        data: {
            node: "ok",
            pythonAgent: pythonOk ? "ok" : "down",
            mode: DEFAULT_BRIDGE_MODE,
            pythonUrl: PYTHON_AGENT_URL,
        },
    });
});

agentRouter.post("/chat", async (req, res) => {
    const body = req.body as {
        message?: string;
        history?: AgentHistoryItem[];
        mode?: "auto" | "python" | "node";
    };
    const message = body.message?.trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const mode = body.mode || (DEFAULT_BRIDGE_MODE as "auto" | "python" | "node");

    if (!message) {
        res.status(400).json({ success: false, error: "message is required" });
        return;
    }

    const errors: string[] = [];

    if (mode === "python" || mode === "auto") {
        try {
            const response = await callPythonAgent(message, history);
            res.json({
                success: true,
                response,
                backend: "python",
            });
            return;
        } catch (error) {
            errors.push(error instanceof Error ? error.message : "Python agent failed");
            if (mode === "python") {
                res.status(502).json({ success: false, error: errors[0] });
                return;
            }
        }
    }

    try {
        const response = await callNodeFallback(message, history);
        res.json({
            success: true,
            response,
            backend: "pageindex-fallback",
            warning: errors[0],
        });
    } catch (error) {
        const nodeError = error instanceof Error ? error.message : "PageIndex fallback failed";
        res.status(500).json({
            success: false,
            error: "All agent backends failed",
            details: [...errors, nodeError],
        });
    }
});
