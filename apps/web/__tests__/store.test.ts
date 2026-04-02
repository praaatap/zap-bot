import { describe, it, expect, beforeEach } from 'vitest';
import { useZapStore, Meeting } from '../lib/store';

describe('Web ZapStore (Zustand)', () => {
    beforeEach(() => {
        const state = useZapStore.getState();
        state.setUpcomingMeetings([]);
        state.setPastMeetings([]);
        state.setLoadingMeetings(false);
        state.setError(null);
    });

    it('should have initial state', () => {
        const state = useZapStore.getState();
        expect(state.upcomingMeetings).toEqual([]);
        expect(state.pastMeetings).toEqual([]);
        expect(state.isLoadingMeetings).toBe(false);
    });

    it('should add an upcoming meeting', () => {
        const mtg: Meeting = {
            id: 'test-1',
            title: 'Test',
            platform: 'google_meet',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            botScheduled: false
        };
        useZapStore.getState().addUpcomingMeeting(mtg);

        expect(useZapStore.getState().upcomingMeetings).toContainEqual(mtg);
    });

    it('should update a meeting status', () => {
        const id = 'test-update';
        useZapStore.getState().addUpcomingMeeting({
            id,
            title: 'Old Title',
            platform: 'zoom',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            botScheduled: false
        });

        useZapStore.getState().updateMeetingStatus(id, { title: 'New Title', botScheduled: true });

        const mtg = useZapStore.getState().upcomingMeetings.find(m => m.id === id);
        expect(mtg?.title).toBe('New Title');
        expect(mtg?.botScheduled).toBe(true);
    });

    it('should handle loading states', () => {
        useZapStore.getState().setLoadingMeetings(true);
        expect(useZapStore.getState().isLoadingMeetings).toBe(true);
    });
});
