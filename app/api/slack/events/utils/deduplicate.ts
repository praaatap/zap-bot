const eventCache = new Map<string, number>();

export function isDuplicateEvent(eventId: string, timestamp: string) {
    const now = Date.now();
    const eventTime = parseInt(timestamp) * 1000;

    // Cache cleanup (older than 10 mins)
    for (const [key, time] of eventCache.entries()) {
        if (now - time > 10 * 60 * 1000) {
            eventCache.delete(key);
        }
    }

    if (eventCache.has(eventId)) {
        return true;
    }

    eventCache.set(eventId, eventTime);
    return false;
}
