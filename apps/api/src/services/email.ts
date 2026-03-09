import nodemailer from 'nodemailer';

interface EmailData {
    userEmail: string;
    userName: string;
    meetingTitle: string;
    summary: string;
    actionItems: Array<{
        id: number;
        text: string;
    }>;
    meetingId: string;
    meetingDate: string;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export async function sendMeetingSummaryEmail(data: EmailData) {
    try {
        const actionItemsHtml = data.actionItems
            .map(item => `<li>${item.text}</li>`)
            .join('');

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Meeting Summary: ${data.meetingTitle}</h2>
                <p>Hi ${data.userName},</p>
                <p>Here is the summary of your meeting on ${data.meetingDate}:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #4F46E5;">Key Summary</h3>
                    <p style="color: #555; line-height: 1.5;">${data.summary}</p>
                </div>

                ${data.actionItems.length > 0 ? `
                <h3 style="color: #333;">Action Items</h3>
                <ul style="color: #555; line-height: 1.5;">
                    ${actionItemsHtml}
                </ul>
                ` : ''}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/meetings/${data.meetingId}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        View Full Details
                    </a>
                </div>
                
                <p style="margin-top: 40px; font-size: 12px; color: #999;">
                    Sent via Zap Bot. To manage these emails, visit your settings.
                </p>
            </div>
        `;

        const result = await transporter.sendMail({
            from: `"Zap Bot" <${process.env.GMAIL_USER}>`,
            to: data.userEmail,
            subject: `Meeting Summary Ready - ${data.meetingTitle}`,
            html: emailHtml
        });

        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
