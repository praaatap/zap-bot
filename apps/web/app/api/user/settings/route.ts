import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import {
    API_PERSISTED_SETTINGS_KEYS,
    DEFAULT_SETTINGS,
    normalizeZapSettings,
} from "@/lib/settings";

function makeSettingsFromUser(user: any) {
    return {
        ...DEFAULT_SETTINGS,
        botName: user.botName || DEFAULT_SETTINGS.botName,
        assistantTone: user.assistantTone ?? DEFAULT_SETTINGS.assistantTone,
        retentionDays: user.retentionDays ?? DEFAULT_SETTINGS.retentionDays,
        storageRegion: user.storageRegion ?? DEFAULT_SETTINGS.storageRegion,
        autoJoinMeetings: user.autoJoinMeetings ?? DEFAULT_SETTINGS.autoJoinMeetings,
        autoRecordMeetings: user.autoRecordMeetings ?? DEFAULT_SETTINGS.autoRecordMeetings,
        aiSummary: user.aiSummary ?? DEFAULT_SETTINGS.aiSummary,
        actionItems: user.actionItems ?? DEFAULT_SETTINGS.actionItems,
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

        const updatedUser: any = await prisma.user.update({
            where: { id: user.id },
            data: {
                botName: settings.botName,
                assistantTone: settings.assistantTone,
                retentionDays: settings.retentionDays,
                storageRegion: settings.storageRegion,
                autoJoinMeetings: settings.autoJoinMeetings,
                autoRecordMeetings: settings.autoRecordMeetings,
                aiSummary: settings.aiSummary,
                actionItems: settings.actionItems,
            } as any,
            select: {
                botName: true,
                assistantTone: true,
                retentionDays: true,
                storageRegion: true,
                autoJoinMeetings: true,
                autoRecordMeetings: true,
                aiSummary: true,
                actionItems: true,
            } as any,
        });

        return NextResponse.json({
            success: true,
            data: {
                settings: makeSettingsFromUser(updatedUser as any),
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
