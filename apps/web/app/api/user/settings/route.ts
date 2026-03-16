import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import {
    API_PERSISTED_SETTINGS_KEYS,
    DEFAULT_SETTINGS,
    normalizeZapSettings,
} from "@/lib/settings";

function makeSettingsFromUser(user: { botName: string | null }) {
    return {
        ...DEFAULT_SETTINGS,
        botName: user.botName || DEFAULT_SETTINGS.botName,
    };
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);
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

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                botName: settings.botName,
            },
            select: {
                botName: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                settings: makeSettingsFromUser(updatedUser),
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
