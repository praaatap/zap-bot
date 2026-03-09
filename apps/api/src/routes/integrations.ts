import { Router } from "express";
import { store } from "../store.js";
import { AsanaAPI } from "../services/integrations/asana.js";
import { JiraAPI } from "../services/integrations/jira.js";
import { TrelloAPI } from "../services/integrations/trello.js";
import { refreshAsanaToken } from "../services/integrations/refreshToken.js";

export const integrationsRouter: Router = Router();

const asana = new AsanaAPI();
const jira = new JiraAPI();
const trello = new TrelloAPI();

/**
 * GET /api/integrations
 * Get all connected integrations for the current user
 */
integrationsRouter.get("/", async (req, res) => {
    // Mock user for now
    const user = Array.from(store["users"].values())[0];
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, integrations: user.integrations });
});

/**
 * GET /api/integrations/asana/workspaces
 */
integrationsRouter.get("/asana/workspaces", async (req, res) => {
    const user = Array.from(store["users"].values())[0];
    const integration = user?.integrations.find(i => i.platform === 'asana');

    if (!integration) return res.status(404).json({ success: false, error: "Asana not connected" });

    try {
        const workspaces = await asana.getWorkspaces(integration.accessToken);
        res.json({ success: true, workspaces: workspaces.data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/integrations/trello/boards
 */
integrationsRouter.get("/trello/boards", async (req, res) => {
    const user = Array.from(store["users"].values())[0];
    const integration = user?.integrations.find(i => i.platform === 'trello');

    if (!integration) return res.status(404).json({ success: false, error: "Trello not connected" });

    try {
        const boards = await trello.getBoards(integration.accessToken);
        res.json({ success: true, boards });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/integrations/sync-meeting
 * Manually sync meeting action items to all connected integrations
 */
integrationsRouter.post("/sync-meeting", async (req, res) => {
    const { meetingId } = req.body;
    const meeting = store.getMeeting(meetingId);

    if (!meeting) return res.status(404).json({ success: false, error: "Meeting not found" });

    const user = Array.from(store["users"].values())[0];
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const results = [];

    for (const integration of user.integrations) {
        if (!integration.connected) continue;

        try {
            if (integration.platform === 'asana' && integration.projectName) {
                for (const item of (meeting.actionItems || [])) {
                    await asana.createTask(integration.accessToken, integration.projectName, { title: item });
                }
                results.push({ platform: 'asana', status: 'success' });
            }

            if (integration.platform === 'trello' && integration.boardName) {
                // Simplified: assuming first list on the board
                const lists = await trello.getBoardLists(integration.accessToken, integration.boardName);
                if (lists && lists.length > 0) {
                    for (const item of (meeting.actionItems || [])) {
                        await trello.createCard(integration.accessToken, lists[0].id, { title: item });
                    }
                }
                results.push({ platform: 'trello', status: 'success' });
            }
        } catch (error: any) {
            results.push({ platform: integration.platform, status: 'error', error: error.message });
        }
    }

    res.json({ success: true, results });
});
