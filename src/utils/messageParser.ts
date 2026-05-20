import { proto, WAMessage, downloadMediaMessage } from "@whiskeysockets/baileys";
import { getNumberFromJID } from "@/utils/getNumber";
import { IdeletedMessage, IIncomingMessage, IReactionMessage } from "@/types";

const GROUP_METADATA_TIMEOUT_MS = 3_000;

type GroupMetadataCacheEntry = {
  subject: string | null;
  expiresAtMs: number;
};

const groupMetadataCache = new Map<string, GroupMetadataCacheEntry>();

function nowMs(): number {
  return Date.now();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | null = null;
  try {
    return await new Promise<T>((resolve, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error("Timed out")), timeoutMs);
      void promise.then(resolve, reject);
    });
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

async function getCachedGroupSubject(chatJid: string, sock: any): Promise<string | null> {
  const cached = groupMetadataCache.get(chatJid);
  if (cached && cached.expiresAtMs > nowMs()) return cached.subject;

  if (!sock?.groupMetadata) return null;

  try {
    const metadata = await withTimeout<{ subject?: string | null }>(
      sock.groupMetadata(chatJid),
      GROUP_METADATA_TIMEOUT_MS,
    );
    const subject = metadata?.subject ?? null;
    groupMetadataCache.set(chatJid, { subject, expiresAtMs: nowMs() + 5 * 60_000 });
    return subject;
  } catch {
    groupMetadataCache.set(chatJid, { subject: null, expiresAtMs: nowMs() + 30_000 });
    return null;
  }
}

export async function parseIncomingMessage(
  message: proto.IWebMessageInfo,
  sock: any,
): Promise<IIncomingMessage | null> {
  const messageKey = message.key;
  if (!messageKey?.remoteJid || !messageKey.id) return null;

  const chatJid = messageKey.remoteJid;
  const isGroup = chatJid.endsWith("@g.us");

  // If it's a group, the sender is the 'participant' property
  // If it's a private chat, the sender is the 'remoteJid' property
  const senderJid = (isGroup ? messageKey.participant : chatJid) as string;

  // Edge case: Sometimes system messages in groups lack a participant
  if (!senderJid) return null;

  let senderNumber: string | null = null;
  try {
    senderNumber = getNumberFromJID(senderJid);
  } catch {
    senderNumber = null;
  }
  const senderName = message.pushName;

  let groupName = null;
  if (isGroup && sock) {
    groupName = await getCachedGroupSubject(chatJid, sock);
  }

  const msgContent = message.message;

  // Parse text regardless of whether it's a standard message, reply, or media caption
  const text =
    msgContent?.conversation ||
    msgContent?.extendedTextMessage?.text ||
    msgContent?.imageMessage?.caption ||
    msgContent?.videoMessage?.caption ||
    null;

  // Media & Type Boolean Flags
  const isImage = !!msgContent?.imageMessage;
  const isVideo = !!msgContent?.videoMessage;
  const isAudio = !!msgContent?.audioMessage;
  const isDocument = !!msgContent?.documentMessage;
  const isSticker = !!msgContent?.stickerMessage;
  const isLocation =
    !!msgContent?.locationMessage || !!msgContent?.liveLocationMessage;

  // URL extraction using regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const isURL = !!(text && urlRegex.test(text));

  // Determine the most relevant extraction URL
  let extractedUrl: string | null = null;

  if (isURL && text) {
    extractedUrl = text.match(urlRegex)?.[0] ?? null;
  } else if (isLocation) {
    const loc = msgContent?.locationMessage || msgContent?.liveLocationMessage;
    if (loc?.degreesLatitude && loc?.degreesLongitude) {
      extractedUrl = `https://maps.google.com/?q=${loc.degreesLatitude},${loc.degreesLongitude}`;
    }
  }

  // Get mimetype if present
  const mimetype =
    msgContent?.imageMessage?.mimetype ||
    msgContent?.videoMessage?.mimetype ||
    msgContent?.audioMessage?.mimetype ||
    msgContent?.documentMessage?.mimetype ||
    msgContent?.stickerMessage?.mimetype ||
    null;

  // Download media automatically if it's a media message
  let mediaBase64: string | null = null;
  const hasMedia = isImage || isVideo || isAudio || isDocument || isSticker;

  if (hasMedia && sock) {
    try {
      // Download the physical file buffer from WhatsApp servers
      const buffer = await downloadMediaMessage(
        message as unknown as WAMessage,
        "buffer",
        {},
        {
          logger: console as any,
          reuploadRequest: sock.updateMediaMessage,
        },
      );

      if (buffer) {
        mediaBase64 = buffer.toString("base64");
      }
    } catch (err) {
      console.error(
        `Failed to download media for message ${messageKey.id}:`,
        err,
      );
    }
  }

  return {
    messageIds: messageKey.id,
    chatJid,
    senderJid,
    senderNumber,
    senderName,
    isGroup,
    groupName,
    isFromMe: messageKey.fromMe,
    timestamp: message.messageTimestamp || Date.now(),
    text,
    isImage,
    isVideo,
    isAudio,
    isDocument,
    isSticker,
    isLocation,
    isURL,
    extractedUrl,
    mediaBase64,
    mimetype,
  };
}

export async function parseDeletedMessage(
  message: proto.IMessageKey,
): Promise<IdeletedMessage | null> {
  if (!message.remoteJid || !message.id) return null;

  const chatJid = message.remoteJid;
  const isGroup = chatJid.endsWith("@g.us");
  const senderJid = (isGroup ? message.participant : chatJid) as string;

  if (!senderJid) return null;

  const senderNumber = getNumberFromJID(senderJid);

  return {
    chatJid,
    senderJid,
    senderNumber,
    isGroup,
    isFromMe: message.fromMe,
    messageId: message.id,
  };
}

export async function parseReactionMessage(
  reactionObj: {key: proto.IMessageKey; reaction: proto.IReaction},
  sock: any
): Promise<IReactionMessage | null> {
  const { key, reaction } = reactionObj;

  if (!reaction || !key.remoteJid || !key.id) return null;

  const chatJid = key.remoteJid;
  const isGroup = chatJid.endsWith("@g.us");

  let reactorJid: string | null | undefined = null;
  if (reaction.key) {
    if (reaction.key.fromMe) {
      reactorJid = sock.user?.id || null;
    } else if (reaction.key.participant) {
      reactorJid = reaction.key.participant;
    } else {
      reactorJid = reaction.key.remoteJid;
    }
  }

  // Ensure jid formatting is correct (strip device info)
  if (reactorJid && reactorJid.includes(':')) {
    reactorJid = reactorJid.split(':')[0] + '@s.whatsapp.net';
  }

  if (!reactorJid) return null;

  const reactorNumber = getNumberFromJID(reactorJid);

  return {
    originalMessageId: key.id,
    chatJid,
    reactorJid,
    reactorNumber,
    emoji: reaction.text || "",
    action: reaction.text ? "add" : "remove",
    isGroup,
    timestamp: reaction.senderTimestampMs || Date.now(),
  };
}
