import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchMeetingBot, isValidMeetingUrl, detectMeetingPlatform } from "@/lib/meeting-baas";
import { getOrCreateUser } from "@/lib/user";
import {
    buildDispatchMeta,
    findDuplicateMeetingCandidate,
    MeetingAgentError,
    normalizeStandardDispatchRequest,
    retry,
} from "@/lib/meeting-agent";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const body = await request.json();
        const normalized = normalizeStandardDispatchRequest(body);
        const {
            meetingUrl,
            title,
            description,
            startTime,
            endTime,
            botName,
            recordingMode,
            speechToTextProvider,
            dryRun,
        } = normalized;

        // Validate meeting URL
        if (!isValidMeetingUrl(meetingUrl)) {
            return NextResponse.json(
                { error: "Invalid meeting URL" },
                { status: 400 }
            );
        }

        const platform = detectMeetingPlatform(meetingUrl);

        if (dryRun) {
            return NextResponse.json({
                success: true,
                dryRun: true,
                data: {
                    platform,
                    title,
                    meetingUrl,
                    startTime,
                    endTime,
                    botName,
                    recordingMode,
                    speechToTextProvider,
                },
            });
        }

        const duplicateMeeting = await findDuplicateMeetingCandidate({
            prismaClient: prisma,
            userId: user.id,
            meetingUrl,
            startTime,
        });

        if (duplicateMeeting) {
            return NextResponse.json(
                {
                    error: "Potential duplicate dispatch detected",
                    data: {
                        existingMeeting: duplicateMeeting,
                    },
                },
                { status: 409 }
            );
        }

        // Create meeting in database
        const meeting = await prisma.meeting.create({
            data: {
                userId: user.id,
                title,
                meetingUrl,
                startTime,
                endTime,
                description,
                botScheduled: true,
            },
        });

        // Dispatch bot to join meeting
        try {
            const botResult = await retry(() =>
                dispatchMeetingBot(
                    {
                        meetingUrl,
                        meetingTitle: title,
                        startTime: meeting.startTime,
                        endTime: meeting.endTime,
                        autoRecord: true,
                        autoTranscribe: true,
                        botName,
                        recordingMode,
                        speechToTextProvider,
                    },
                    buildDispatchMeta("meetingbaas", meeting.id, user.id)
                )
            );

            // Update meeting with bot ID
            await prisma.meeting.update({
                where: { id: meeting.id },
                data: {
                    botId: botResult.botId,
                    botSent: true,
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

            const errorMessage = botError instanceof Error ? botError.message : String(botError);
            return NextResponse.json({
                success: false,
                data: {
                    meeting,
                    platform,
                    botDispatched: false,
                },
                warning: `Bot Dispatch Failed: ${errorMessage.substring(0, 100)}`,
                error: errorMessage
            }, { status: 502 });
        }
    } catch (error) {
        if (error instanceof MeetingAgentError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

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
