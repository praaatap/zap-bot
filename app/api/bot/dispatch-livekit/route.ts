import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, ID } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { updateDocumentBestEffort } from "@/lib/appwrite-compat";
import { resolveAgentBotName } from "@/lib/bot-name";
import {
    dispatchMultipleLiveKitBots,
    isValidLiveKitRoom,
    LiveKitBotConfig,
    BotStatus
} from "@/lib/livekit-bot";
import { getOrCreateUser } from "@/lib/user";
import { canUserSendBot } from "@/lib/usage";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Check if user can send bot (usage limits)
        const canSendResult = await canUserSendBot(userId);
        if (!canSendResult.allowed) {
            return NextResponse.json(
                { error: canSendResult.reason },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            meetingUrl,
            title,
            startTime,
            endTime,
            description,
            recordingMode,
            numBots = 2, // Default to 2 bots
        } = body;
        const resolvedBotName = resolveAgentBotName(user);

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
        const meeting = await databases.createDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            ID.unique(),
            {
                userId: user.$id,
                title: title || "LiveKit Meeting",
                meetingUrl: meetingUrl,
                startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
                endTime: endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 3600000).toISOString(),
                description,
                botScheduled: true,
            },
        );

        // Dispatch multiple bots
        try {
            const liveKitConfig: LiveKitBotConfig = {
                roomName: roomName,
                meetingUrl: meetingUrl,
                meetingTitle: title || "LiveKit Meeting",
                startTime: meeting.startTime ? new Date(meeting.startTime) : new Date(),
                endTime: meeting.endTime ? new Date(meeting.endTime) : new Date(Date.now() + 3600000),
                botName: resolvedBotName,
                recordingMode: recordingMode || "speaker_view",
                autoTranscribe: true,
                recordFiletype: "mp4",
            };

            const botResult = await dispatchMultipleLiveKitBots(
                liveKitConfig,
                Math.min(numBots, 5), // Limit to 5 bots max
                {
                    meeting_id: meeting.$id,
                    user_id: user.$id,
                }
            );

            if (botResult.botIds.length === 0) {
                const failedStatuses = botResult.statuses.filter((s: BotStatus) => s.status === "failed");
                const firstError = failedStatuses.length > 0 ? (failedStatuses[0]?.error || "Unknown error") : "No bots could be dispatched";
                throw new Error(`Failed to dispatch any bots: ${firstError}`);
            }

            // Update meeting with bot info
            await updateDocumentBestEffort(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meeting.$id,
                {
                    botName: resolvedBotName,
                    botSent: botResult.count > 0,
                    botSentAt: new Date().toISOString(),
                    botId: botResult.botIds[0] || null,
                    botIds: botResult.botIds,
                    botStatus: botResult.count > 0 ? "pending" : "failed",
                    botService: "livekit",
                    numBotsDispatched: botResult.count,
                    processingStatus: botResult.count > 0 ? "recording" : "pending",
                },
            );

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

            await databases.deleteDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meeting.$id
            ).catch(console.error);

            const errorMessage = botError instanceof Error ? botError.message : String(botError);
            return NextResponse.json({
                success: false,
                error: errorMessage,
                meetingCreated: false, // Since it gets deleted now
                meetingId: meeting.$id,
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
