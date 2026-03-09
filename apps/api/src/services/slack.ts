export class SlackService {
    private webhookUrl = process.env.SLACK_WEBHOOK_URL;

    async sendNotification(message: string) {
        if (!this.webhookUrl) {
            console.log('🔔 [Slack Mock] ' + message);
            return;
        }

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message })
            });
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
        }
    }

    async sendMeetingSummary(meetingTitle: string, summary: string, actionItems: string[]) {
        const blocks = [
            {
                type: "header",
                text: { type: "plain_text", text: `🚀 Meeting Summary: ${meetingTitle}` }
            },
            {
                type: "section",
                text: { type: "mrkdwn", text: `*Summary*\n${summary}` }
            }
        ];

        if (actionItems.length > 0) {
            blocks.push({
                type: "section",
                text: { type: "mrkdwn", text: `*Action Items*\n${actionItems.map(item => `• ${item}`).join('\n')}` }
            });
        }

        if (!this.webhookUrl) {
            console.log('🔔 [Slack Mock] Summary blocks:', JSON.stringify(blocks, null, 2));
            return;
        }

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks })
            });
        } catch (error) {
            console.error('Failed to send Slack summary:', error);
        }
    }
}

export const slackService = new SlackService();

export async function postToSlack(channelId: string, message: string) {
    // Incoming webhook does not support channel override in all workspaces.
    // Include channel identifier in message for traceability in mock/fallback mode.
    await slackService.sendNotification(`[${channelId}] ${message}`);
    return { ok: true };
}
