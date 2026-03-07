import { store } from "../store.js";
import { groqChat } from "./groq.js";

/**
 * Trigger post-meeting automation flow
 * This handles follow-up drafts, task syncing, and team notifications.
 */
export async function triggerPostMeetingFlow(meetingId: string) {
    const meeting = store.getMeeting(meetingId);
    if (!meeting) return;

    console.log(`🚀 Triggering automations for meeting: ${meeting.title}`);

    // 1. Generate AI Follow-up Draft
    let followUpDraft = "";
    try {
        const prompt = `
            Generate a professional meeting follow-up email.
            Title: ${meeting.title}
            Summary: ${meeting.summary}
            Action Items: ${meeting.actionItems?.join(", ")}
            Tone: Professional and concise.
        `.trim();
        followUpDraft = await groqChat(prompt);
    } catch (err) {
        console.warn("Failed to use Groq, falling back to template.");
        followUpDraft = `
## Meeting Follow-up: ${meeting.title}

Hi Team,

Thank you for the productive discussion today. Here is a quick summary of what we covered:

${meeting.summary || "No summary available."}

### Key Action Items:
${(meeting.actionItems || []).map(item => `- [ ] ${item}`).join("\n") || "No specific action items identified."}

Best regards,
Zap Bot
        `.trim();
    }

    store.upsertMeeting({
        id: meetingId,
        followUpDraft,
    });

    // 2. Auto-sync Action Items (Simulated)
    const actionItems = meeting.actionItems || [];
    if (actionItems.length > 0) {
        console.log(`📝 [Simulated] Syncing ${actionItems.length} action items to Jira/Asana...`);
    }

    // 3. Simulated Slack/Discord Notification
    console.log(`🔔 [Simulated] Notification sent to Slack/Discord for meeting: ${meeting.title}`);
}
