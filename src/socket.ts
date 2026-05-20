import { Server } from "socket.io";
import { waEmitter, isConnected, getQR } from "@/whatsappClient";
import { messageListener } from "@/listeners/messageListener";
import { Server as HttpServer } from "http";
import { isWaEventsDebugEnabled } from "@/utils/debug";

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

    // Forward WhatsApp message events to Socket.io clients
    messageListener.on("message", (msg) => {
        isWaEventsDebugEnabled() && console.log("[wa-events] emit message");
        io.emit("message", msg);
    });

    messageListener.on("reaction", (rxn) => {
        isWaEventsDebugEnabled() && console.log("[wa-events] emit reaction");
        io.emit("reaction", rxn);
    });

    messageListener.on("delete", (del) => {
        isWaEventsDebugEnabled() && console.log("[wa-events] emit delete");
        io.emit("delete", del);
    });

    messageListener.on("messageUpdate", (upd) => {
        isWaEventsDebugEnabled() && console.log("[wa-events] emit messageUpdate");
        io.emit("messageUpdate", upd);
    });

    return io;
}
