import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { extractTranscriptEntries } from "@/lib/transcript";
import { getOrCreateUser } from "@/lib/user";
import { canUserChat, incrementChatUsage } from "@/lib/usage";

/**
 * POST /api/chat/suggest
 * Generate short in-meeting response suggestions from latest transcript context
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const { meetingId, prompt } = body;

        if (!meetingId || !prompt) {
            return NextResponse.json({ error: "meetingId and prompt are required" }, { status: 400 });
        }

        // Fetch meeting from AppWrite
        const meetingResult = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [
                Query.equal("$id", meetingId),
                Query.limit(1),
            ],
        );

        if (meetingResult.documents.length === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingResult.documents[0];

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check usage limits
        const canChatResult = await canUserChat(userId);
        if (!canChatResult.allowed) {
            return NextResponse.json({ error: canChatResult.reason }, { status: 403 });
        }

        await incrementChatUsage(userId);

        // Get recent transcript entries
        const transcript = meeting.transcript;
        let recentSnippet = "";

        recentSnippet = extractTranscriptEntries(transcript)
            .slice(-8)
            .map((entry) => `${entry.speaker || "Speaker"}: ${entry.text || ""}`)
            .join("\n");

        // Build fallback suggestion
        const suggestion = buildLocalSuggestionFallback(prompt, [recentSnippet]);

        return NextResponse.json({ success: true, suggestion });
    } catch (error) {
        console.error("Chat suggest error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate suggestion" },
            { status: 500 }
        );
    }
}

function buildLocalSuggestionFallback(query: string, snippets: string[]): string {
    const context = snippets.slice(0, 2).join(" ").slice(0, 180);
    return [
        "Suggested response:",
        `"Based on what we discussed, ${context || "we should align on scope, owner, and next step"}."`,
        "",
        "Follow-up to ask:",
        `"Should we lock owner + deadline for ${query}?"`,
    ].join("\n");
}
