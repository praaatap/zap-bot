import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dispatchMeetingBot } from "@/lib/meeting-baas";
import { dispatchMultipleLiveKitBots, isValidLiveKitRoom } from "@/lib/livekit-bot";

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
        const body = await request.json();
        const { botScheduled, numBots = 2, service } = body as {
            botScheduled?: boolean;
            numBots?: number;
            service?: "meetingbaas" | "livekit";
        };

        if (typeof botScheduled !== "boolean") {
            return NextResponse.json({ error: "botScheduled must be a boolean" }, { status: 400 });
        }

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
                    const botService = service === "livekit" ? "livekit" : "meetingbaas";

                    if (botService === "livekit") {
                        // LiveKit: dispatch multiple bots
                        const roomName = meeting.meetingUrl.startsWith("livekit:")
                            ? meeting.meetingUrl.replace("livekit:", "")
                            : meeting.meetingUrl.split("/").pop() || `room-${Date.now()}`;

                        if (!isValidLiveKitRoom(roomName)) {
                            throw new Error("Invalid LiveKit room name");
                        }

                        const botResult = await dispatchMultipleLiveKitBots(
                            {
                                roomName: roomName,
                                meetingUrl: meeting.meetingUrl,
                                meetingTitle: meeting.title,
                                startTime: meeting.startTime,
                                endTime: meeting.endTime,
                                botName: user.botName || "Zap Bot",
                                autoTranscribe: true,
                            },
                            Math.min(numBots, 5),
                            {
                                meeting_id: meeting.id,
                                user_id: user.id
                            }
                        );

                        // Update meeting with multiple bot IDs
                        await prisma.meeting.update({
                            where: { id: meetingId },
                            data: {
                                botSent: true,
                                botId: botResult.botIds[0] || null
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
                            botIds: botResult.botIds,
                            numBots: botResult.count,
                            service: "livekit"
                        });
                    } else {
                        // Meeting BaaS: single bot
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
                                botId: botId
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
                            botId: botId,
                            service: "meetingbaas"
                        });
                    }
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
