import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { isDuplicateEvent } from "../utils/deduplicate"

export async function handleMessage({ message, say, client }: any) {
    try {
        if (message.subtype === 'bot message' || !('user' in message) || !('text' in message)) {
            return
        }

        if (message.user && message.user.startsWith('B')) {
            return
        }
        const authTest = await client.auth.test()

        if (message.user == authTest.user_id) {
            return
        }

        const text = message.text || ''

        if (text.includes(`<@${authTest.user_id}>`)) {
            return
        }

        const eventId = `message-${message.channel}-${message.user}`
        const eventTs = message.ts

        if (isDuplicateEvent(eventId, eventTs)) {
            return
        }

        const slackUserId = message.user

        if (!slackUserId) {
            return
        }

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

        const userList = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            [Query.equal("email", userEmail), Query.limit(1)]
        );
        const user = userList.total > 0 ? userList.documents[0] : null;

        if (!user) {
            await say(`👋 Hi! I can't find an account with email *${userEmail}*. Please sign up first!`)
            return
        }

        const { team_id: teamId } = await client.auth.test()
        await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            user.$id,
            {
                slackUserId: slackUserId,
                slackTeamId: teamId as string,
                slackConnected: true
            }
        )
        await say("🤖 Searching through your meetings...")

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${API_URL}/api/chat/all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: cleanText,
                userId: user.clerkId
            })
        })

        if (!response.ok) {
            throw new Error(`RAG API failed: ${response.status}`)
        }

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
                    {
                        type: "divider"
                    },
                    {
                        type: "context",
                        elements: [{
                            type: "mrkdwn",
                            text: `💡 Ask me about meetings, decisions, or action items`
                        }]
                    },
                ]
            })
        } else {
            await say('sorry, i encountered an error searching through your meetings')
        }
    } catch (error) {
        console.error('message handler error:', error)
        await say('sorry, something went wrong. please try again')
    }
}
