import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import { getObjectStorageProvider, isRecordingStoredInR2 } from "@/lib/aws";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const p = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        const stages = {
            botDispatched: meeting.botSent,
            joinedConfirmed: Boolean(meeting.botJoinedAt),
            meetingCompleted: meeting.meetingEnded,
            transcriptReady: meeting.transcriptReady,
            recordingStoredInR2: isRecordingStoredInR2(meeting.recordingUrl),
            ragReady: meeting.ragProcessed,
            summaryReady: Boolean(typeof meeting.summary === "string" && meeting.summary.trim().length > 0),
            usageCounted: Boolean(meeting.usageCountedAt),
        };

        const processingStatus = String(meeting.processingStatus || "pending").toLowerCase();
        const nextStep = processingStatus === "failed"
            ? "inspect_processing_error"
            : !stages.botDispatched
                ? "dispatch_bot"
                : !stages.meetingCompleted
                    ? "wait_for_completion_webhook"
                    : !stages.transcriptReady
                        ? "wait_for_transcript"
                        : !stages.ragReady
                            ? "wait_for_indexing"
                            : "ready_for_chat";

        return NextResponse.json({
            success: true,
            meetingId: meeting.$id,
            stages,
            processingStatus,
            processingError: meeting.processingError || null,
            completionEventKey: meeting.completionEventKey || null,
            lastWebhookKey: meeting.lastWebhookKey || null,
            objectStorageProvider: getObjectStorageProvider(),
            nextStep,
            timestamps: {
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                botSentAt: meeting.botSentAt,
                botJoinedAt: meeting.botJoinedAt,
                meetingCompletedAt: meeting.meetingCompletedAt,
                processedAt: meeting.processedAt,
                summaryReadyAt: meeting.summaryReadyAt,
                ragProcessedAt: meeting.ragProcessedAt,
                usageCountedAt: meeting.usageCountedAt,
            },
        });
    } catch (error) {
        console.error("Error fetching meeting pipeline status:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch meeting pipeline status",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
