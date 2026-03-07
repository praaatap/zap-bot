import { Router } from "express";

export const systemRouter: Router = Router();

systemRouter.get("/status", (_req, res) => {
    const status = {
        api: {
            ok: true,
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.round(process.uptime()),
        },
        integrations: {
            googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
            meetingBaasConfigured: Boolean(process.env.MEETING_BAAS_API_KEY),
            meetingBaasMockMode: process.env.MEETING_BAAS_MOCK !== "false",
            awsConfigured: Boolean(process.env.AWS_REGION),
            pageIndexConfigured: Boolean(process.env.PAGEINDEX_API_KEY),
        },
        mode: process.env.SERVER_MODE || "local-api",
    };

    res.json({ success: true, data: status });
});
