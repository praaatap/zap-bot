import { processMeetingTranscript } from "@/lib/ai-processor";
import { uploadRecordingFromUrl, uploadTranscriptToS3 } from "@/lib/aws";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { sendMeetingSummaryEmail } from "@/lib/email-service-free";
import { processTranscript } from "@/lib/rag";
import { incrementMeetingUsage } from "@/lib/usage";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const webhook = await request.json()
        const eventType = webhook.event || webhook.type
        const payload = webhook.data || webhook

        if (eventType === 'bot.joined' || eventType === 'joined') {
            const botId = payload?.bot_id || payload?.botId

            if (!botId) {
                return NextResponse.json({ error: 'bot id missing from webhook payload' }, { status: 400 })
            }

            // Find meeting by botId in AppWrite
            const meetingDocs = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                [Query.equal("botId", botId), Query.limit(1)]
            )

            if (meetingDocs.total === 0) {
                return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
            }

            const meeting = meetingDocs.documents[0] as any

            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meeting.$id,
                {
                    botSent: true,
                    botJoinedAt: new Date().toISOString()
                }
            )

            return NextResponse.json({
                success: true,
                message: 'join status updated',
                meetingId: meeting.$id
            })
        }

        if (eventType === 'complete') {
            const webhookData = webhook.data
            const botId = webhookData?.bot_id || webhookData?.botId

            if (!botId) {
                return NextResponse.json({ error: 'bot id missing from webhook payload' }, { status: 400 })
            }

            // Find meeting by botId in AppWrite
            const meetingDocs = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                [Query.equal("botId", botId), Query.limit(1)]
            )

            if (meetingDocs.total === 0) {
                console.error('meeting not found for bot id:', botId)
                return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
            }

            const meeting = meetingDocs.documents[0] as any

            // Get user details from AppWrite
            const userDocs = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                [Query.equal("$id", meeting.userId), Query.limit(1)]
            )

            const user = userDocs.total > 0 ? userDocs.documents[0] as any : null
            const userClerkId = user?.clerkId
            const userEmail = user?.email
            const userName = user?.name || 'User'

            // Avoid double counting usage when providers retry webhook delivery.
            if (!meeting.meetingEnded && userClerkId) {
                await incrementMeetingUsage(userClerkId)
            }

            if (!userEmail) {
                console.warn('user email not found for this meeting:', meeting.$id)
            }

            const hasTranscript = Boolean(webhookData.transcript)
            const providerRecordingUrl = webhookData.mp4 || webhookData.recording_url || null

            let storedRecordingKey: string | null = null
            if (providerRecordingUrl) {
                storedRecordingKey = await uploadRecordingFromUrl(meeting.$id, providerRecordingUrl)
            }

            if (hasTranscript) {
                await uploadTranscriptToS3(meeting.$id, JSON.stringify(webhookData.transcript))
            }

            // Update meeting with completion status
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meeting.$id,
                {
                    meetingEnded: true,
                    transcriptReady: hasTranscript,
                    transcript: webhookData.transcript ?? null,
                    recordingUrl: storedRecordingKey,
                    speakers: webhookData.speakers ?? null
                }
            )

            if (hasTranscript && !meeting.processed) {
                try {
                    const processed = await processMeetingTranscript(webhookData.transcript)

                    try {
                        if (userEmail) {
                            await sendMeetingSummaryEmail({
                                userEmail,
                                userName,
                                meetingTitle: meeting.title,
                                summary: processed.summary,
                                actionItems: processed.actionItems,
                                meetingId: meeting.$id,
                                meetingDate: new Date(meeting.startTime).toLocaleDateString()
                            })

                            // Mark email as sent
                            await databases.updateDocument(
                                APPWRITE_IDS.databaseId,
                                APPWRITE_IDS.meetingsCollectionId,
                                meeting.$id,
                                {
                                    emailSent: true,
                                    emailSentAt: new Date().toISOString()
                                }
                            )
                        }
                    } catch (emailError) {
                        console.error('failed to send the email:', emailError)
                    }

                    // Process transcript for RAG
                    const ragChunkCount = await processTranscript(
                        meeting.$id,
                        userClerkId,
                        webhookData.transcript,
                        meeting.title
                    )

                    // Update meeting with processing results
                    await databases.updateDocument(
                        APPWRITE_IDS.databaseId,
                        APPWRITE_IDS.meetingsCollectionId,
                        meeting.$id,
                        {
                            summary: processed.summary,
                            actionItems: processed.actionItems ?? [],
                            processed: true,
                            processedAt: new Date().toISOString(),
                            ragProcessed: ragChunkCount > 0,
                            ragProcessedAt: ragChunkCount > 0 ? new Date().toISOString() : null
                        }
                    )

                } catch (processingError) {
                    console.error('failed to process the transcript:', processingError)
                    await databases.updateDocument(
                        APPWRITE_IDS.databaseId,
                        APPWRITE_IDS.meetingsCollectionId,
                        meeting.$id,
                        {
                            processed: true,
                            processedAt: new Date().toISOString(),
                            summary: 'processing failed. please check the transcript manually.',
                            actionItems: [],
                            ragProcessed: false,
                            ragProcessedAt: null
                        }
                    )
                }
            }

            return NextResponse.json({
                success: true,
                message: 'meeting processed successfully',
                meetingId: meeting.$id
            })
        }
        return NextResponse.json({
            success: true,
            message: 'webhook received'
        })
    } catch (error) {
        console.error('webhook processing error:', error)
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}
