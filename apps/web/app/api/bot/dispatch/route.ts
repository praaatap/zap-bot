import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchMeetingBot, isValidMeetingUrl, detectMeetingPlatform } from "@/lib/meeting-baas";
import { getOrCreateUser } from "@/lib/user";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const body = await request.json();
        const { meetingUrl, title, startTime, endTime, description } = body;

        const normalizedMeetingUrl =
            typeof meetingUrl === "string" && !/^https?:\/\//i.test(meetingUrl)
                ? `https://${meetingUrl.trim()}`
                : typeof meetingUrl === "string"
                    ? meetingUrl.trim()
                    : "";

        // Validate meeting URL
        if (!normalizedMeetingUrl || !isValidMeetingUrl(normalizedMeetingUrl)) {
            return NextResponse.json(
                { error: "Invalid meeting URL" },
                { status: 400 }
            );
        }

        const platform = detectMeetingPlatform(normalizedMeetingUrl);

        // Create meeting in database
        const meeting = await prisma.meeting.create({
            data: {
                userId: user.id,
                title: title || "Quick Join Meeting",
                meetingUrl: normalizedMeetingUrl,
                startTime: startTime ? new Date(startTime) : new Date(),
                endTime: endTime ? new Date(endTime) : new Date(Date.now() + 3600000),
                description,
                botScheduled: true,
            },
        });

        // Dispatch bot to join meeting
        try {
            const botResult = await dispatchMeetingBot({
                meetingUrl: normalizedMeetingUrl,
                meetingTitle: title || "Quick Join Meeting",
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                autoRecord: true,
                autoTranscribe: true,
            });

            // Update meeting with bot ID
            await prisma.meeting.update({
                where: { id: meeting.id },
                data: {
                    botId: botResult.botId,
                    botSent: true,
                    botJoinedAt: new Date(),
                },
            });

            return NextResponse.json({
                success: true,
                data: {
                    meeting,
                    botId: botResult.botId,
                    platform,
                    botDispatched: true,
                },
            });
        } catch (botError) {
            // Meeting created but bot dispatch failed
            console.error("Bot dispatch failed:", botError);
            
            return NextResponse.json({
                success: false,
                data: {
                    meeting,
                    platform,
                    botDispatched: false,
                },
                warning: "Meeting created but bot dispatch failed",
            }, { status: 502 });
        }
    } catch (error) {
        console.error("Error dispatching bot:", error);
        return NextResponse.json(
            {
                error: "Failed to dispatch bot",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
