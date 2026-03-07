import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/store.js';
import { MeetingPlatform } from '@repo/shared';

describe('API Store', () => {
    beforeEach(() => {
        // Clear or re-seed if necessary, but store is a singleton.
        // For simple tests, we can just check the seeded data or add new.
    });

    it('should retrieve seeded demo meetings', () => {
        const meetings = store.getAllMeetings();
        expect(meetings.length).toBeGreaterThan(0);
        expect(meetings[0]).toHaveProperty('id');
        expect(meetings[0]).toHaveProperty('title');
    });

    it('should upsert a new meeting', () => {
        const newMtg = {
            title: 'Test Meeting',
            platform: 'google_meet' as MeetingPlatform,
            meetingUrl: 'https://meet.google.com/test',
        };
        const created = store.upsertMeeting(newMtg);
        expect(created.title).toBe('Test Meeting');

        const retrieved = store.getMeeting(created.id);
        expect(retrieved?.title).toBe('Test Meeting');
    });

    it('should calculate stats correctly', () => {
        const stats = store.getStats();
        expect(stats).toHaveProperty('totalMeetings');
        expect(stats).toHaveProperty('hoursTranscribed');
        expect(stats.totalMeetings).toBeGreaterThan(0);
    });

    it('should manage transcripts', () => {
        const meetingId = 'mtg-001';
        const entry = {
            speaker: 'Test Speaker',
            text: 'Hello world',
            startTime: 0,
            endTime: 5
        };
        store.appendTranscriptEntry(meetingId, entry);

        const transcript = store.getTranscript(meetingId);
        expect(transcript?.entries).toContainEqual(entry);
    });
});
