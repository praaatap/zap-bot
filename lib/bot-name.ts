type UserIdentityLike = {
    name?: unknown;
    email?: unknown;
    clerkId?: unknown;
};

const BOT_SUFFIX = "Agent Bot";

function normalizeWhitespace(value: string): string {
    return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function toTitleCase(value: string): string {
    return value
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function sanitizeName(value: string): string {
    return toTitleCase(
        normalizeWhitespace(value)
            .replace(/@.+$/, "")
            .replace(/\bagent bot\b/gi, "")
            .replace(/[^\p{L}\p{N}\s'.]/gu, "")
            .trim()
    );
}

function pickString(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

export function resolveUserDisplayName(user: UserIdentityLike): string {
    const candidates = [
        pickString(user.name),
        pickString(user.email)?.split("@")[0] || null,
        pickString(user.clerkId),
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;
        const cleaned = sanitizeName(candidate);
        if (cleaned) {
            return cleaned.slice(0, 50);
        }
    }

    return "User";
}

export function resolveAgentBotName(user: UserIdentityLike): string {
    return `${resolveUserDisplayName(user)} ${BOT_SUFFIX}`.trim();
}
