import { Router } from "express";
import { getAuthUrl, getTokens } from "../services/google-calendar.js";
import { store } from "../store.js";
import type { ApiResponse, User } from "@repo/shared";

export const authRouter: Router = Router();

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen
 */
authRouter.get("/google", (_req, res) => {
    try {
        const url = getAuthUrl();
        res.json({ success: true, data: { url } } satisfies ApiResponse<{ url: string }>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate auth URL",
        } satisfies ApiResponse<never>);
    }
});

/**
 * GET /api/auth/google/callback
 * Exchange authorization code for tokens
 */
authRouter.get("/google/callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) {
        res.status(400).json({ success: false, error: "Missing authorization code" });
        return;
    }

    try {
        const tokens = await getTokens(code);
        // Store user with tokens
        const user = store.upsertUser({
            email: "user@zapbot.ai", // In production, decode from ID token
            name: "Connected User",
            calendarConnected: true,
            googleAccessToken: tokens.access_token || undefined,
            googleRefreshToken: tokens.refresh_token || undefined,
        });

        // Redirect back to frontend dashboard
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/dashboard?connected=true`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "OAuth callback failed",
        });
    }
});

/**
 * GET /api/auth/status
 * Check if user is connected to Google Calendar
 */
authRouter.get("/status", (_req, res) => {
    // For demo, check if any user is connected
    const user = store.getUserByEmail("demo@zapbot.ai") || store.getUserByEmail("user@zapbot.ai");
    res.json({
        success: true,
        data: {
            connected: user?.calendarConnected || false,
            email: user?.email,
            name: user?.name,
        },
    } satisfies ApiResponse<{ connected: boolean; email?: string; name?: string }>);
});
