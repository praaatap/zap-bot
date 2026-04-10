import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

type ActionStatus = "new" | "in_progress" | "done";

type NormalizedActionItem = {
    id: string;
    text: string;
    owner: string | null;
    dueDate: string | null;
    status: ActionStatus;
    meetingId: string;
    meetingTitle: string;
};

function detectPlatformFromUrl(url?: string | null): string {
    if (!url) return "unknown";
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "microsoft_teams";
    if (url.includes("webex.com")) return "webex";
    return "other";
}

function normalizeStatus(input: unknown): ActionStatus {
    const value = String(input || "").toLowerCase();
    if (["done", "closed", "complete", "completed"].includes(value)) return "done";
    if (["in_progress", "in-progress", "in progress", "doing", "active"].includes(value)) return "in_progress";
    return "new";
}

function parseActionItems(raw: unknown, meetingId: string, meetingTitle: string): NormalizedActionItem[] {
    if (!raw) return [];

    const normalizeFromObject = (item: Record<string, unknown>, idx: number): NormalizedActionItem | null => {
        const text = typeof item.text === "string"
            ? item.text
            : typeof item.title === "string"
                ? item.title
                : typeof item.action === "string"
                    ? item.action
                    : "";

        if (!text.trim()) return null;

        const owner = typeof item.owner === "string" && item.owner.trim() ? item.owner.trim() : null;
        const dueDate = typeof item.dueDate === "string" && item.dueDate.trim()
            ? item.dueDate.trim()
            : typeof item.due === "string" && item.due.trim()
                ? item.due.trim()
                : null;

        return {
            id: `${meetingId}-${idx}`,
            text: text.trim(),
            owner,
            dueDate,
            status: normalizeStatus(item.status),
            meetingId,
            meetingTitle,
        };
    };

    if (Array.isArray(raw)) {
        return raw
            .map((item, idx) => {
                if (typeof item === "string") {
                    return {
                        id: `${meetingId}-${idx}`,
                        text: item,
                        owner: null,
                        dueDate: null,
                        status: "new" as const,
                        meetingId,
                        meetingTitle,
                    };
                }

                if (item && typeof item === "object") {
                    return normalizeFromObject(item as Record<string, unknown>, idx);
                }

                return null;
            })
            .filter((item): item is NormalizedActionItem => Boolean(item));
    }

    if (typeof raw === "object") {
        const entries = Object.entries(raw as Record<string, unknown>);
        return entries
            .map(([key, value], idx) => {
                if (typeof value === "string") {
                    return {
                        id: `${meetingId}-${idx}`,
                        text: `${key}: ${value}`,
                        owner: null,
                        dueDate: null,
                        status: "new" as const,
                        meetingId,
                        meetingTitle,
                    };
                }

                if (value && typeof value === "object") {
                    return normalizeFromObject({ key, ...(value as Record<string, unknown>) }, idx);
                }

                return null;
            })
            .filter((item): item is NormalizedActionItem => Boolean(item));
    }

    return [];
}

function getProcessingStage(meeting: {
    startTime: string | Date;
    endTime: string | Date;
    botSent: boolean;
    meetingEnded: boolean;
    transcriptReady: boolean;
    processed: boolean;
    ragProcessed: boolean;
    processingStatus?: string;
    processingError?: string | null;
}): "queued" | "recording" | "transcribing" | "summarizing" | "completed" | "failed" {
    const processingStatus = String(meeting.processingStatus || "").toLowerCase();
    if (processingStatus === "failed" || Boolean(meeting.processingError)) {
        return "failed";
    }

    const now = Date.now();
    const startTs = new Date(meeting.startTime).getTime();
    const endTs = new Date(meeting.endTime).getTime();

    if (!meeting.botSent && startTs < now - 30 * 60 * 1000) {
        return "failed";
    }

    if (meeting.botSent && !meeting.meetingEnded) {
        return "recording";
    }

    if (meeting.meetingEnded && !meeting.transcriptReady) {
        if (endTs < now - 3 * 60 * 60 * 1000) {
            return "failed";
        }
        return "transcribing";
    }

    if (meeting.transcriptReady && (!meeting.processed || !meeting.ragProcessed)) {
        return "summarizing";
    }

    if (meeting.transcriptReady && meeting.processed && meeting.ragProcessed) {
        return "completed";
    }

    return "queued";
}

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const last28Days = new Date(now);
        last28Days.setDate(last28Days.getDate() - 27);
        last28Days.setHours(0, 0, 0, 0);

        // Fetch today's meeting count
        const todayResult = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [
                Query.equal("userId", user.$id),
                Query.greaterThanEqual("startTime", startOfToday.toISOString()),
                Query.lessThan("startTime", tomorrow.toISOString()),
                Query.limit(1),
            ],
        );
        const todayMeetings = todayResult.total;

        // Fetch meetings from last 28 days
        const meetingsResult = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [
                Query.equal("userId", user.$id),
                Query.greaterThanEqual("startTime", last28Days.toISOString()),
                Query.orderDesc("startTime"),
                Query.limit(200),
            ],
        );
        const meetings = meetingsResult.documents;

        // Fetch upcoming meetings
        const upcomingResult = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [
                Query.equal("userId", user.$id),
                Query.greaterThanEqual("startTime", now.toISOString()),
                Query.orderAsc("startTime"),
                Query.limit(12),
            ],
        );
        const upcoming = upcomingResult.documents;

        const recordingsProcessed = meetings.filter((m: any) => Boolean(m.recordingUrl)).length;
        const summariesSent = meetings.filter((m: any) => m.emailSent).length;
        const sentCount = meetings.filter((m: any) => m.botSent === true).length;
        const joinedCount = meetings.filter((m: any) => Boolean(m.botJoinedAt)).length;
        const completedCount = meetings.filter((m: any) => m.meetingEnded === true).length;
        const transcriptReadyCount = meetings.filter((m: any) => m.transcriptReady === true).length;
        const summaryReadyCount = meetings.filter((m: any) => {
            const summaryText = typeof m.summary === "string" ? m.summary.trim() : "";
            return m.processed === true && summaryText.length > 0;
        }).length;
        const completionRate = sentCount > 0 ? Number(((completedCount / sentCount) * 100).toFixed(1)) : 0;
        const transcriptSuccessRate = completedCount > 0 ? Number(((transcriptReadyCount / completedCount) * 100).toFixed(1)) : 0;
        const summarySuccessRate = transcriptReadyCount > 0 ? Number(((summaryReadyCount / transcriptReadyCount) * 100).toFixed(1)) : 0;

        const normalizedActionItems = meetings.flatMap((meeting: any) => {
            // Parse actionItems from JSON string if stored as string
            let actionItems = meeting.actionItems;
            if (typeof actionItems === "string") {
                try {
                    actionItems = JSON.parse(actionItems);
                } catch {
                    actionItems = null;
                }
            }
            return parseActionItems(actionItems, meeting.$id, meeting.title);
        });

        const openActionItems = normalizedActionItems.filter((item: any) => item.status !== "done").length;
        const closedActionItems = normalizedActionItems.filter((item: any) => item.status === "done").length;

        const processing = meetings
            .slice(0, 18)
            .map((meeting: any) => ({
                id: meeting.$id,
                title: meeting.title,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                stage: getProcessingStage(meeting),
            }));

        const byWeek: Array<{ label: string; meetings: number; hours: number }> = [];
        for (let i = 3; i >= 0; i -= 1) {
            const start = new Date(now);
            start.setDate(now.getDate() - i * 7 - 6);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const inWeek = meetings.filter((m: any) => new Date(m.startTime) >= start && new Date(m.startTime) < end);
            const hours = inWeek.reduce((acc: number, m: any) => {
                const diff = Math.max(0, new Date(m.endTime).getTime() - new Date(m.startTime).getTime());
                return acc + diff / (1000 * 60 * 60);
            }, 0);

            byWeek.push({
                label: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
                meetings: inWeek.length,
                hours: Number(hours.toFixed(1)),
            });
        }

        const decisionCount = meetings.reduce((count: number, m: any) => {
            const text = (m.summary || "").toLowerCase();
            if (!text) return count;
            const hits = text.match(/\b(decision|approved|next step|agreed)\b/g);
            return count + (hits?.length || 0);
        }, 0);

        const overdueTasks = normalizedActionItems.filter((item: any) => {
            if (!item.dueDate || item.status === "done") return false;
            const due = new Date(item.dueDate);
            if (Number.isNaN(due.getTime())) return false;
            return due.getTime() < now.getTime();
        }).length;

        const upcomingTimeline = upcoming.map((meeting: any) => ({
            ...meeting,
            platform: detectPlatformFromUrl(meeting.meetingUrl),
            participants: Array.isArray(meeting.attendees)
                ? meeting.attendees.map((a: any) => (typeof a === "string" ? a : ""))
                : [],
        }));

        // Fetch workspace members count from users collection
        let workspaceMembers = 1;
        if (user.slackTeamId) {
            const usersResult = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                [
                    Query.equal("slackTeamId", user.slackTeamId),
                    Query.limit(1),
                ],
            );
            workspaceMembers = usersResult.total;
        }

        const normalizedPlan = (user.currentPlan || "free").toLowerCase();
        const teamMode = workspaceMembers > 1 ? "team_workspace" : "single_user";
        const role = normalizedPlan === "enterprise" ? "Admin" : workspaceMembers > 1 ? "Member" : "Owner";

        const meetingIndex = meetings.slice(0, 80).map((meeting: any) => ({
            id: meeting.$id,
            title: meeting.title,
            summary: meeting.summary,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            platform: detectPlatformFromUrl(meeting.meetingUrl),
            transcriptReady: meeting.transcriptReady,
            hasRecording: Boolean(meeting.recordingUrl),
        }));

        const notifications: Array<{ id: string; level: "info" | "warning" | "error"; message: string; at: string }> = [];

        // calendarConnected comes from the user document
        if (!user.calendarConnected) {
            notifications.push({
                id: "calendar-disconnected",
                level: "warning",
                message: "Google Calendar is not connected.",
                at: now.toISOString(),
            });
        }

        if (!user.slackConnected) {
            notifications.push({
                id: "slack-disconnected",
                level: "info",
                message: "Slack integration is not connected.",
                at: now.toISOString(),
            });
        }

        for (const m of upcomingTimeline.slice(0, 5)) {
            const startsInMs = new Date(m.startTime).getTime() - now.getTime();
            if (startsInMs > 0 && startsInMs < 60 * 60 * 1000 && !m.botScheduled) {
                notifications.push({
                    id: `upcoming-${m.$id}`,
                    level: "warning",
                    message: `Meeting "${m.title}" starts within 1 hour and bot is not scheduled.`,
                    at: new Date(m.startTime).toISOString(),
                });
            }
        }

        for (const m of processing.filter((p: any) => p.stage === "failed").slice(0, 4)) {
            notifications.push({
                id: `pipeline-${m.id}`,
                level: "error",
                message: `Processing stalled for "${m.title}".`,
                at: new Date(m.startTime).toISOString(),
            });
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    overview: {
                        todayMeetings,
                        recordingsProcessed,
                        openActionItems,
                        closedActionItems,
                        summariesSent,
                    },
                    integrations: {
                        calendarConnected: user.calendarConnected,
                        slackConnected: user.slackConnected,
                        plan: user.currentPlan,
                    },
                    timeline: upcomingTimeline,
                    meetingIndex,
                    actionItems: normalizedActionItems.slice(0, 120),
                    processing,
                    insights: {
                        weekly: byWeek,
                        decisionCount,
                        overdueTasks,
                    },
                    analytics: {
                        botFunnel: {
                            sent: sentCount,
                            joined: joinedCount,
                            completed: completedCount,
                        },
                        completionRate,
                        transcriptSuccessRate,
                        summarySuccessRate,
                    },
                    notifications: notifications.slice(0, 10),
                    team: {
                        role,
                        workspaceMembers,
                        mode: teamMode,
                    },
                },
            },
            { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
        );
    } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard overview" }, { status: 500 });
    }
}
