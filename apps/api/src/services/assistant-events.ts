import type { AssistantEvent, AssistantEventType } from "@repo/shared";
import { store } from "../store.js";

export interface ExtensionDeliveryResult {
    extensionId: string;
    extensionName: string;
    transport: "webhook" | "browser" | "internal";
    target: string;
    status: "delivered" | "failed";
    error?: string;
}

interface DispatchInput {
    type: AssistantEventType;
    actorUserId?: string;
    meetingId?: string;
    workspaceId?: string;
    sessionId?: string;
    payload?: Record<string, unknown>;
}

async function deliverWebhook(target: string, event: AssistantEvent, secret?: string): Promise<void> {
    const response = await fetch(target, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify({ event }),
    });

    if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
    }
}

function resolveWorkspaceId(input: DispatchInput): string | undefined {
    if (input.workspaceId) {
        return input.workspaceId;
    }
    if (!input.meetingId) {
        return undefined;
    }
    const meeting = store.getMeeting(input.meetingId);
    return meeting?.workspaceId;
}

export async function dispatchAssistantEvent(input: DispatchInput): Promise<{
    event: AssistantEvent;
    deliveries: ExtensionDeliveryResult[];
}> {
    const workspaceId = resolveWorkspaceId(input);
    const event = store.addAssistantEvent({
        ...input,
        workspaceId,
    });

    if (!workspaceId) {
        return { event, deliveries: [] };
    }

    const extensions = store
        .listWorkspaceExtensions(workspaceId)
        .filter((ext) => ext.status === "active" && ext.subscribedEvents.includes(input.type));

    const deliveries: ExtensionDeliveryResult[] = [];

    for (const extension of extensions) {
        try {
            if (extension.transport === "webhook") {
                await deliverWebhook(extension.target, event, extension.secret);
            }

            // browser/internal transports are queued conceptually and treated as delivered.
            store.markExtensionTriggered(extension.id);

            deliveries.push({
                extensionId: extension.id,
                extensionName: extension.name,
                transport: extension.transport,
                target: extension.target,
                status: "delivered",
            });
        } catch (error) {
            deliveries.push({
                extensionId: extension.id,
                extensionName: extension.name,
                transport: extension.transport,
                target: extension.target,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown delivery error",
            });
        }
    }

    return { event, deliveries };
}
