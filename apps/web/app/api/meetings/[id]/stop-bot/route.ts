import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { stopMeetingBot } from "@/lib/meeting-baas";
import { auth } from "@clerk/nextjs/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!meeting || !meeting.botId || meeting.user.clerkId !== clerkId) {
            return NextResponse.json({ error: "Meeting or Bot not found or Unauthorized" }, { status: 404 });
        }

        // Call our specialized lib function with correct v2 Bearer auth
        try {
            await stopMeetingBot(meeting.botId);
        } catch (e) {
            console.warn("Could not stop bot on MeetingBaaS (might already be gone):", e);
        }

        // Update local status to match our schema features
        await prisma.meeting.update({
            where: { id },
            data: {
                botSent: false,
                meetingEnded: true,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error stopping bot:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
