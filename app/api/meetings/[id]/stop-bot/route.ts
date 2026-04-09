import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { NextResponse } from "next/server";
import { stopMeetingBot } from "@/lib/meeting-baas";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user";

export const runtime = "nodejs";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const user = await getOrCreateUser(clerkId);

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", id), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!meeting.botId) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404 });
        }

        try {
            await stopMeetingBot(meeting.botId);
        } catch (e) {
            console.warn("Could not stop bot on MeetingBaaS (might already be gone):", e);
        }

        await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            id,
            {
                botSent: false,
                botScheduled: false,
                botJoinedAt: null,
            },
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error stopping bot:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
