import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  proto,
} from "@whiskeysockets/baileys";
import { getSock } from "@/whatsappClient";


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessageService(
  jid: string | string[],
  message: AnyMessageContent,
  options?: MiscMessageGenerationOptions,
): Promise<proto.WebMessageInfo | undefined | (proto.WebMessageInfo | undefined)[]> {
    const sock = getSock();

    if (!sock) {
        throw new Error("Not connected to WhatsApp");
    }

    if (Array.isArray(jid)) {
        const results: (proto.WebMessageInfo | undefined)[] = [];
        for (let i = 0; i < jid.length; i++) {
            const targetJID = jid[i];
            const result = await sock.sendMessage(targetJID, message, options);
            results.push(result);

            // Add a small delay between messages to avoid flooding
            if (i < jid.length - 1) {
                await delay(3000); // Adjust the delay as needed
            }
        }
        return results;
    }


    const result = await sock.sendMessage(jid, message, options);
    return result;
}
