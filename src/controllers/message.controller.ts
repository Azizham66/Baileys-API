import { sendMessageService } from "@/services/message.service";
import { isConnected } from "@/whatsappClient";
import { Request, Response } from "express";
import { sendSuccess, sendError } from "@/utils/response";

export async function sendMessageController(req: Request, res: Response) {
    const { jid, message } = req.body;
    
    if (!jid || (Array.isArray(jid) && jid.length === 0) || !message) {
        return sendError(res, "Missing or invalid required fields: jid and/or message", undefined, 400);
    }

    if (!isConnected()) {
        return sendError(res, "Not connected to WhatsApp, make sure to call the endpoint /connect to be able to send a message", undefined, 401);
    }


    try {
        const result = await sendMessageService(jid, message);
        if (result) {
            console.log("📤 Message sent");
            return sendSuccess(res, "Message sent Successfully", result);
        } else {
            console.error("❌ sendMessage failed with unknown error");
            return sendError(res, "Failed to send message", "Unknown error", 500);
        }
    } catch (error) {
        console.error("❌ sendMessage failed with error", error);
        if (error instanceof Error) {
            return sendError(res, "Failed to send message", error.message, 500);
        }
        return sendError(res, "Failed to send message", "Unknown error", 500);
    }
}