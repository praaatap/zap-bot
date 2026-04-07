import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dispatchMeetingBot } from "@/lib/meeting-baas";
import { dispatchMultipleLiveKitBots, isValidLiveKitRoom } from "@/lib/livekit-bot";
import { getOrCreateUser } from "@/lib/user";
import { incrementMeetingUsage } from "@/lib/usage";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const p = await params;
        const meetingId = p.id;
        const body = await request.json();
        const { botScheduled, numBots = 2, service } = body as {
            botScheduled?: boolean;
            numBots?: number;
            service?: "meetingbaas" | "livekit";
        };

        if (typeof botScheduled !== "boolean") {
            return NextResponse.json({ error: "botScheduled must be a boolean" }, { status: 400 });
        }

        const user = await getOrCreateUser(clerkId);

        const meetingDocs = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", meetingId), Query.limit(1)]
        );
        const meeting = meetingDocs.documents[0] as any;

        if (!meeting || meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            meetingId,
            {
                botScheduled: botScheduled
            }
        );

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

                        await databases.updateDocument(
                            APPWRITE_IDS.databaseId,
                            APPWRITE_IDS.meetingsCollectionId,
                            meetingId,
                            {
                                botSent: true,
                                botId: botResult.botIds[0] || null
                            }
                        );

                        await incrementMeetingUsage(clerkId);

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

                        // Update meeting with bot info in Appwrite
                        await databases.updateDocument(
                            APPWRITE_IDS.databaseId,
                            APPWRITE_IDS.meetingsCollectionId,
                            meetingId,
                            {
                                botSent: true,
                                botId: botId
                            }
                        );

                        await incrementMeetingUsage(clerkId);

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
            botScheduled
        });
    } catch (error) {
        console.error("[bot-toggle] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
