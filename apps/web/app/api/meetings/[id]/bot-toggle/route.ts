import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dispatchMeetingBot } from "@/lib/meeting-baas";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: meetingId } = await params;
        const { botScheduled } = await request.json();

        // Get user and meeting together
        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const meeting = await prisma.meeting.findUnique({
            where: {
                id: meetingId
            }
        });

        if (!meeting || meeting.userId !== user.id) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        // Update bot scheduled status
        const updatedMeeting = await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                botScheduled: botScheduled
            }
        });

        // If enabling bot and meeting is happening now or soon, send bot immediately
        if (botScheduled && meeting.meetingUrl && !meeting.botSent) {
            const now = new Date();
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

            if (meeting.startTime <= fiveMinutesFromNow) {
                console.log(`[bot-toggle] Meeting is happening soon (${meeting.startTime}), sending bot immediately...`);

                try {
                    const { botId } = await dispatchMeetingBot(
                        {
                            meetingUrl: meeting.meetingUrl,
                            meetingTitle: meeting.title,
                            botName: user.botName || "Zap Bot"
                        },
                        {
                            meeting_id: meeting.id,
                            user_id: user.id
                        }
                    );

                    // Update meeting with bot info
                    await prisma.meeting.update({
                        where: { id: meetingId },
                        data: {
                            botSent: true,
                            botId: botId,
                            botJoinedAt: new Date()
                        }
                    });

                    // Increment usage
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            meetingsThisMonth: {
                                increment: 1
                            }
                        }
                    });

                    return NextResponse.json({
                        success: true,
                        botSent: true,
                        botId: botId
                    });
                } catch (error) {
                    console.error("[bot-toggle] Error sending bot:", error);
                    return NextResponse.json({
                        success: true,
                        botScheduled: true,
                        error: error instanceof Error ? error.message : "Failed to send bot immediately"
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            botScheduled: updatedMeeting.botScheduled
        });
    } catch (error) {
        console.error("[bot-toggle] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
