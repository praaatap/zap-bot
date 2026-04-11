import { NextRequest, NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { queryRAG as queryMeetingRAG } from "@/lib/ai/rag";
import { answerQuestionWithContext as answerMeetingQuestion } from "@/lib/ai/processor";

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
        const res = await fetch(`${PYTHON_AGENT_URL}/api/chat/agent`, {
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
    const meetingDocs = await databases.listDocuments(
        APPWRITE_IDS.databaseId,
        APPWRITE_IDS.meetingsCollectionId,
        [Query.limit(100)]
    );
    const meetings = meetingDocs.documents.map((m: any) => ({ id: m.$id, title: m.title }));

    // Get context from all meetings
    const contextBonus = history.slice(-3).map(h => `${h.role}: ${h.content}`).join("\n");
    const query = `${contextBonus}\n\nUser Question: ${message}`;

    // Use unified RAG query
    const rag = await queryMeetingRAG({
        userId: "system", // Generic search or we should pass actual userId if available
        question: query
    });
    
    if (rag.context) {
        return answerMeetingQuestion({
            question: message,
            context: rag.context,
            meetingTitle: "Multiple Meetings",
            history: contextBonus
        });
    }

    return "I don't have enough context to answer that question. Please provide more details or ask about a specific meeting.";
}

/**
 * GET /api/agent/health
 * Check agent health status
 */
export async function GET() {
    let pythonOk = false;
    try {
        const ping = await fetch(`${PYTHON_AGENT_URL}/health`);
        pythonOk = ping.ok;
    } catch {
        pythonOk = false;
    }

    return NextResponse.json({
        success: true,
        data: {
            node: "ok",
            pythonAgent: pythonOk ? "ok" : "down",
            mode: DEFAULT_BRIDGE_MODE,
            pythonUrl: PYTHON_AGENT_URL,
        },
    });
}

/**
 * POST /api/agent/chat
 * Chat with the AI agent
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const message = body.message?.trim();
        const history = Array.isArray(body.history) ? body.history : [];
        const mode = body.mode || (DEFAULT_BRIDGE_MODE as "auto" | "python" | "node");

        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const errors: string[] = [];

        if (mode === "python" || mode === "auto") {
            try {
                const response = await callPythonAgent(message, history);
                return NextResponse.json({
                    success: true,
                    response,
                    backend: "python",
                });
            } catch (error) {
                errors.push(error instanceof Error ? error.message : "Python agent failed");
                if (mode === "python") {
                    return NextResponse.json({ error: errors[0] }, { status: 502 });
                }
            }
        }

        try {
            const response = await callNodeFallback(message, history);
            return NextResponse.json({
                success: true,
                response,
                backend: "pageindex-fallback",
                warning: errors[0],
            });
        } catch (error) {
            const nodeError = error instanceof Error ? error.message : "PageIndex fallback failed";
            return NextResponse.json({
                error: "All agent backends failed",
                details: [...errors, nodeError],
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Agent chat error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Agent chat failed" },
            { status: 500 }
        );
    }
}
