import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        // Allow app build/start without immediate DB init; throw only if Prisma is used.
        return new Proxy({} as PrismaClient, {
            get() {
                throw new Error("DATABASE_URL is not set. Configure apps/web/.env before using database routes.");
            },
        });
    }

    return new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
