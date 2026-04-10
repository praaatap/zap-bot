import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import { getPlanLimits } from "@/lib/usage";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Calculate stats
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all meetings for the user and compute stats in-memory
        const allMeetingsResult = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("userId", user.$id), Query.limit(500)]
        );

        const allMeetings = allMeetingsResult.documents;

        const totalMeetings = allMeetings.length;
        const weekMeetings = allMeetings.filter((m: any) => {
            const st = new Date(m.startTime);
            return st >= startOfWeek;
        }).length;
        const activeMeetings = allMeetings.filter((m: any) =>
            m.botSent === true && m.meetingEnded === false
        ).length;
        const recordingsCount = allMeetings.filter((m: any) =>
            m.recordingUrl != null
        ).length;
        const sentCount = allMeetings.filter((m: any) => m.botSent === true).length;
        const joinedCount = allMeetings.filter((m: any) => Boolean(m.botJoinedAt)).length;
        const completedCount = allMeetings.filter((m: any) => m.meetingEnded === true).length;
        const transcriptReadyCount = allMeetings.filter((m: any) => m.transcriptReady === true).length;
        const summaryReadyCount = allMeetings.filter((m: any) => {
            const summaryText = typeof m.summary === "string" ? m.summary.trim() : "";
            return m.processed === true && summaryText.length > 0;
        }).length;
        const completionRate = sentCount > 0 ? Number(((completedCount / sentCount) * 100).toFixed(1)) : 0;
        const transcriptSuccessRate = completedCount > 0 ? Number(((transcriptReadyCount / completedCount) * 100).toFixed(1)) : 0;
        const summarySuccessRate = transcriptReadyCount > 0 ? Number(((summaryReadyCount / transcriptReadyCount) * 100).toFixed(1)) : 0;

        // Aggregate duration
        let totalHours = 0;
        for (const m of allMeetings) {
            if (m.transcriptReady === true && m.endTime && m.startTime) {
                const end = new Date(m.endTime);
                const start = new Date(m.startTime);
                totalHours += Math.max(0, (end.getTime() - start.getTime()) / 3600000);
            }
        }

        // Fetch recent meetings to generate trendData for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentMeetings = allMeetings.filter((m: any) => {
            const st = new Date(m.startTime);
            return st >= sevenDaysAgo;
        });

        // Group by local day
        const dayMap: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toLocaleDateString("en-US", { weekday: "short" });
            dayMap[key] = 0;
        }
        recentMeetings.forEach((m: any) => {
            const key = new Date(m.startTime).toLocaleDateString("en-US", { weekday: "short" });
            if (dayMap[key] !== undefined) {
                dayMap[key]++;
            }
        });

        const trendData = Object.keys(dayMap).map(day => ({
            name: day,
            meetings: dayMap[day],
        }));

        const normalizedPlan = String(user.currentPlan || "free").toLowerCase();
        const limits = getPlanLimits(normalizedPlan);
        const meetingsThisMonth = Number(user.meetingsThisMonth || 0);

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
                    trendData,
                    botFunnel: {
                        sent: sentCount,
                        joined: joinedCount,
                        completed: completedCount,
                    },
                    completionRate,
                    transcriptSuccessRate,
                    summarySuccessRate,
                    usage: {
                        plan: normalizedPlan,
                        meetingsThisMonth,
                        meetingsLimit: limits.meetings,
                        remainingMeetings: limits.meetings === -1 ? -1 : Math.max(0, limits.meetings - meetingsThisMonth),
                    },
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
