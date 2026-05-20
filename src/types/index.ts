export interface IIncomingMessage {
    messageIds: string;
    chatJid: string;
    senderJid: string;
    senderNumber: string | null;
    senderName: string | null | undefined;
    isGroup: boolean;
    groupName?: string | null;
    isFromMe: boolean | null | undefined;
    timestamp: number | Long;
    text: string | null;
    isImage: boolean;
    isVideo: boolean;
    isAudio: boolean;
    isDocument: boolean;
    isSticker: boolean;
    isLocation: boolean;
    isURL: boolean;
    extractedUrl: string | null;
    mediaBase64: string | null;
    mimetype: string | null;
}

export interface IdeletedMessage {
    chatJid: string;
    senderJid: string;
    senderNumber: string | null;
    isGroup: boolean;
    isFromMe: boolean | null | undefined;
    messageId: string | null | undefined;
    groupName?: string | null;
}

export interface IReactionMessage {
    originalMessageId: string;
    chatJid: string;
    reactorJid: string | null | undefined;
    reactorNumber: string | null;
    emoji: string | null | undefined;
    action: string;
    isGroup: boolean;
    timestamp: number | Long;
}

export interface EnableMessageEvents {
    recieve?: boolean;
    delete?: boolean;
    update?: boolean;
    reaction?: boolean;
}
