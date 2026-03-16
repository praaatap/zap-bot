import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
    dispatchMultipleLiveKitBots, 
    isValidLiveKitRoom,
    LiveKitBotConfig,
    BotStatus
} from "@/lib/livekit-bot";
import { getOrCreateUser } from "@/lib/user";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const body = await request.json();
        const {
            meetingUrl,
            title,
            startTime,
            endTime,
            description,
            botName,
            recordingMode,
            numBots = 2, // Default to 2 bots
        } = body;

        // Validate meeting URL
        if (!meetingUrl || typeof meetingUrl !== "string") {
            return NextResponse.json(
                { error: "Invalid meeting URL" },
                { status: 400 }
            );
        }

        // Extract room name from meeting URL
        // For LiveKit: you typically provide a room name directly
        const roomName = 
            meetingUrl.startsWith("livekit:") 
                ? meetingUrl.replace("livekit:", "")
                : meetingUrl.split("/").pop() || `room-${Date.now()}`;

        if (!isValidLiveKitRoom(roomName)) {
            return NextResponse.json(
                { error: "Invalid LiveKit room name" },
                { status: 400 }
            );
        }

        // Create meeting in database
        const meeting = await prisma.meeting.create({
            data: {
                userId: user.id,
                title: title || "LiveKit Meeting",
                meetingUrl: meetingUrl,
                startTime: startTime ? new Date(startTime) : new Date(),
                endTime: endTime ? new Date(endTime) : new Date(Date.now() + 3600000),
                description,
                botScheduled: true,
            },
        });

        // Dispatch multiple bots
        try {
            const liveKitConfig: LiveKitBotConfig = {
                roomName: roomName,
                meetingUrl: meetingUrl,
                meetingTitle: title || "LiveKit Meeting",
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                botName: botName || user.botName || "Zap Bot",
                recordingMode: recordingMode || "speaker_view",
                autoTranscribe: true,
                recordFiletype: "mp4",
            };

            const botResult = await dispatchMultipleLiveKitBots(
                liveKitConfig,
                Math.min(numBots, 5), // Limit to 5 bots max
                {
                    meeting_id: meeting.id,
                    user_id: user.id,
                }
            );

            if (botResult.botIds.length === 0) {
                const failedStatuses = botResult.statuses.filter((s: BotStatus) => s.status === "failed");
                const firstError = failedStatuses.length > 0 ? (failedStatuses[0]?.error || "Unknown error") : "No bots could be dispatched";
                throw new Error(`Failed to dispatch any bots: ${firstError}`);
            }

            // Update meeting with bot info
            await prisma.meeting.update({
                where: { id: meeting.id },
                data: {
                    botSent: botResult.count > 0,
                    botId: botResult.botIds[0] || null,
                },
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
                data: {
                    meeting,
                    botIds: botResult.botIds,
                    numBots: botResult.count,
                    roomName: roomName,
                    botService: "livekit",
                    statuses: botResult.statuses,
                },
            });
        } catch (botError) {
            console.error("Bot dispatch failed:", botError);

            const errorMessage = botError instanceof Error ? botError.message : String(botError);
            return NextResponse.json({
                success: false,
                error: errorMessage,
                meetingCreated: true,
                meetingId: meeting.id,
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Error dispatching bots:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
