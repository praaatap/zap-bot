import { Router } from "express";
import { store } from "../store.js";
import { uploadRecording, uploadTranscript } from "../services/aws.js";
import { indexTranscript } from "../services/pageindex.js";
import type { WebhookEvent, BotStatus } from "@repo/shared";

export const webhooksRouter: Router = Router();

/**
 * POST /api/webhooks/meeting-baas
 * Receive webhook events from Meeting BaaS
 */
webhooksRouter.post("/meeting-baas", async (req, res) => {
    const event = req.body as WebhookEvent;

    console.log(`📨 Webhook received: ${event.type} for meeting ${event.meetingId}`);

    try {
        switch (event.type) {
            case "bot.joining": {
                store.upsertMeeting({
                    id: event.meetingId,
                    botId: event.botId,
                    botStatus: "joining" as BotStatus,
                });
                break;
            }

            case "bot.joined": {
                store.upsertMeeting({
                    id: event.meetingId,
                    botId: event.botId,
                    botStatus: "in_meeting" as BotStatus,
                });
                break;
            }

            case "meeting.started": {
                store.upsertMeeting({
                    id: event.meetingId,
                    botStatus: "recording" as BotStatus,
                });
                break;
            }

            case "bot.transcript": {
                const transcriptData = event.data as any;
                if (transcriptData && transcriptData.text) {
                    store.appendTranscriptEntry(event.meetingId, {
                        speaker: transcriptData.speaker || "Unknown",
                        text: transcriptData.text,
                        startTime: transcriptData.start_time || 0,
                        endTime: transcriptData.end_time || 0,
                    });

                    // Ensure meeting is marked as recording if we get live transcripts
                    const meeting = store.getMeeting(event.meetingId);
                    if (meeting && meeting.botStatus !== "recording") {
                        store.upsertMeeting({
                            id: event.meetingId,
                            botStatus: "recording" as BotStatus,
                        });
                    }
                }
                break;
            }

            case "recording.ready": {
                // Upload recording to S3
                const recordingUrl = (event.data?.recording_url as string) || "";
                if (recordingUrl) {
                    try {
                        const s3Key = `recordings/${event.meetingId}.mp4`;
                        const recordingBuffer = await fetch(recordingUrl).then((r) => r.arrayBuffer());
                        await uploadRecording(s3Key, Buffer.from(recordingBuffer));
                        store.upsertMeeting({
                            id: event.meetingId,
                            recordingUrl,
                            s3RecordingKey: s3Key,
                        });
                    } catch (err) {
                        console.error("Failed to upload recording to S3:", err);
                    }
                }
                break;
            }

            case "transcription.ready": {
                // Store transcript and upload to S3
                const transcriptData = event.data?.transcript as Array<{
                    speaker: string;
                    text: string;
                    start_time: number;
                    end_time: number;
                }> || [];

                const transcript = {
                    meetingId: event.meetingId,
                    language: (event.data?.language as string) || "en",
                    createdAt: new Date().toISOString(),
                    entries: transcriptData.map((e) => ({
                        speaker: e.speaker,
                        text: e.text,
                        startTime: e.start_time,
                        endTime: e.end_time,
                    })),
                };

                store.setTranscript(transcript);

                try {
                    const s3Key = `transcripts/${event.meetingId}.json`;
                    await uploadTranscript(s3Key, JSON.stringify(transcript));
                    store.upsertMeeting({
                        id: event.meetingId,
                        s3TranscriptKey: s3Key,
                    });

                    // Index for PageIndex AI RAG (Production reasoning source)
                    const transcriptText = transcript.entries.map(e => `${e.speaker}: ${e.text}`).join("\n");
                    void indexTranscript(event.meetingId, transcriptText, "Meeting Transcript");
                } catch (err) {
                    console.error("Failed to upload transcript to S3:", err);
                }
                break;
            }

            case "meeting.completed": {
                const duration = (event.data?.duration as number) || 0;
                const participants = (event.data?.participants as string[]) || [];
                store.upsertMeeting({
                    id: event.meetingId,
                    botStatus: "completed" as BotStatus,
                    endTime: new Date().toISOString(),
                    duration,
                    participants,
                });
                break;
            }

            case "bot.left": {
                // Bot left but meeting may still be processing
                console.log(`Bot left meeting ${event.meetingId}`);
                break;
            }

            default:
                console.warn(`Unknown webhook event type: ${event.type}`);
        }

        res.json({ success: true, received: event.type });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Webhook processing failed",
        });
    }
});
