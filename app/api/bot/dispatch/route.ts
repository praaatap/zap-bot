import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, ID } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { dispatchMeetingBot, isValidMeetingUrl, detectMeetingPlatform } from "@/lib/meeting-baas";
import { updateDocumentBestEffort } from "@/lib/appwrite-compat";
import { resolveAgentBotName } from "@/lib/bot-name";
import { getOrCreateUser } from "@/lib/user";
import { canUserSendBot } from "@/lib/usage";
import {
    buildDispatchMeta,
    findDuplicateMeetingCandidate,
    MeetingAgentError,
    normalizeStandardDispatchRequest,
    retry,
} from "@/lib/meeting-agent";

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
        const normalized = normalizeStandardDispatchRequest(body);
        const {
            meetingUrl,
            title,
            description,
            startTime,
            endTime,
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
        const resolvedBotName = resolveAgentBotName(user);

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
                    botName: resolvedBotName,
                    recordingMode,
                    speechToTextProvider,
                },
            });
        }

        const duplicateMeeting = await findDuplicateMeetingCandidate({
            userId: user.$id,
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
        const meeting = await databases.createDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            ID.unique(),
            {
                userId: user.$id,
                title,
                meetingUrl,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                description,
                botScheduled: true,
                botSent: false,
                meetingEnded: false,
                transcriptReady: false,
                processed: false,
                ragProcessed: false,
            }
        );

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
                        botName: resolvedBotName,
                        recordingMode,
                        speechToTextProvider,
                    },
                    buildDispatchMeta("meetingbaas", meeting.$id, user.$id)
                )
            );

            // Update meeting with bot ID
            await updateDocumentBestEffort(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meeting.$id,
                {
                    botName: resolvedBotName,
                    botId: botResult.botId,
                    botSent: true,
                    botSentAt: new Date().toISOString(),
                    botService: "meetingbaas",
                    botStatus: "pending",
                    numBotsDispatched: 1,
                    processingStatus: "recording",
                }
            );

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

            await databases.deleteDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meeting.$id
            ).catch(console.error);

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
