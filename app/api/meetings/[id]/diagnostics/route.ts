import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const p = await params;
        const user = await getOrCreateUser(userId);

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", p.id), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;
        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const summaryText = typeof meeting.summary === "string" ? meeting.summary.trim() : "";
        const processingStatus = String(meeting.processingStatus || "pending").toLowerCase();

        return NextResponse.json({
            success: true,
            data: {
                meetingId: meeting.$id,
                title: meeting.title,
                processingStatus,
                processingError: meeting.processingError || null,
                eventKeys: {
                    lastWebhookKey: meeting.lastWebhookKey || null,
                    completionEventKey: meeting.completionEventKey || null,
                },
                usage: {
                    counted: Boolean(meeting.usageCountedAt),
                    usageCountedAt: meeting.usageCountedAt || null,
                },
                pipeline: {
                    botSent: Boolean(meeting.botSent),
                    botJoined: Boolean(meeting.botJoinedAt),
                    meetingEnded: Boolean(meeting.meetingEnded),
                    transcriptReady: Boolean(meeting.transcriptReady),
                    processed: Boolean(meeting.processed),
                    ragProcessed: Boolean(meeting.ragProcessed),
                    summaryReady: summaryText.length > 0,
                    emailSent: Boolean(meeting.emailSent),
                },
                timestamps: {
                    startTime: meeting.startTime || null,
                    endTime: meeting.endTime || null,
                    botSentAt: meeting.botSentAt || null,
                    botJoinedAt: meeting.botJoinedAt || null,
                    meetingCompletedAt: meeting.meetingCompletedAt || null,
                    processedAt: meeting.processedAt || null,
                    summaryReadyAt: meeting.summaryReadyAt || null,
                    ragProcessedAt: meeting.ragProcessedAt || null,
                    lastWebhookAt: meeting.lastWebhookAt || null,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching meeting diagnostics:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch meeting diagnostics",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
