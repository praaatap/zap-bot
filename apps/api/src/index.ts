import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { calendarRouter } from "./routes/calendar.js";
import { meetingsRouter } from "./routes/meetings.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { chatRouter } from "./routes/chat.js";
import { systemRouter } from "./routes/system.js";
import { agentRouter } from "./routes/agent.js";

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "zap-bot-api", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/meetings", meetingsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/chat", chatRouter);
app.use("/api/system", systemRouter);
app.use("/api/agent", agentRouter);

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`⚡ Zap Bot API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);

    // ── Background Workers ──────────────────────────────────────────
    // In a real production app, this would be a separate CRON or Lambda Trigger.
    // For this monorepo/serverless-ready architecture, we simulate it with an interval.
    console.log("🔄 Starting background calendar sync worker (Interval: 5 mins)");
    setInterval(async () => {
        try {
            // Trigger the sync logic internally
            // This hits the same logic as POST /api/calendar/sync
            const response = await fetch(`http://localhost:${PORT}/api/calendar/sync`, { method: "POST" });
            const result = await response.json();
            if (result.success && result.data.botsDispatched > 0) {
                console.log(`🤖 Auto-dispatched ${result.data.botsDispatched} bots for upcoming meetings.`);
            }
        } catch (err) {
            console.error("❌ Background sync failed:", err);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
});

export default app;
