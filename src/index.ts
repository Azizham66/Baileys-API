// Server Entry Point
import express, { Request, Response } from "express";
import http from "http";

// routes and controllers
import authRoutes from "@/routes/auth.routes";
import messageRoutes from "@/routes/message.routes";
import { loginController, logoutController } from "@/controllers/auth.controller";
import { sendMessageController } from "@/controllers/message.controller";

// Websocket and WhatsApp Client
import { initializeSocketServer } from "@/socket";
import { getSock, isConnected } from "@/whatsappClient";

// Utils
import { sendSuccess, sendError } from "@/utils/response";

const app = express();
const PORT = 3000;

app.use(express.json());

// Register Auth Routes
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/message", messageRoutes);

// Backward Compatibility Routes
app.post("/connect", loginController);
app.delete("/logout", logoutController);
app.post("/send-message", sendMessageController);

// Create the HTTP server
const server = http.createServer(app);

// Initialize WebSockets
initializeSocketServer(server);

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
