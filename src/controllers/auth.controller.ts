import { connectToWA, isConnected, logout } from "@/whatsappClient";
import { Request, Response } from "express";
import { sendSuccess, sendError } from "@/utils/response";

export async function loginController(req: Request, res: Response) {
    if (isConnected()) {
        return sendError(res, "Already connected to WhatsApp.", undefined, 400);
    }

    try {
        connectToWA().catch(err => {
            console.error("Connection failed:", err);
        })

        return sendSuccess(res, "Connection initiated. Please scan the QR code.");
    }
    catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
            return sendError(res, "Failed to connect to WhatsApp.", error.message, 500);
        }
        return sendError(res, "Unknown error occurred while connecting to WhatsApp.", undefined, 500);
    }
}

export async function logoutController(req: Request, res: Response) {
    if (!isConnected()) {
        return sendError(res, "Not connected to WhatsApp.", undefined, 400);
    }
    try {
        if (req.query.deleteSession && req.query.deleteSession === "false") {
            await logout(false);
            return sendSuccess(res, "Logged out from WhatsApp successfully. Session cache retained.");
        }
        await logout(true);
        return sendSuccess(res, "Logged out from WhatsApp successfully.");
    } catch (error) {
        console.error("Logout error:", error);
        return sendError(res, "Failed to log out from WhatsApp.", undefined, 500);
    }
}
