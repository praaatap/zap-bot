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

        // Aggregate duration in DB to avoid fetching all rows for large accounts
        const durationRows = await prisma.$queryRaw<Array<{ hours: number }>>`
            SELECT COALESCE(SUM(EXTRACT(EPOCH FROM ("endTime" - "startTime"))) / 3600, 0) AS hours
            FROM "Meeting"
            WHERE "userId" = ${user.id}
              AND "transcriptReady" = true
        `;
        const totalHours = Number(durationRows?.[0]?.hours || 0);

        return NextResponse.json(
            {
                success: true,
                data: {
                    totalMeetings,
                    activeMeetings,
                    weekMeetings,
                    recordingsCount,
                    hoursTranscribed: Math.round(totalHours * 10) / 10,
                    percentChange: weekMeetings > 0 ? "+12%" : "0%",
                },
            },
            { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
        );
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
