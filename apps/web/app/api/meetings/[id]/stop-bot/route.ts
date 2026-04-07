import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { NextResponse } from "next/server";
import { stopMeetingBot } from "@/lib/meeting-baas";
import { auth } from "@clerk/nextjs/server";

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

        const meetingDocs = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", id), Query.limit(1)]
        );
        const meeting = meetingDocs.documents[0] as any;

        if (!meeting || !meeting.botId) {
            return NextResponse.json({ error: "Meeting or Bot not found" }, { status: 404 });
        }

        const userDocs = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            [Query.equal("clerkId", clerkId), Query.limit(1)]
        );
        const user = userDocs.documents[0] as any;

        if (!user || meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Call our specialized lib function with correct v2 Bearer auth
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
                meetingEnded: true,
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error stopping bot:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
