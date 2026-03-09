import type { Meeting, User, Transcript, CalendarEvent } from "@repo/shared";
import { v4 as uuid } from "uuid";

// ── In-Memory Store ────────────────────────────────────────────────
// This can be swapped for a real database (Postgres, MongoDB, etc.)

class Store {
    private users: Map<string, User> = new Map();
    private meetings: Map<string, Meeting> = new Map();
    private transcripts: Map<string, Transcript> = new Map();
    private calendarEvents: Map<string, CalendarEvent> = new Map();
    private logs: any[] = [];
    private chatMessages: any[] = [];

    constructor() {
        // Seed with demo data
        this.seedDemoData();
    }

    // ── Users ──────────────────────────────────────────────────────
    getUser(id: string): User | undefined {
        return this.users.get(id);
    }

    getUserByEmail(email: string): User | undefined {
        return [...this.users.values()].find((u) => u.email === email);
    }

    upsertUser(user: Partial<User> & { email: string }): User {
        const existing = this.getUserByEmail(user.email);
        if (existing) {
            const updated = { ...existing, ...user, updatedAt: new Date().toISOString() };
            this.users.set(existing.id, updated as User);
            return updated as User;
        }
        const newUser: User = {
            id: uuid(),
            name: user.name || user.email.split("@")[0] || "User",
            email: user.email,
            calendarConnected: user.calendarConnected || false,
            googleAccessToken: user.googleAccessToken,
            googleRefreshToken: user.googleRefreshToken,
            currentPlan: user.currentPlan || "free",
            subscriptionStatus: user.subscriptionStatus || "active",
            meetingsThisMonth: user.meetingsThisMonth || 0,
            chatMessagesToday: user.chatMessagesToday || 0,
            botName: user.botName,
            botImageUrl: user.botImageUrl,
            integrations: user.integrations || [],
            createdAt: new Date().toISOString(),
        };
        this.users.set(newUser.id, newUser);
        return newUser;
    }

    // ── Meetings ───────────────────────────────────────────────────
    getMeeting(id: string): Meeting | undefined {
        return this.meetings.get(id);
    }

    getAllMeetings(): Meeting[] {
        return [...this.meetings.values()].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    upsertMeeting(meeting: Partial<Meeting> & { id?: string }): Meeting {
        const id = meeting.id || uuid();
        const existing = this.meetings.get(id);
        const updated: Meeting = {
            ...existing,
            ...meeting,
            id,
            updatedAt: new Date().toISOString(),
            createdAt: existing?.createdAt || new Date().toISOString(),
        } as Meeting;
        this.meetings.set(id, updated);
        return updated;
    }

    // ── Transcripts ────────────────────────────────────────────────
    getTranscript(meetingId: string): Transcript | undefined {
        return this.transcripts.get(meetingId);
    }

    setTranscript(transcript: Transcript): void {
        this.transcripts.set(transcript.meetingId, transcript);
    }

    appendTranscriptEntry(meetingId: string, entry: Transcript["entries"][0]): void {
        const transcript = this.transcripts.get(meetingId);
        if (transcript) {
            transcript.entries.push(entry);
        } else {
            this.transcripts.set(meetingId, {
                meetingId,
                language: "en",
                createdAt: new Date().toISOString(),
                entries: [entry],
            });
        }
    }

    // ── Calendar Events ────────────────────────────────────────────
    getAllCalendarEvents(): CalendarEvent[] {
        return [...this.calendarEvents.values()].sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );
    }

    setCalendarEvents(events: CalendarEvent[]): void {
        this.calendarEvents.clear();
        events.forEach((e) => this.calendarEvents.set(e.id, e));
    }

    // ── Stats ──────────────────────────────────────────────────────
    getStats() {
        const meetings = this.getAllMeetings();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
            totalMeetings: meetings.length,
            hoursTranscribed: Math.round(
                meetings.reduce((acc, m) => acc + (m.duration || 0), 0) / 3600
            ),
            activeBots: meetings.filter((m) =>
                ["joining", "in_meeting", "recording"].includes(m.botStatus)
            ).length,
            meetingsThisWeek: meetings.filter(
                (m) => new Date(m.createdAt) >= weekAgo
            ).length,
        };
    }

    // ── Chat Messages ──────────────────────────────────────────────
    getChatMessages() {
        return this.chatMessages;
    }

    addChatMessage(msg: any) {
        this.chatMessages.push({ ...msg, timestamp: new Date().toISOString() });
    }

    // ── Seed Demo Data ─────────────────────────────────────────────
    private seedDemoData(): void {
        const now = new Date();

        // Demo user
        this.upsertUser({
            email: "demo@zapbot.ai",
            name: "Demo User",
            calendarConnected: true,
        });

        // Demo meetings
        const demoMeetings: Partial<Meeting>[] = [
            {
                id: "mtg-001",
                title: "Weekly Team Standup",
                platform: "google_meet",
                meetingUrl: "https://meet.google.com/abc-defg-hij",
                startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
                duration: 1800,
                botStatus: "completed",
                participants: ["Alice Johnson", "Bob Smith", "Charlie Park"],
                summary:
                    "Discussed sprint progress. Alice completed the auth module. Bob needs help with the API integration. Charlie will review the test suite by Friday.",
            },
            {
                id: "mtg-002",
                title: "Product Design Review",
                platform: "zoom",
                meetingUrl: "https://zoom.us/j/123456789",
                startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
                duration: 3600,
                botStatus: "completed",
                participants: ["Diana Lee", "Eric Wang", "Fiona Martinez"],
                summary:
                    "Reviewed new dashboard mockups. Team agreed on the dark theme approach. Need to finalize the color palette by next week. Action item: Diana will create high-fidelity prototypes.",
            },
            {
                id: "mtg-003",
                title: "Client Onboarding Call",
                platform: "teams",
                meetingUrl: "https://teams.microsoft.com/l/meetup-join/abc123",
                startTime: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
                botStatus: "pending",
                participants: ["Grace Kim"],
            },
            {
                id: "mtg-004",
                title: "Engineering Architecture Review",
                platform: "google_meet",
                meetingUrl: "https://meet.google.com/xyz-uvwx-rst",
                startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
                botStatus: "pending",
                participants: ["Henry Chen", "Iris Patel", "Jake Thompson"],
            },
            {
                id: "mtg-005",
                title: "Sprint Retrospective",
                platform: "google_meet",
                meetingUrl: "https://meet.google.com/ret-rosp-ect",
                startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString(),
                duration: 2700,
                botStatus: "completed",
                participants: ["Alice Johnson", "Bob Smith", "Diana Lee", "Eric Wang"],
                summary:
                    "Team reflected on the sprint. Key wins: improved deployment pipeline, reduced bug backlog. Areas to improve: better estimation, more pair programming.",
            },
        ];

        demoMeetings.forEach((m) => this.upsertMeeting(m));

        // Demo transcripts
        this.setTranscript({
            meetingId: "mtg-001",
            language: "en",
            createdAt: new Date().toISOString(),
            entries: [
                { speaker: "Alice Johnson", text: "Good morning everyone. Let's get started with the standup.", startTime: 0, endTime: 5 },
                { speaker: "Bob Smith", text: "Hey Alice! I've been working on the API integration but hit a blocker with the authentication flow.", startTime: 6, endTime: 14 },
                { speaker: "Alice Johnson", text: "I actually just finished the auth module yesterday. I can walk you through it after this call.", startTime: 15, endTime: 22 },
                { speaker: "Bob Smith", text: "That would be amazing, thanks!", startTime: 23, endTime: 25 },
                { speaker: "Charlie Park", text: "On my end, I'm almost done with the test suite. Should have full coverage by Friday.", startTime: 26, endTime: 33 },
                { speaker: "Alice Johnson", text: "Great progress everyone. Let's sync again tomorrow. Charlie, feel free to reach out if you need any help with the test mocks.", startTime: 34, endTime: 43 },
                { speaker: "Charlie Park", text: "Will do. Thanks everyone!", startTime: 44, endTime: 47 },
            ],
        });

        this.setTranscript({
            meetingId: "mtg-002",
            language: "en",
            createdAt: new Date().toISOString(),
            entries: [
                { speaker: "Diana Lee", text: "Welcome to the design review. I have three mockup variants to show you today.", startTime: 0, endTime: 7 },
                { speaker: "Eric Wang", text: "Looking forward to it. Are we going with the dark theme we discussed last time?", startTime: 8, endTime: 14 },
                { speaker: "Diana Lee", text: "Yes, all three variants use a dark base. Let me share my screen.", startTime: 15, endTime: 21 },
                { speaker: "Fiona Martinez", text: "I really like variant B. The glassmorphism cards give it a premium feel.", startTime: 22, endTime: 29 },
                { speaker: "Eric Wang", text: "Agreed. The gradient accents in variant B are much more polished.", startTime: 30, endTime: 36 },
                { speaker: "Diana Lee", text: "Perfect. I'll create high-fidelity prototypes based on variant B by next week.", startTime: 37, endTime: 44 },
            ],
        });
    }
}

// Singleton instance
export const store = new Store();
