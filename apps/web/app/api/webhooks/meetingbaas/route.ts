import { processMeetingTranscript } from "@/lib/ai-processor";
import { prisma } from "@/lib/prisma";
import { sendMeetingSummaryEmail } from "@/lib/email-service-free";
import { processTranscript } from "@/lib/rag";
import { incrementMeetingUsage } from "@/lib/usage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const webhook = await request.json()

        if (webhook.event === 'complete') {
            const webhookData = webhook.data
            const botId = webhookData?.bot_id || webhookData?.botId

            if (!botId) {
                return NextResponse.json({ error: 'bot id missing from webhook payload' }, { status: 400 })
            }

            const meeting = await prisma.meeting.findFirst({
                where: {
                    botId
                },
                include: {
                    user: true
                }
            })

            if (!meeting) {
                console.error('meeting not found for bot id:', botId)
                return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
            }

            // Avoid double counting usage when providers retry webhook delivery.
            if (!meeting.meetingEnded) {
                await incrementMeetingUsage(meeting.user.clerkId)
            }

            if (!meeting.user.email) {
                console.warn('user email not found for this meeting:', meeting.id)
            }

            const hasTranscript = Boolean(webhookData.transcript)

            await prisma.meeting.update({
                where: {
                    id: meeting.id
                },
                data: {
                    meetingEnded: true,
                    transcriptReady: hasTranscript,
                    transcript: webhookData.transcript ?? undefined,
                    recordingUrl: webhookData.mp4 || webhookData.recording_url || null,
                    speakers: webhookData.speakers ?? undefined
                }
            })

            if (hasTranscript && !meeting.processed) {
                try {
                    const processed = await processMeetingTranscript(webhookData.transcript)

                    try {
                        if (meeting.user.email) {
                            await sendMeetingSummaryEmail({
                                userEmail: meeting.user.email,
                                userName: meeting.user.name || 'User',
                                meetingTitle: meeting.title,
                                summary: processed.summary,
                                actionItems: processed.actionItems,
                                meetingId: meeting.id,
                                meetingDate: meeting.startTime.toLocaleDateString()
                            })

                            await prisma.meeting.update({
                                where: {
                                    id: meeting.id
                                },
                                data: {
                                    emailSent: true,
                                    emailSentAt: new Date()
                                }
                            })
                        }
                    } catch (emailError) {
                        console.error('failed to send the email:', emailError)
                    }

                    const ragChunkCount = await processTranscript(
                        meeting.id,
                        meeting.user.clerkId,
                        webhookData.transcript,
                        meeting.title
                    )

                    await prisma.meeting.update({
                        where: {
                            id: meeting.id
                        },
                        data: {
                            summary: processed.summary,
                            actionItems: processed.actionItems ?? [],
                            processed: true,
                            processedAt: new Date(),
                            ragProcessed: ragChunkCount > 0,
                            ragProcessedAt: ragChunkCount > 0 ? new Date() : null
                        }
                    })

                } catch (processingError) {
                    console.error('failed to process the transcript:', processingError)
                    await prisma.meeting.update({
                        where: { id: meeting.id },
                        data: {
                            processed: true,
                            processedAt: new Date(),
                            summary: 'processing failed. please check the transcript manually.',
                            actionItems: [],
                            ragProcessed: false,
                            ragProcessedAt: null
                        }
                    })
                }
            }

            return NextResponse.json({
                success: true,
                message: 'meeting processed successfully',
                meetingId: meeting.id
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
