import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meeting = await prisma.meeting.findUnique({
            where: { id: params.id },
            include: { user: true },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.user.clerkId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const stages = {
            botDispatched: meeting.botSent,
            meetingCompleted: meeting.meetingEnded,
            transcriptReady: meeting.transcriptReady,
            ragReady: meeting.ragProcessed,
        };

        const nextStep = !stages.botDispatched
            ? "dispatch_bot"
            : !stages.meetingCompleted
                ? "wait_for_completion_webhook"
                : !stages.transcriptReady
                    ? "wait_for_transcript"
                    : !stages.ragReady
                        ? "wait_for_indexing"
                        : "ready_for_chat";

        return NextResponse.json({
            success: true,
            meetingId: meeting.id,
            stages,
            nextStep,
            timestamps: {
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                processedAt: meeting.processedAt,
                ragProcessedAt: meeting.ragProcessedAt,
            },
        });
    } catch (error) {
        console.error("Error fetching meeting pipeline status:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch meeting pipeline status",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
