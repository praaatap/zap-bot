import { prisma } from "d:/untitled1/zap-bot/apps/web/lib/prisma"
import { isDuplicateEvent } from "../utils/deduplicate"

export async function handleAppMention({ event, say, client }: any) {
    try {
        const eventId = `app_mention-${event.channel}-${event.user}`
        const eventTs = event.event_ts || event.ts

        if (isDuplicateEvent(eventId, eventTs)) {
            return
        }

        const authTest = await client.auth.test()
        if (event.user === authTest.user_id) {
            return
        }

        const slackUserId = event.user
        if (!slackUserId) return

        const text = event.text || ''
        const cleanText = text.replace(/<@[^>]+>/g, '').trim()

        if (!cleanText) {
            await say("👋 Hi! Ask me anything about your meetings. For example:\n· What were the key decisions in yesterday's meeting?\n· Summarize yesterday's meeting action items")
            return
        }

        const userInfo = await client.users.info({ user: slackUserId })
        const userEmail = userInfo.user?.profile?.email

        if (!userEmail) {
            await say("Sorry, I can't access your email. Please make sure your slack email is visible.")
            return
        }

        const user = await prisma.user.findFirst({
            where: { email: userEmail }
        })

        if (!user) {
            await say(`👋 Hi! I can't find an account with email *${userEmail}*. Please sign up first!`)
            return
        }

        const { team_id: teamId } = await client.auth.test()
        await prisma.user.update({
            where: { id: user.id },
            data: {
                slackUserId: slackUserId,
                slackTeamId: teamId as string,
                slackConnected: true
            }
        })

        await say("🤖 Searching through your meetings...")

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${API_URL}/api/chat/all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: cleanText,
                userId: user.clerkId
            })
        })

        if (!response.ok) throw new Error(`RAG API failed: ${response.status}`)

        const data = await response.json()

        if (data.answer) {
            await say({
                text: "Meeting Assistant Response",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `🤖 *Zap Bot Assistant*\n\n${data.answer}`
                        }
                    },
                    { type: "divider" },
                    {
                        type: "context",
                        elements: [{
                            type: "mrkdwn",
                            text: `💡 Ask me about meetings, decisions, or action items`
                        }]
                    }
                ]
            })
        } else {
            await say('sorry, i encountered an error searching through your meetings')
        }
    } catch (error) {
        console.error('app mention handler error:', error)
        await say('sorry, something went wrong. please try again')
    }
}
