import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import {
    uploadRecordingFromUrl,
    uploadTranscriptToS3,
    invokeMeetingProcessor,
    getRecordingUrl,
    getObjectStorageProvider,
    isRecordingStoredInR2,
    resolveRecordingUrl,
} from "@/lib/aws";
import { processTranscriptForRAG } from "@/lib/ai/rag";
import {
    generateMeetingSummary,
    extractActionItems,
    generateMeetingHighlights,
} from "@/lib/groq";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const p = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meetingId = p.id;

        // Get meeting from database
        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", meetingId), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;

        // Verify ownership
        const user = await getOrCreateUser(userId);
        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { action, transcript } = body;

        switch (action) {
            case "upload_transcript": {
                // Upload transcript to S3
                const transcriptKey = await uploadTranscriptToS3(
                    meetingId,
                    JSON.stringify(transcript)
                );

                // Update meeting in database
                await databases.updateDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.meetingsCollectionId,
                    meetingId,
                    {
                        transcriptReady: true,
                        transcript: transcript,
                    },
                );

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
                const normalizedHighlights = highlights.map((text) => ({
                    type: "insight",
                    text,
                    timestamp: 0,
                }));

                // Update meeting with AI insights
                const updateData: any = {
                    summary: summary.summary,
                    actionItems: actionItems,
                    highlights: normalizedHighlights,
                    sentiment: summary.sentiment,
                    healthScore: summary.healthScore,
                    topics: summary.topics,
                    processed: true,
                    processedAt: new Date().toISOString(),
                };
                if (summary.title) {
                    updateData.title = summary.title;
                }

                await databases.updateDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.meetingsCollectionId,
                    meetingId,
                    updateData
                );

                // Index transcript in Appwrite for RAG
                if (transcript.entries && Array.isArray(transcript.entries)) {
                    await processTranscriptForRAG({
                        meetingId,
                        userId: user.$id,
                        transcript: transcript.entries,
                        meetingTitle: meeting.title
                    });

                    await databases.updateDocument(
                        APPWRITE_IDS.databaseId,
                        APPWRITE_IDS.meetingsCollectionId,
                        meetingId,
                        {
                            ragProcessed: true,
                            ragProcessedAt: new Date().toISOString(),
                        },
                    );
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        summary,
                        actionItems,
                        highlights: normalizedHighlights,
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

                await databases.updateDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.meetingsCollectionId,
                    meetingId,
                    {
                        recordingUrl: storedRecordingKey,
                    },
                );

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

                await databases.updateDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.meetingsCollectionId,
                    meetingId,
                    {
                        botSent: true,
                    },
                );

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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const p = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meetingId = p.id;

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", meetingId), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;

        const user = await getOrCreateUser(userId);
        if (meeting.userId !== user.$id) {
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
