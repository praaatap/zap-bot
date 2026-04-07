import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadRecordingToS3, uploadTranscriptToS3 } from "@/lib/aws";
import { indexTranscriptChunks } from "@/lib/pinecone";

/**
 * POST /api/webhooks/meeting-baas
 * Receive webhook events from Meeting BaaS
 */
export async function POST(request: NextRequest) {
    try {
        const webhook = await request.json();
        console.log(`📨 Webhook received: ${webhook.type || webhook.event}`);

        // Handle MeteorBot style 'complete' event
        if (webhook.event === "complete") {
            const data = webhook.data;
            const botId = data.bot_id;

            // Find meeting by botId
            const meeting = await prisma.meeting.findFirst({
                where: { botId: botId || undefined },
            });

            if (!meeting) {
                console.error("Meeting not found for bot id:", botId);
                return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
            }

            console.log(`Processing completed meeting: ${meeting.id}`);

            const transcriptReady = !!data.transcript;
            const recordingUrl = data.mp4 || data.recording_url || null;

            await prisma.meeting.update({
                where: { id: meeting.id },
                data: {
                    endTime: new Date(),
                    transcriptReady,
                    recordingUrl,
                },
            });

            if (data.transcript) {
                let transcriptEntries: any[] = [];
                let transcriptText = "";

                if (Array.isArray(data.transcript)) {
                    transcriptEntries = data.transcript.map((item: any) => ({
                        speaker: item.speaker || "Speaker",
                        text: item.words ? item.words.map((w: any) => w.word).join(" ") : (item.text || ""),
                        startTime: item.start || 0,
                        endTime: item.end || 0,
                    }));
                    transcriptText = transcriptEntries.map(e => `${e.speaker}: ${e.text}`).join("\n");
                } else if (typeof data.transcript === "string") {
                    transcriptText = data.transcript;
                    transcriptEntries = [{ speaker: "Meeting", text: transcriptText, startTime: 0, endTime: 0 }];
                }

                const transcript = {
                    meetingId: meeting.id,
                    language: data.language || "en",
                    createdAt: new Date().toISOString(),
                    entries: transcriptEntries,
                };

                await prisma.meeting.update({
                    where: { id: meeting.id },
                    data: { transcript },
                });

                // S3 and RAG integration
                try {
                    const transcriptString = JSON.stringify(transcript);
                    await uploadTranscriptToS3(meeting.id, transcriptString);

                    if (recordingUrl) {
                        const recordingKey = `recordings/${meeting.id}.mp4`;
                        const recordingResponse = await fetch(recordingUrl);
                        const recordingBuffer = await recordingResponse.arrayBuffer();
                        const buffer = Buffer.from(recordingBuffer);
                        await uploadRecordingToS3(recordingKey, buffer, "video/mp4");
                        await prisma.meeting.update({
                            where: { id: meeting.id },
                            data: { recordingUrl: recordingKey },
                        });
                    }

                    // Index for RAG
                    if (transcriptEntries.length > 0) {
                        const chunks = transcriptEntries.map((e, idx) => ({
                            text: e.text,
                            speaker: e.speaker,
                            timestamp: e.startTime * 1000,
                        }));
                        await indexTranscriptChunks(meeting.id, chunks);
                    }
                } catch (err) {
                    console.error("Failed to sync completed meeting data to S3/RAG:", err);
                }
            }

            return NextResponse.json({ success: true, message: "Meeting processed successfully", meetingId: meeting.id });
        }

        // Handle other webhook events
        const event = webhook;
        const existingMeeting = await prisma.meeting.findFirst({
            where: { botId: event.botId },
        });
        const meetingId = event.meetingId || existingMeeting?.id;

        if (!meetingId) {
            console.warn(`Could not determine meeting ID for event: ${event.type || webhook.event}`);
            return NextResponse.json({ success: true, message: "Event received but no meeting ID found" });
        }

        switch (event.type) {
            case "bot.joining":
                await prisma.meeting.update({
                    where: { id: meetingId },
                    data: { botId: event.botId },
                });
                break;
            case "bot.joined":
                await prisma.meeting.update({
                    where: { id: meetingId },
                    data: { botId: event.botId },
                });
                break;
            case "meeting.started":
                // Meeting started recording
                break;
            case "bot.transcript": {
                const transcriptData = event.data as any;
                if (transcriptData && transcriptData.text) {
                    const meeting = await prisma.meeting.findUnique({
                        where: { id: meetingId },
                    });

                    const currentTranscript = meeting?.transcript || [];
                    const newEntry = {
                        speaker: transcriptData.speaker || "Unknown",
                        text: transcriptData.text,
                        startTime: transcriptData.start_time || 0,
                        endTime: transcriptData.end_time || 0,
                    };

                    const updatedTranscript = Array.isArray(currentTranscript)
                        ? [...currentTranscript, newEntry]
                        : [newEntry];

                    await prisma.meeting.update({
                        where: { id: meetingId },
                        data: { transcript: updatedTranscript },
                    });
                }
                break;
            }
        }

        return NextResponse.json({ success: true, received: event.type || webhook.event });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Webhook processing failed" },
            { status: 500 }
        );
    }
}
