import { prisma } from "@/lib/prisma";

export async function getOrCreateUser(clerkId: string) {
    return prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId },
    });
}
