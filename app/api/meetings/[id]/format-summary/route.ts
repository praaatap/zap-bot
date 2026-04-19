import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import { reformatSummary } from "@/lib/groq";
import { transcriptToText } from "@/lib/transcript";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const p = await params;
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meetingId = p.id;
        const body = await request.json();
        const { format } = body;

        if (!format) {
            return NextResponse.json({ error: "Format is required" }, { status: 400 });
        }

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", meetingId), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;
        const user = await getOrCreateUser(userId);
        
        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!meeting.transcript) {
            return NextResponse.json({ error: "Transcript data not available to reformat summary" }, { status: 400 });
        }

        const transcriptText = transcriptToText(meeting.transcript);

        const formattedText = await reformatSummary(transcriptText, format);

        return NextResponse.json({ success: true, formattedText });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Failed to reformat summary" }, { status: 500 });
    }
}
