// Server Entry Point
import express, { Request, Response } from "express";
import http from "http";

// routes and controllers
import authRoutes from "@/routes/auth.routes";
import messageRoutes from "@/routes/message.routes";
import groupRoutes from "@/routes/group.routes";
import { loginController, logoutController } from "@/controllers/auth.controller";
import { sendMessageController } from "@/controllers/message.controller";
import { getGroupsMin } from "@/controllers/group.controller";

// Websocket and WhatsApp Client
import { initializeSocketServer } from "@/socket";

// initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Register Auth Routes
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/message", messageRoutes);
app.use("/api/v2/group", groupRoutes);

// Backward Compatibility Routes
app.post("/connect", loginController);
app.delete("/logout", logoutController);
app.post("/send-message", sendMessageController);
app.get("/groups", getGroupsMin);

// Create the HTTP server
const server = http.createServer(app);

// Initialize WebSockets
initializeSocketServer(server);

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
