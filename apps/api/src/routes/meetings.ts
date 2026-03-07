import { Router } from "express";
import { store } from "../store.js";
import { invokeProcessing } from "../services/aws.js";
import { dispatchBotForManualMeeting } from "../services/meeting-bot.js";
import { triggerPostMeetingFlow } from "../services/automations.js";
import { postToSlack } from "../services/slack.js";
import { syncActionItems } from "../services/pm-sync.js";
import { indexTranscript } from "../services/pageindex.js";
import type { ApiResponse, Meeting, Transcript, DashboardStats } from "@repo/shared";

export const meetingsRouter: Router = Router();

/**
 * POST /api/meetings/join
 * Manually dispatch bot for a meeting URL
 */
meetingsRouter.post("/join", async (req, res) => {
    const { title, meetingUrl, startTime, participants } = req.body;

    if (!meetingUrl || typeof meetingUrl !== "string") {
        res.status(400).json({ success: false, error: "meetingUrl is required" });
        return;
    }

    try {
        const meeting = await dispatchBotForManualMeeting({
            title: title?.trim() || "Ad-hoc Meeting",
            meetingUrl: meetingUrl.trim(),
            startTime,
            participants: Array.isArray(participants) ? participants : [],
        });

        res.json({ success: true, data: meeting } satisfies ApiResponse<Meeting>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to dispatch bot",
        } satisfies ApiResponse<never>);
    }
});

/**
 * GET /api/meetings
 * List all meetings
 */
meetingsRouter.get("/", (_req, res) => {
    const meetings = store.getAllMeetings();
    res.json({ success: true, data: meetings } satisfies ApiResponse<Meeting[]>);
});

/**
 * GET /api/meetings/stats
 * Get dashboard statistics
 */
meetingsRouter.get("/stats", (_req, res) => {
    const stats = store.getStats();
    res.json({ success: true, data: stats } satisfies ApiResponse<DashboardStats>);
});

/**
 * GET /api/meetings/:id
 * Get meeting details
 */
meetingsRouter.get("/:id", (req, res) => {
    const meeting = store.getMeeting(req.params.id);
    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" });
        return;
    }

    const transcript = store.getTranscript(meeting.id);
    res.json({
        success: true,
        data: { meeting, transcript },
    } satisfies ApiResponse<{ meeting: Meeting; transcript?: Transcript }>);
});

/**
 * POST /api/meetings/:id/process
 * Trigger Lambda processing for a meeting
 */
meetingsRouter.post("/:id/process", async (req, res) => {
    const meeting = store.getMeeting(req.params.id);
    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" });
        return;
    }

    try {
        const result = await invokeProcessing(meeting.id, {
            s3RecordingKey: meeting.s3RecordingKey,
            s3TranscriptKey: meeting.s3TranscriptKey,
        });

        store.upsertMeeting({
            id: meeting.id,
            botStatus: "processing",
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Processing failed",
        });
    }
});

/**
 * POST /api/meetings/:id/ai-result
 * Receive AI processing results from Lambda
 */
meetingsRouter.post("/:id/ai-result", (req, res) => {
    const meeting = store.getMeeting(req.params.id);
    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" });
        return;
    }

    const { summary, actionItems, sentiment, healthScore, chapters, highlights } = req.body;

    store.upsertMeeting({
        id: meeting.id,
        summary,
        actionItems: Array.isArray(actionItems) ? actionItems : [],
        sentiment: sentiment || "Collaborative",
        healthScore: typeof healthScore === "number" ? healthScore : 8.5,
        chapters: Array.isArray(chapters) ? chapters : [],
        highlights: Array.isArray(highlights) ? highlights : [],
        botStatus: "completed"
    });

    const transcript = store.getTranscript(meeting.id);
    if (transcript) {
        void indexTranscript(meeting.id, transcript.entries.map(e => `${e.speaker}: ${e.text}`).join("\n"), meeting.title);
    }

    // Trigger post-meeting automations
    void triggerPostMeetingFlow(meeting.id);

    res.json({ success: true });
});

/**
 * POST /api/meetings/:id/share-slack
 * Share summary to a Slack channel
 */
meetingsRouter.post("/:id/share-slack", async (req, res) => {
    const { channelId } = req.body;
    const meeting = store.getMeeting(req.params.id);

    if (!meeting || !channelId) {
        res.status(400).json({ success: false, error: "Meeting or channelId not found" });
        return;
    }

    try {
        const result = await postToSlack(channelId, `*Summary:* ${meeting.summary}\n\n*Draft:* ${meeting.followUpDraft}`);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: "Slack share failed" });
    }
});

/**
 * POST /api/meetings/:id/sync-pm
 * Sync action items to Jira/Asana/Trello
 */
meetingsRouter.post("/:id/sync-pm", async (req, res) => {
    const { platform, workspaceId, projectId, apiKey } = req.body;
    const meeting = store.getMeeting(req.params.id);

    if (!meeting || !platform) {
        res.status(400).json({ success: false, error: "Invalid sync request" });
        return;
    }

    try {
        const result = await syncActionItems(meeting.id, meeting.actionItems || [], {
            platform, apiKey, workspaceId, projectId
        });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: "PM sync failed" });
    }
});
