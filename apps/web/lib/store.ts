import { create } from 'zustand';

interface Meeting {
    id: string;
    title: string;
    platform: string;
    startTime: string;
    botStatus: string;
    duration?: number;
    participants?: string[];
    summary?: string;
    actionItems?: string[];
    sentiment?: string;
    healthScore?: number;
}

interface Stats {
    totalMeetings: number;
    hoursTranscribed: number;
    activeBots: number;
    meetingsThisWeek: number;
}

interface ZapStore {
    meetings: Meeting[];
    stats: Stats | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setMeetings: (meetings: Meeting[]) => void;
    addMeeting: (meeting: Meeting) => void;
    updateMeeting: (id: string, updates: Partial<Meeting>) => void;
    setStats: (stats: Stats) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useZapStore = create<ZapStore>((set) => ({
    meetings: [],
    stats: null,
    isLoading: false,
    error: null,

    setMeetings: (meetings) => set({ meetings }),
    addMeeting: (meeting) => set((state) => ({
        meetings: [meeting, ...state.meetings]
    })),
    updateMeeting: (id, updates) => set((state) => ({
        meetings: state.meetings.map((m) => m.id === id ? { ...m, ...updates } : m)
    })),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}));
