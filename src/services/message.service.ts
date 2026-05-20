import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  proto,
} from "@whiskeysockets/baileys";
import { getSock } from "@/whatsappClient";

import PQueue from "p-queue";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Setup p-queue with concurrency of 1 to ensure messages are sent sequentially
const globalMessageQueue = new PQueue({ concurrency: 1 });

export async function sendMessageService(
  jid: string | string[],
  message: AnyMessageContent,
  options?: MiscMessageGenerationOptions,
): Promise<proto.WebMessageInfo | undefined | (proto.WebMessageInfo | undefined)[]> {
    const sock = getSock();

    if (!sock) {
        throw new Error("Not connected to WhatsApp");
    }

    // Prevent queue from growing too large, which would cause HTTP timeouts
    if (globalMessageQueue.size >= 30) {
        throw new Error("Server is currently busy processing too many messages. Please try again later.");
    }

    if (Array.isArray(jid)) {
        const results: (proto.WebMessageInfo | undefined)[] = [];
        for (let i = 0; i < jid.length; i++) {
            const targetJID = jid[i];
            // Push each message into the p-queue
            const result = await globalMessageQueue.add(async () => {
                const res = await sock.sendMessage(targetJID, message, options);
                await delay(2000); // Enforce a global delay after EVERY message sent to prevent spam bans
                return res;
            });
            results.push(result);
        }
        return results;
    }

    // Single message goes into the p-queue
    const result = await globalMessageQueue.add(async () => {
        const res = await sock.sendMessage(jid, message, options);
        await delay(2000);
        return res;
    });
    return result;
}
