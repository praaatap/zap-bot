/**
 * Utility to generate calendar links for different platforms.
 */

export interface CalendarEvent {
    title: string;
    description: string;
    location: string;
    startTime: string; // ISO format
    endTime: string;   // ISO format
}

function formatDate(isoDate: string): string {
    return isoDate.replace(/-|:|\.\d+/g, "");
}

export function generateGoogleCalendarLink(event: CalendarEvent): string {
    const start = formatDate(new Date(event.startTime).toISOString());
    const end = formatDate(new Date(event.endTime || new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000).toISOString()).toISOString());

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${start}/${end}`,
        details: event.description,
        location: event.location,
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookLink(event: CalendarEvent): string {
    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: event.title,
        startdt: event.startTime,
        enddt: event.endTime || new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000).toISOString(),
        body: event.description,
        location: event.location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function generateOffice365Link(event: CalendarEvent): string {
    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: event.title,
        startdt: event.startTime,
        enddt: event.endTime || new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000).toISOString(),
        body: event.description,
        location: event.location,
    });

    return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
