import { EventEmitter } from "events";
import { parseIncomingMessage, parseDeletedMessage, parseReactionMessage } from "@/utils/messageParser";
import { proto, WAMessageUpdate } from "@whiskeysockets/baileys";
import { EnableMessageEvents } from "@/types";
import { BAILEYS_MESSAGE_EVENTS } from "@/constants/whatsappEvents";
import { isWaEventsDebugEnabled } from "@/utils/debug";

export const messageListener = new EventEmitter();

type MessageUpsertPayload = { type: string; messages: proto.IWebMessageInfo[] };
type MessageUpdatePayload = WAMessageUpdate[];
type MessageDeletePayload = { keys: proto.IMessageKey[] } | { jid: string; all: boolean };
type MessageReactionPayload = Array<{ key: proto.IMessageKey; reaction: proto.IReaction }>;

const EVENT_RAW_MESSAGE = "raw_message";
const [
    EVENT_MESSAGES_UPSERT,
    EVENT_MESSAGES_DELETE,
    EVENT_MESSAGES_UPDATE,
    EVENT_MESSAGES_REACTION,
] = BAILEYS_MESSAGE_EVENTS;

let isInitialized = false;
let initializedForSock: unknown | null = null;
let currentOptions: Required<EnableMessageEvents> = {
    recieve: true,
    delete: true,
    update: true,
    reaction: true,
};

function toRequiredOptions(options: EnableMessageEvents): Required<EnableMessageEvents> {
    return {
        recieve: options.recieve ?? true,
        delete: options.delete ?? true,
        update: options.update ?? true,
        reaction: options.reaction ?? true,
    };
}

async function handleMessagesUpsert(payload: MessageUpsertPayload, sock: any) {
    try {
        if (isWaEventsDebugEnabled()) {
            console.log(`[wa-events] messages.upsert type=${payload.type} count=${payload.messages.length}`);
        }
        if (payload.type !== "notify") return;
        if (!currentOptions.recieve) return;

        for (const message of payload.messages) {
            try {
                if (isWaEventsDebugEnabled()) {
                    messageListener.emit(EVENT_RAW_MESSAGE, {
                        event: EVENT_MESSAGES_UPSERT,
                        key: message.key,
                        messageTimestamp: message.messageTimestamp,
                    });
                }
                const incomingMessage = await parseIncomingMessage(message, sock);
                if (incomingMessage) {
                    messageListener.emit("message", incomingMessage);
                }
            } catch (error) {
                console.error("Failed to parse incoming message:", error);
            }
        }
    } catch (error) {
        console.error("messages.upsert handler failed:", error);
    }
}

async function handleMessagesDelete(item: MessageDeletePayload) {
    try {
        if ("keys" in item) {
            for (const key of item.keys) {
                const deletedMessage = await parseDeletedMessage(key);
                if (deletedMessage && currentOptions.delete) {
                    messageListener.emit("delete", deletedMessage);
                }
                messageListener.emit("messageDelete", deletedMessage);
            }
            return;
        }

        if ("all" in item && item.all) {
            console.log(`Entire chat was cleared for JID: ${item.jid}`);
            messageListener.emit("chatClear", { chatJid: item.jid, all: true });
        }
    } catch (error) {
        console.error("messages.delete handler failed:", error);
    }
}

async function handleMessagesUpdate(updates: MessageUpdatePayload, sock: any) {
    try {
        if (!currentOptions.update) return;

        for (const update of updates) {
            if (!update.update.message) continue;

            const mockWebMessage: proto.IWebMessageInfo = {
                key: update.key,
                message: update.update.message,
                messageTimestamp: Date.now(),
            };

            try {
                const updatedMessage = await parseIncomingMessage(mockWebMessage, sock);
                if (updatedMessage) {
                    messageListener.emit("messageUpdate", updatedMessage);
                }
            } catch (error) {
                console.error("Failed to parse updated message:", error);
            }
        }
    } catch (error) {
        console.error("messages.update handler failed:", error);
    }
}

async function handleMessagesReaction(reactions: MessageReactionPayload, sock: any) {
    try {
        if (!currentOptions.reaction) return;

        for (const reactionObj of reactions) {
            try {
                const parsedReaction = await parseReactionMessage(reactionObj, sock);
                if (parsedReaction) {
                    messageListener.emit("reaction", parsedReaction);
                }
            } catch (error) {
                console.error("Failed to parse reaction message:", error);
            }
        }
    } catch (error) {
        console.error("messages.reaction handler failed:", error);
    }
}

export function intializeMessageListener(
    sock: any,
    {
    recieve: recieveEvent = true,
    delete: deleteEvent = true,
    update: updateEvent = true,
    reaction: reactionEvent = true
}: EnableMessageEvents = {},
) {
    if (!sock) {
        console.warn("Cannot initialize message listener: not connected to WhatsApp");
        return;
    }

    if (isWaEventsDebugEnabled()) {
        console.log("[wa-events] message listener init");
    }

    currentOptions = toRequiredOptions({
        recieve: recieveEvent,
        delete: deleteEvent,
        update: updateEvent,
        reaction: reactionEvent,
    });

    if (isInitialized && initializedForSock === sock) {
        return;
    }

    if (isInitialized && initializedForSock && initializedForSock !== sock) {
        const previousSock = initializedForSock as any;
        previousSock?.ev?.off?.(EVENT_MESSAGES_UPSERT, previousSock.__baileysApiMessagesUpsertHandler);
        previousSock?.ev?.off?.(EVENT_MESSAGES_DELETE, previousSock.__baileysApiMessagesDeleteHandler);
        previousSock?.ev?.off?.(EVENT_MESSAGES_UPDATE, previousSock.__baileysApiMessagesUpdateHandler);
        previousSock?.ev?.off?.(EVENT_MESSAGES_REACTION, previousSock.__baileysApiMessagesReactionHandler);
    }

    const messagesUpsertHandler = (payload: MessageUpsertPayload) => void handleMessagesUpsert(payload, sock);
    const messagesDeleteHandler = (payload: MessageDeletePayload) => void handleMessagesDelete(payload);
    const messagesUpdateHandler = (payload: MessageUpdatePayload) => void handleMessagesUpdate(payload, sock);
    const messagesReactionHandler = (payload: MessageReactionPayload) => void handleMessagesReaction(payload, sock);

    (sock as any).__baileysApiMessagesUpsertHandler = messagesUpsertHandler;
    (sock as any).__baileysApiMessagesDeleteHandler = messagesDeleteHandler;
    (sock as any).__baileysApiMessagesUpdateHandler = messagesUpdateHandler;
    (sock as any).__baileysApiMessagesReactionHandler = messagesReactionHandler;

    sock.ev.on(EVENT_MESSAGES_UPSERT, messagesUpsertHandler);
    sock.ev.on(EVENT_MESSAGES_DELETE, messagesDeleteHandler);
    sock.ev.on(EVENT_MESSAGES_UPDATE, messagesUpdateHandler);
    sock.ev.on(EVENT_MESSAGES_REACTION, messagesReactionHandler);

    isInitialized = true;
    initializedForSock = sock;
}
