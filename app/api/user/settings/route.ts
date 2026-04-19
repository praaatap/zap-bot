import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import {
    API_PERSISTED_SETTINGS_KEYS,
    DEFAULT_SETTINGS,
    normalizeZapSettings,
} from "@/lib/settings";
import { resolveAgentBotName } from "@/lib/bot-name";

function makeSettingsFromUser(user: any) {
    return {
        ...DEFAULT_SETTINGS,
        botName: resolveAgentBotName(user),
        assistantTone: user.assistantTone ?? DEFAULT_SETTINGS.assistantTone,
        retentionDays: user.retentionDays ?? DEFAULT_SETTINGS.retentionDays,
        storageRegion: user.storageRegion ?? DEFAULT_SETTINGS.storageRegion,
        autoJoinMeetings: user.autoJoinMeetings ?? DEFAULT_SETTINGS.autoJoinMeetings,
        autoRecordMeetings: user.autoRecordMeetings ?? DEFAULT_SETTINGS.autoRecordMeetings,
        aiSummary: user.aiSummary ?? DEFAULT_SETTINGS.aiSummary,
        actionItems: user.actionItems ?? DEFAULT_SETTINGS.actionItems,
    };
}

function makeAccountFromUser(user: any) {
    return {
        email: user.email || "",
        name: user.name || "",
        currentPlan: user.currentPlan || "free",
        subscriptionStatus: user.subscriptionStatus || "inactive",
        meetingsThisMonth: Number(user.meetingsThisMonth || 0),
        chatMessagesToday: Number(user.chatMessagesToday || 0),
        calendarConnected: Boolean(user.calendarConnected),
        resolvedBotName: resolveAgentBotName(user),
    };
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user: any = await getOrCreateUser(userId);
        const settings = makeSettingsFromUser(user);

        return NextResponse.json({
            success: true,
            data: {
                settings,
                account: makeAccountFromUser(user),
                persistedKeys: API_PERSISTED_SETTINGS_KEYS,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch settings",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const incoming = body?.settings ?? body;
        const settings = normalizeZapSettings(incoming);

        const updatedUser: any = await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            user.$id,
            {
                assistantTone: settings.assistantTone,
                retentionDays: settings.retentionDays,
                storageRegion: settings.storageRegion,
                autoJoinMeetings: settings.autoJoinMeetings,
                autoRecordMeetings: settings.autoRecordMeetings,
                aiSummary: settings.aiSummary,
                actionItems: settings.actionItems,
            },
        );

        return NextResponse.json({
            success: true,
            data: {
                settings: makeSettingsFromUser(updatedUser),
                account: makeAccountFromUser(updatedUser),
                persistedKeys: API_PERSISTED_SETTINGS_KEYS,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: "Failed to save settings",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
