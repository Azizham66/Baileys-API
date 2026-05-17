import { Server } from "socket.io";
import { waEmitter, isConnected, getQR } from "@/whatsappClient";
import { Server as HttpServer } from "http";

export function initializeSocketServer(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", socket => {
        console.log("New client connected:", socket.id);

        if (isConnected()) {
            socket.emit("status", { state: "connected" });
        } else {
            const currentQR = getQR();
            if (currentQR) {
                socket.emit("qr_code", currentQR);
            } else {
                socket.emit("status", { state: "disconnected" });
            }
        }

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    })

    waEmitter.on("qr_code", (qr: string) => {
        io.emit("qr_code", qr);
    });

    waEmitter.on("connected", () => {
        io.emit("status", { state: "connected" });
    });

    waEmitter.on("disconnected", (info) => {
        io.emit("status", { state: "disconnected", info });
    });

    return io;
}