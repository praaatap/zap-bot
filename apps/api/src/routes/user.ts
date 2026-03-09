import { Router } from "express";
import { store } from "../store.js";
import type { ApiResponse } from "@repo/shared";

export const userRouter: Router = Router();

/**
 * GET /api/user/bot-settings
 * Fetch bot settings for the user
 */
userRouter.get("/bot-settings", async (req, res) => {
    try {
        const userEmail = "demo@zapbot.ai"; // Mocked to demo user
        const user = store.getUserByEmail(userEmail);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({
            success: true,
            data: {
                botName: user.botName || "Zap Bot",
                botImageUrl: user.botImageUrl || null,
                plan: user.currentPlan || "free"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch bot settings" });
    }
});

/**
 * POST /api/user/bot-settings
 * Update bot settings for the user
 */
userRouter.post("/bot-settings", async (req, res) => {
    try {
        const userEmail = "demo@zapbot.ai"; // Mocked to demo user
        const { botName, botImageUrl } = req.body;

        const updated = store.upsertUser({
            email: userEmail,
            botName,
            botImageUrl
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to save bot settings" });
    }
});
