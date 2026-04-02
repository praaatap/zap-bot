import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Enable CORS
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// ── Health Check ─────────────────────────────────────────────────────
app.get("/health", (c) => {
  return c.json({ status: "ok", provider: "cloudflare", timestamp: new Date().toISOString() });
});

// ── Meeting Records API ─────────────────────────────────────────────
// This worker can act as a lightweight edge proxy for meeting data
app.get("/api/records/:meetingId", async (c) => {
  const meetingId = c.req.param("meetingId");
  
  // In a real implementation, fetch from D1 or KV
  // For now, we return a mock structure that aligns with the dashboard
  return c.json({
    success: true,
    data: {
      id: meetingId,
      recordingUrl: `https://storage.zap-bot.ai/recordings/${meetingId}.mp4`,
      transcriptReady: true,
      processed: true
    }
  });
});

// ── Webhook Handler (Incoming bot events) ──────────────────────────
app.post("/api/events", async (c) => {
  const body = await c.req.json();
  console.log("Edge Received Event:", body.type);
  
  // Logic to update KV or trigger further processing
  return c.json({ success: true, received: true });
});

export default app;
