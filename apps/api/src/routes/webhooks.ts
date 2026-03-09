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
    const webhook = req.body;
    console.log(`📨 Webhook received: ${webhook.type || webhook.event}`);

    try {
        // Handle MeteorBot style 'complete' event
        if (webhook.event === "complete") {
            const data = webhook.data;
            const botId = data.bot_id;

            // Find meeting by botId in store
            const meeting = store.getAllMeetings().find(m => m.botId === botId);

            if (!meeting) {
                console.error("meeting not found for bot id:", botId);
                return res.status(404).json({ error: "meeting not found" });
            }

            console.log(`Processing completed meeting: ${meeting.id}`);

            const transcriptReady = !!data.transcript;
            const recordingUrl = data.mp4 || data.recording_url || null;

            store.upsertMeeting({
                id: meeting.id,
                botStatus: "completed" as BotStatus,
                endTime: new Date().toISOString(),
                transcriptReady: transcriptReady,
                recordingUrl: recordingUrl,
                participants: data.speakers || [],
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
                    // Mock entries from text if needed, or just set it
                    transcriptEntries = [{ speaker: "Meeting", text: transcriptText, startTime: 0, endTime: 0 }];
                }

                const transcript = {
                    meetingId: meeting.id,
                    language: data.language || "en",
                    createdAt: new Date().toISOString(),
                    entries: transcriptEntries,
                };

                store.setTranscript(transcript);

                // S3 and RAG integration
                try {
                    const transcriptKey = `transcripts/${meeting.id}.json`;
                    await uploadTranscript(transcriptKey, JSON.stringify(transcript));

                    if (recordingUrl) {
                        const recordingKey = `recordings/${meeting.id}.mp4`;
                        const recordingBuffer = await fetch(recordingUrl).then((r) => r.arrayBuffer());
                        await uploadRecording(recordingKey, Buffer.from(recordingBuffer));
                        store.upsertMeeting({
                            id: meeting.id,
                            s3RecordingKey: recordingKey,
                            s3TranscriptKey: transcriptKey,
                        });
                    }

                    // Index for RAG
                    void indexTranscript(meeting.id, transcriptText, "Meeting Transcript");
                } catch (err) {
                    console.error("Failed to sync completed meeting data to S3/RAG:", err);
                }
            }

            return res.json({ success: true, message: "meeting processed successfully", meetingId: meeting.id });
        }

        // Maintain old zap-bot event handlers for backward compatibility / other events
        const event = webhook as any;
        const meetingId = event.meetingId || (store.getAllMeetings().find(m => m.botId === event.botId)?.id);

        if (!meetingId) {
            console.warn(`Could not determine meeting ID for event: ${event.type || webhook.event}`);
            return res.json({ success: true, message: "Event received but no meeting ID found" });
        }

        switch (event.type) {
            case "bot.joining":
                store.upsertMeeting({ id: meetingId, botId: event.botId, botStatus: "joining" as BotStatus });
                break;
            case "bot.joined":
                store.upsertMeeting({ id: meetingId, botId: event.botId, botStatus: "in_meeting" as BotStatus });
                break;
            case "meeting.started":
                store.upsertMeeting({ id: meetingId, botStatus: "recording" as BotStatus });
                break;
            case "bot.transcript": {
                const transcriptData = event.data as any;
                if (transcriptData && transcriptData.text) {
                    store.appendTranscriptEntry(meetingId, {
                        speaker: transcriptData.speaker || "Unknown",
                        text: transcriptData.text,
                        startTime: transcriptData.start_time || 0,
                        endTime: transcriptData.end_time || 0,
                    });
                }
                break;
            }
            // Add other cases as needed...
        }

        res.json({ success: true, received: event.type || webhook.event });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Webhook processing failed",
        });
    }
});
