import express, { Request, Response } from "express";
import http from "http";
import authRoutes from "@/routes/auth.routes";
import { loginController, logoutController } from "@/controllers/auth.controller";
import { initializeSocketServer } from "@/socket";
import { getSock, isConnected } from "@/whatsappClient";
import { sendSuccess, sendError } from "@/utils/response";

const app = express();
const PORT = 3000;

app.use(express.json());

// Register Auth Routes
app.use("/api/v2/auth", authRoutes);

// Backward Compatibility Routes
app.post("/connect", loginController);
app.delete("/logout", logoutController);

// Create the HTTP server
const server = http.createServer(app);

// Initialize WebSockets
initializeSocketServer(server);

app.post('/send-message', async (req: Request, res: Response) => {
    const { jid, message } = req.body;
    const sock = getSock();

    if (!sock || !isConnected()) {
        return sendError(res, "Not connected to WhatsApp, make sure to call the endpoint /connect to be able to send a message", undefined, 400);
    }

    try {
        await sock.sendMessage(jid, message);
        console.log("📤 Message sent");
        return sendSuccess(res, "Message sent Successfully");
    } catch (err: any) {
        console.error("❌ sendMessage error", err);
        return sendError(res, "Failed to send message", err.message, 500);
    }
});

// Add this function to list groups
async function listGroups() {
    const sock = getSock();
    if (!sock) throw new Error('Not connected');

    // Fetch all groups you participate in
    const groups = await sock.groupFetchAllParticipating();

    // groups is an object with keys = group IDs and values = metadata
    return Object.entries(groups).map(([id, metadata]) => ({
        id,
        name: metadata.subject || 'Unnamed Group'
    }));
}

// Add this endpoint to get groups
app.get('/groups', async (req: Request, res: Response) => {
    try {
        if (!isConnected()) {
            return sendError(res, "Not connected to WhatsApp. Please connect first.", undefined, 400);
        }

        const groups = await listGroups();
        return sendSuccess(res, undefined, groups);
    } catch (err: any) {
        console.error("❌ Failed to list groups", err);
        return sendError(res, "Failed to list groups", err.message, 500);
    }
});

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
