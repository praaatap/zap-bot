import { store } from "../store.js";
import { groqChat } from "./groq.js";
import { sendMeetingSummaryEmail } from "./email.js";
import { AsanaAPI } from "./integrations/asana.js";
import { ActionItemData } from "./integrations/types.js";
import { TrelloAPI } from "./integrations/trello.js";
import { slackService } from "./slack.js";

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

    // 2. Real-sync Action Items to connected integrations
    const actionItems = meeting.actionItems || [];
    const user = Array.from(store["users"].values())[0]; // demo user

    if (actionItems.length > 0 && user) {
        console.log(`📝 Syncing ${actionItems.length} action items for user ${user.email}`);

        for (const integration of user.integrations) {
            if (!integration.connected) continue;

            try {
                if (integration.platform === 'asana' && integration.projectName) {
                    const asana = new AsanaAPI();
                    for (const item of actionItems) {
                        await asana.createTask(integration.accessToken, integration.projectName, { title: item });
                    }
                    console.log(`✅ Synced to Asana`);
                }

                if (integration.platform === 'trello' && integration.boardName) {
                    const trello = new TrelloAPI();
                    const lists = await trello.getBoardLists(integration.accessToken, integration.boardName);
                    if (lists && lists.length > 0) {
                        for (const item of actionItems) {
                            await trello.createCard(integration.accessToken, lists[0].id, { title: item });
                        }
                    }
                    console.log(`✅ Synced to Trello`);
                }
            } catch (err) {
                console.error(`❌ Failed to sync to ${integration.platform}:`, err);
            }
        }
    }

    // 3. Send Meeting Summary Email
    if (user && meeting.summary) {
        try {
            await sendMeetingSummaryEmail({
                userEmail: user.email,
                userName: user.name,
                meetingTitle: meeting.title,
                summary: meeting.summary,
                actionItems: actionItems.map((text, idx) => ({ id: idx + 1, text })),
                meetingId: meeting.id,
                meetingDate: new Date(meeting.startTime).toLocaleDateString()
            });
            console.log(`📧 Summary email sent to ${user.email}`);
        } catch (err) {
            console.error("❌ Failed to send summary email:", err);
        }
    }

    // 4. Slack Notification
    if (user && meeting.summary) {
        try {
            await slackService.sendMeetingSummary(meeting.title, meeting.summary, actionItems);
            console.log(`🔔 Slack notification sent for meeting: ${meeting.title}`);
        } catch (err) {
            console.error("❌ Failed to send Slack notification:", err);
        }
    }
}
