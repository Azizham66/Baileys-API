export const BAILEYS_EVENT_CONNECTION_UPDATE = "connection.update";
export const BAILEYS_EVENT_CREDS_UPDATE = "creds.update";

export const BAILEYS_MESSAGE_EVENTS = [
  "messages.upsert",
  "messages.delete",
  "messages.update",
  "messages.reaction",
] as const;

export const APP_EVENT_QR_CODE = "qr_code";
export const APP_EVENT_CONNECTED = "connected";
export const APP_EVENT_DISCONNECTED = "disconnected";

