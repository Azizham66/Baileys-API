import express from "express";
import http, { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

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

  app.use(express.json());

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

