import { describe, it, expect, beforeEach } from 'vitest';
import { useZapStore } from '../lib/store';
import { MeetingPlatform, BotStatus } from '@repo/shared';

describe('Web ZapStore (Zustand)', () => {
    beforeEach(() => {
        // Reset the store manually if needed, although Zustand persists state in tests
        // unless we use a helper or reset logic.
        const state = useZapStore.getState();
        state.setMeetings([]);
        state.setLoading(false);
        state.setError(null);
    });

    it('should have initial state', () => {
        const state = useZapStore.getState();
        expect(state.meetings).toEqual([]);
        expect(state.isLoading).toBe(false);
    });

    it('should add a meeting', () => {
        const mtg = {
            id: 'test-1',
            title: 'Test',
            platform: 'google_meet' as MeetingPlatform,
            startTime: new Date().toISOString(),
            botStatus: 'pending' as BotStatus
        };
        useZapStore.getState().addMeeting(mtg);

        expect(useZapStore.getState().meetings).toContainEqual(mtg);
    });

    it('should update a meeting', () => {
        const id = 'test-update';
        useZapStore.getState().addMeeting({
            id,
            title: 'Old Title',
            platform: 'zoom' as MeetingPlatform,
            startTime: '',
            botStatus: 'pending' as BotStatus
        });

        useZapStore.getState().updateMeeting(id, { title: 'New Title', botStatus: 'completed' });

        const mtg = useZapStore.getState().meetings.find(m => m.id === id);
        expect(mtg?.title).toBe('New Title');
        expect(mtg?.botStatus).toBe('completed');
    });

    it('should handle loading states', () => {
        useZapStore.getState().setLoading(true);
        expect(useZapStore.getState().isLoading).toBe(true);
    });
});
