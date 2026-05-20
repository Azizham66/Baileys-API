import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import fs from "fs";
import { EventEmitter } from "events";
import { intializeMessageListener } from "@/listeners/messageListener";
import {
  APP_EVENT_CONNECTED,
  APP_EVENT_DISCONNECTED,
  APP_EVENT_QR_CODE,
  BAILEYS_EVENT_CONNECTION_UPDATE,
  BAILEYS_EVENT_CREDS_UPDATE,
  BAILEYS_MESSAGE_EVENTS,
} from "@/constants/whatsappEvents";

export const waEmitter = new EventEmitter();


let sock : WASocket | null = null;
let connectPromise : Promise<void> | null = null;
let _isConnected = false;
let currentQR : string | null = null;

function isConnected(): boolean {
  return !!sock && _isConnected;
}

function getQR(): string | null {
  return currentQR;
}

function getSock(): WASocket | null {
  return sock;
}

function connectToWA(): Promise<void> {
  // If already connected and ready, return immediately
  if (isConnected()) return Promise.resolve();

  // If a connection is currently in progress, return the existing promise
  if (connectPromise) return connectPromise;

  connectPromise = new Promise<void>(async (resolve, reject) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState("auth_info");
      const { version } = await fetchLatestBaileysVersion();

      sock = makeWASocket({
        version,
        auth: state,
        markOnlineOnConnect: false,
        connectTimeoutMs: 60_000,
      });

      // Initialize the message listener immediately so events aren't missed
      intializeMessageListener(sock);

      sock.ev.on(BAILEYS_EVENT_CREDS_UPDATE, saveCreds);

      sock.ev.on(BAILEYS_EVENT_CONNECTION_UPDATE, (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          currentQR = qr;
          qrcode.generate(qr, { small: true });
          waEmitter.emit(APP_EVENT_QR_CODE, qr);
        }

        if (connection === "open") {
          console.log("✅ WhatsApp connection opened");
          !!currentQR && (currentQR = null); // Clear QR code once connected if it exists
          _isConnected = true;
          waEmitter.emit(APP_EVENT_CONNECTED);
          resolve();
        }

        if (connection === "close") {
          _isConnected = false;
          connectPromise = null; // Clear the pending connection promise
          !!currentQR && (currentQR = null); // Clear QR code on disconnect if it exists
          const disconnectError = new Boom(lastDisconnect?.error, {
            statusCode: (lastDisconnect?.error as Boom | undefined)?.output?.statusCode,
          });
          waEmitter.emit(APP_EVENT_DISCONNECTED, lastDisconnect);

          // Clean up the socket
          if (sock) {
            sock.ev.removeAllListeners(BAILEYS_EVENT_CONNECTION_UPDATE);
            sock.ev.removeAllListeners(BAILEYS_EVENT_CREDS_UPDATE);
            for (const eventName of BAILEYS_MESSAGE_EVENTS) {
              sock.ev.removeAllListeners(eventName);
            }
          }
          sock = null;

          // Reject if it failed before ever opening (Promises ignore multiple settle calls)
          reject(disconnectError);

          // Handle reconnection
          reconnectToWA(disconnectError);
        }
      });
    } catch (err) {
      connectPromise = null;
      reject(err);
    }
  });

  return connectPromise;
}

function reconnectToWA(disconnect: Boom) {
  if (isConnected()) {
    console.log("Already connected to WhatsApp.");
    return;
  }

  if (disconnect) {
    console.log("Previous connection closed. Reason:", disconnect.message);
    waEmitter.emit("disconnectReason", disconnect.message);
    const shouldReconnect =
      disconnect?.output?.statusCode !== DisconnectReason.loggedOut;

    if (shouldReconnect) {
      console.log("Attempting to reconnect...");
      // Wrap the promise to catch silent errors inside reconnection
      connectToWA().catch((err) =>
        console.error("Reconnection completely failed:", err.message),
      );
    } else {
      console.log("Logged out. Not reconnecting.");
    }
  }
}

async function logout(deleteSessionCache = true): Promise<void> {
  const currentSock = getSock();
  if (!currentSock) {
    console.log("No active connection to log out from.");
    return;
  }
  try {
    await currentSock.logout();
    console.log("✅ Logged out successfully.");
    // Optional: Delete session folder to clear any residual data
    if (deleteSessionCache && fs.existsSync("auth_info")) {
      fs.rmSync("auth_info", { recursive: true, force: true });
      console.log("🗑️ Session files deleted.");
    }

    sock = null; // Clear socket reference
    !!currentQR && (currentQR = null);
     // Clear QR code
  } catch (error) {
    console.error("❌ Logout failed:", error);
  }
}

export {
  connectToWA,
  isConnected,
  getSock,
  getQR,
  logout,
};
