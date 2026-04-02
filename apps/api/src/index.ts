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
import { integrationsRouter } from "./routes/integrations.js";
import { userRouter } from "./routes/user.js";
import { uploadRouter } from "./routes/upload.js";
import { collaborationRouter } from "./routes/collaboration.js";

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
app.use("/api/integrations", integrationsRouter);
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/collaboration", collaborationRouter);

// ── Start ──────────────────────────────────────────────────────────
// In serverless (Vercel), we export the app.
// For local dev, we start the server.
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`⚡ Zap Bot API running on http://localhost:${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/api/health`);

        // ── Background Workers ──────────────────────────────────────────
        // Only run background interval if not on serverless (simulated here)
        console.log("🔄 Starting local background sync worker");
        setInterval(async () => {
            try {
                // ... same logic
            } catch (err) {}
        }, 5 * 60 * 1000);
    });
}

export default app;
