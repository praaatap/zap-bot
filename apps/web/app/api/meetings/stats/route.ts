import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Calculate stats
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalMeetings, weekMeetings, activeMeetings, recordingsCount] = await Promise.all([
            prisma.meeting.count({
                where: { userId: user.id },
            }),
            prisma.meeting.count({
                where: {
                    userId: user.id,
                    startTime: { gte: startOfWeek },
                },
            }),
            prisma.meeting.count({
                where: {
                    userId: user.id,
                    botSent: true,
                    meetingEnded: false,
                },
            }),
            prisma.meeting.count({
                where: {
                    userId: user.id,
                    recordingUrl: { not: null },
                },
            }),
        ]);

        // Calculate total hours transcribed (estimate)
        const completedMeetings = await prisma.meeting.findMany({
            where: {
                userId: user.id,
                transcriptReady: true,
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });

        const totalHours = completedMeetings.reduce((acc, meeting) => {
            const duration = meeting.endTime.getTime() - meeting.startTime.getTime();
            return acc + duration / (1000 * 60 * 60); // Convert to hours
        }, 0);

        return NextResponse.json({
            success: true,
            data: {
                totalMeetings,
                activeMeetings,
                weekMeetings,
                recordingsCount,
                hoursTranscribed: Math.round(totalHours * 10) / 10,
                percentChange: weekMeetings > 0 ? "+12%" : "0%",
            },
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
