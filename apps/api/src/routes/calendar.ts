import { Router } from "express";
import { listEvents, extractMeetingLinks } from "../services/google-calendar.js";
import { dispatchBotForEvent } from "../services/meeting-bot.js";
import { store } from "../store.js";
import type { ApiResponse, CalendarEvent } from "@repo/shared";

export const calendarRouter: Router = Router();

/**
 * GET /api/calendar/events
 * Fetch upcoming calendar events
 */
calendarRouter.get("/events", async (_req, res) => {
    try {
        const user = store.getUserByEmail("demo@zapbot.ai") || store.getUserByEmail("user@zapbot.ai");
        if (!user?.calendarConnected) {
            // Return demo calendar events
            const demoEvents: CalendarEvent[] = [
                {
                    id: "cal-001",
                    summary: "Weekly Team Standup",
                    start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
                    meetingUrl: "https://meet.google.com/abc-defg-hij",
                    platform: "google_meet",
                    attendees: ["alice@company.com", "bob@company.com"],
                    organizer: "alice@company.com",
                },
                {
                    id: "cal-002",
                    summary: "Product Design Review",
                    start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                    meetingUrl: "https://zoom.us/j/987654321",
                    platform: "zoom",
                    attendees: ["diana@company.com", "eric@company.com"],
                    organizer: "diana@company.com",
                },
                {
                    id: "cal-003",
                    summary: "Client Sync",
                    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                    meetingUrl: "https://teams.microsoft.com/l/meetup-join/xyz",
                    platform: "teams",
                    attendees: ["grace@client.com"],
                    organizer: "demo@zapbot.ai",
                },
            ];
            store.setCalendarEvents(demoEvents);
            res.json({ success: true, data: demoEvents } satisfies ApiResponse<CalendarEvent[]>);
            return;
        }

        // Real Google Calendar fetch
        const events = await listEvents(user.googleAccessToken!, user.googleRefreshToken!);
        const enrichedEvents = extractMeetingLinks(events);
        store.setCalendarEvents(enrichedEvents);
        res.json({ success: true, data: enrichedEvents } satisfies ApiResponse<CalendarEvent[]>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch calendar events",
        });
    }
});

/**
 * POST /api/calendar/sync
 * Sync calendar and dispatch bots for upcoming meetings
 */
calendarRouter.post("/sync", async (_req, res) => {
    try {
        const events = store.getAllCalendarEvents();
        const meetingEvents = events.filter((e) => e.meetingUrl);
        const dispatched: string[] = [];

        for (const event of meetingEvents) {
            try {
                const meeting = await dispatchBotForEvent(event);
                if (meeting) dispatched.push(meeting.id);
            } catch {
                console.warn(`Failed to dispatch bot for event: ${event.summary}`);
            }
        }

        res.json({
            success: true,
            data: { synced: meetingEvents.length, botsDispatched: dispatched.length, meetingIds: dispatched },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Calendar sync failed",
        });
    }
});
