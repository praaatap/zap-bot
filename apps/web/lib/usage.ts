import { prisma } from "./prisma"

interface PlanLimits {
    meetings: number
    chatMessages: number
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
    free: { meetings: 3, chatMessages: 10 },
    starter: { meetings: 10, chatMessages: 30 },
    pro: { meetings: 30, chatMessages: 100 },
    premium: { meetings: -1, chatMessages: -1 }
}

export async function canUserSendBot(userId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!user) {
        return { allowed: false, reason: 'User not found' }
    }

    if (user.subscriptionStatus === 'expired') {
        return { allowed: false, reason: 'Your subscription has expired. Please renew to continue.' }
    }

    const limits = PLAN_LIMITS[user.currentPlan]

    if (!limits) {
        return { allowed: false, reason: 'Invalid subscription plan' }
    }

    const meetingsCount = user.meetingsThisMonth || 0
    if (limits.meetings !== -1 && meetingsCount >= limits.meetings) {
        return { allowed: false, reason: `You've reached your monthly limit of ${limits.meetings} meetings` }
    }

    return { allowed: true }
}

export async function canUserChat(userId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!user) {
        return { allowed: false, reason: 'user not found' }
    }

    if (user.subscriptionStatus === 'expired') {
        return { allowed: false, reason: 'Your subscription has expired. Please renew to continue chat.' }
    }

    const limits = PLAN_LIMITS[user.currentPlan]

    if (!limits) {
        return { allowed: false, reason: 'invalid subscription plan' }
    }

    const chatCount = user.chatMessagesToday || 0
    if (limits.chatMessages !== -1 && chatCount >= limits.chatMessages) {
        return { allowed: false, reason: `you've reached your daily limit of ${limits.chatMessages} messages` }
    }

    return { allowed: true }
}

export async function incrementMeetingUsage(userId: string) {
    await prisma.user.update({
        where: { clerkId: userId },
        data: {
            meetingsThisMonth: { increment: 1 }
        }
    })
}

export async function incrementChatUsage(userId: string) {
    await prisma.user.update({
        where: { clerkId: userId },
        data: {
            chatMessagesToday: { increment: 1 }
        }
    })
}

export function getPlanLimits(plan: string): PlanLimits {
    const limits = PLAN_LIMITS[plan]
    return limits ?? PLAN_LIMITS.free!
}
