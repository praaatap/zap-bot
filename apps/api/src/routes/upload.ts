import { Router } from "express";
import multer from "multer";
import { uploadBotAvatar } from "../services/aws.js";

export const uploadRouter: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/upload/bot-avatar
 */
uploadRouter.post("/bot-avatar", upload.single("file"), async (req, res) => {
    try {
        const userId = req.headers["x-user-id"] as string || "demo-user";
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file provided" });
        }

        const publicUrl = await uploadBotAvatar(userId, file.buffer, file.mimetype);

        res.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});
