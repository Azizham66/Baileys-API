import express from "express";
import http, { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import rateLimit from "express-rate-limit";

import authRoutes from "@/routes/auth.routes";
import messageRoutes from "@/routes/message.routes";
import groupRoutes from "@/routes/group.routes";
import { loginController, logoutController } from "@/controllers/auth.controller";
import { sendMessageController } from "@/controllers/message.controller";
import { getGroupsMin } from "@/controllers/group.controller";
import { initializeSocketServer } from "@/socket";

const DEFAULT_PORT = 3000;

type StartedServer = {
  httpServer: HttpServer;
  io: SocketIOServer;
  port: number;
};

function createExpressApp() {
  const app = express();

  // Apply rate limiting to all requests
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: "Too many requests from this IP, please try again after a minute"
      });
    }
  });

  app.use(limiter);
  app.use(express.json({ limit: '10mb' }));

  app.use("/api/v2/auth", authRoutes);
  app.use("/api/v2/message", messageRoutes);
  app.use("/api/v2/group", groupRoutes);

  app.post("/connect", loginController);
  app.delete("/logout", logoutController);
  app.post("/send-message", sendMessageController);
  app.get("/groups", getGroupsMin);

  return app;
}

function parsePort(value: string | undefined): number {
  if (!value) return DEFAULT_PORT;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PORT;

  return parsed;
}

export function startServer(portOverride?: number): Promise<StartedServer> {
  const port = portOverride ?? parsePort(process.env.PORT);
  const app = createExpressApp();
  const httpServer = http.createServer(app);
  const io = initializeSocketServer(httpServer);

  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
      resolve({ httpServer, io, port });
    });
  });
}

export function stopServer(startedServer: StartedServer): Promise<void> {
  const { httpServer, io } = startedServer;

  return new Promise((resolve, reject) => {
    io.close();
    httpServer.close((error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

