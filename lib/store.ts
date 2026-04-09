import { create } from 'zustand';

export interface Meeting {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    meetingUrl?: string;
    attendees?: any;
    participants?: string[];
    recordingUrl?: string;
    transcriptReady?: boolean;
    botScheduled?: boolean;
    botSent?: boolean;
    botId?: string;
    platform?: string;
    summary?: string;
}

interface Stats {
    totalMeetings: number;
    hoursTranscribed: number;
    activeBots: number;
    meetingsThisWeek: number;
    activeMeetings?: number;
    recordingsCount?: number;
    weekMeetings?: number;
}

interface ZapStore {
    // State
    upcomingMeetings: Meeting[];
    pastMeetings: Meeting[];
    stats: Stats | null;
    isLoadingStats: boolean;
    isLoadingMeetings: boolean;
    error: string | null;

    // Actions
    setUpcomingMeetings: (meetings: Meeting[]) => void;
    setPastMeetings: (meetings: Meeting[]) => void;
    addUpcomingMeeting: (meeting: Meeting) => void;
    updateMeetingStatus: (id: string, updates: Partial<Meeting>) => void;
    setStats: (stats: Stats) => void;
    setLoadingMeetings: (loading: boolean) => void;
    setLoadingStats: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useZapStore = create<ZapStore>((set) => ({
    // Initial State
    upcomingMeetings: [],
    pastMeetings: [],
    stats: null,
    isLoadingMeetings: false,
    isLoadingStats: false,
    error: null,

    // Actions
    setUpcomingMeetings: (meetings) => set({ upcomingMeetings: meetings }),
    setPastMeetings: (meetings) => set({ pastMeetings: meetings }),

    addUpcomingMeeting: (meeting) => set((state) => ({
        upcomingMeetings: [meeting, ...state.upcomingMeetings].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
    })),

    updateMeetingStatus: (id, updates) => set((state) => ({
        upcomingMeetings: state.upcomingMeetings.map((m) =>
            m.id === id ? { ...m, ...updates } : m
        ),
        pastMeetings: state.pastMeetings.map((m) =>
            m.id === id ? { ...m, ...updates } : m
        )
    })),

    setStats: (stats) => set({ stats }),
    setLoadingMeetings: (loading) => set({ isLoadingMeetings: loading }),
    setLoadingStats: (loading) => set({ isLoadingStats: loading }),
    setError: (error) => set({ error }),
}));
