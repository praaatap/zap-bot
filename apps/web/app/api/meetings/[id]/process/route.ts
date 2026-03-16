import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    uploadRecordingFromUrl,
    uploadTranscriptToS3,
    invokeMeetingProcessor,
    getRecordingUrl,
    getObjectStorageProvider,
    isRecordingStoredInR2,
    resolveRecordingUrl,
} from "@/lib/aws";
import { indexTranscriptChunks } from "@/lib/pinecone";
import {
    generateMeetingSummary,
    extractActionItems,
    generateMeetingHighlights,
} from "@/lib/groq";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meetingId = params.id;

        // Get meeting from database
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: {
                user: true,
            },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        // Verify ownership
        if (meeting.user.clerkId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { action, transcript, recording } = body;

        switch (action) {
            case "upload_transcript": {
                // Upload transcript to S3
                const transcriptKey = await uploadTranscriptToS3(
                    meetingId,
                    JSON.stringify(transcript)
                );

                // Update meeting in database
                await prisma.meeting.update({
                    where: { id: meetingId },
                    data: {
                        transcriptReady: true,
                        transcript: transcript,
                    },
                });

                // Process transcript with Groq AI
                const transcriptText =
                    typeof transcript === "string"
                        ? transcript
                        : transcript.entries?.map((e: any) => `${e.speaker}: ${e.text}`).join("\n") || "";

                const summary = await generateMeetingSummary(transcriptText, meeting.title);

                // Extract action items
                const actionItems = await extractActionItems(transcriptText);

                // Generate highlights
                const highlights = await generateMeetingHighlights(transcriptText);

                // Update meeting with AI insights
                await prisma.meeting.update({
                    where: { id: meetingId },
                    data: {
                        summary: summary.summary,
                        actionItems: actionItems,
                        processed: true,
                        processedAt: new Date(),
                    },
                });

                // Index transcript in Pinecone for RAG
                if (transcript.entries && Array.isArray(transcript.entries)) {
                    await indexTranscriptChunks(
                        meetingId,
                        transcript.entries.map((e: any) => ({
                            text: e.text,
                            speaker: e.speaker,
                            timestamp: e.timestamp,
                        }))
                    );
                    
                    await prisma.meeting.update({
                        where: { id: meetingId },
                        data: {
                            ragProcessed: true,
                            ragProcessedAt: new Date(),
                        },
                    });
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        summary,
                        actionItems,
                        highlights,
                        transcriptKey,
                    },
                });
            }

            case "upload_recording": {
                const recordingUrl = body.recordingUrl;

                if (!recordingUrl || typeof recordingUrl !== "string") {
                    return NextResponse.json(
                        { error: "recordingUrl is required" },
                        { status: 400 }
                    );
                }

                let storedRecordingKey = recordingUrl;
                // If it's a remote provider URL, copy it into object storage.
                if (/^https?:\/\//i.test(recordingUrl)) {
                    storedRecordingKey = await uploadRecordingFromUrl(meetingId, recordingUrl);
                }

                await prisma.meeting.update({
                    where: { id: meetingId },
                    data: {
                        recordingUrl: storedRecordingKey,
                    },
                });

                const resolvedUrl = storedRecordingKey.startsWith("recordings/")
                    ? await getRecordingUrl(storedRecordingKey)
                    : storedRecordingKey;

                return NextResponse.json({
                    success: true,
                    data: {
                        recordingUrl: resolvedUrl,
                        storageKey: storedRecordingKey,
                        recordingStoredInR2: isRecordingStoredInR2(storedRecordingKey),
                        objectStorageProvider: getObjectStorageProvider(),
                    },
                });
            }

            case "invoke_processor": {
                // Invoke Lambda for async processing
                if (!meeting.recordingUrl) {
                    return NextResponse.json(
                        { error: "No recording URL available" },
                        { status: 400 }
                    );
                }

                const result = await invokeMeetingProcessor(
                    meetingId,
                    meeting.recordingUrl
                );

                await prisma.meeting.update({
                    where: { id: meetingId },
                    data: {
                        botSent: true,
                    },
                });

                return NextResponse.json({
                    success: true,
                    data: result,
                });
            }

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Error processing meeting:", error);
        return NextResponse.json(
            {
                error: "Failed to process meeting",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// Get meeting details with processed data
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meetingId = params.id;

        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: {
                user: true,
                TranscriptChunk: {
                    orderBy: { chunkIndex: "asc" },
                },
            },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.user.clerkId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Generate signed URL for recording if available
        const recordingUrl = await resolveRecordingUrl(meeting.recordingUrl);

        return NextResponse.json({
            success: true,
            data: {
                ...meeting,
                joinedConfirmed: Boolean(meeting.botJoinedAt),
                recordingStoredInR2: isRecordingStoredInR2(meeting.recordingUrl),
                objectStorageProvider: getObjectStorageProvider(),
                recordingStorageKey: meeting.recordingUrl,
                recordingUrl,
            },
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        return NextResponse.json(
            { error: "Failed to fetch meeting" },
            { status: 500 }
        );
    }
}
