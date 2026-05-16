const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

let sock;
let connectPromise = null;
let _isConnected = false;
let currentQR = null;

function isConnected() {
  return !!sock && _isConnected;
}

function getQR() {
    return currentQR;
}

function getSock() {
  return sock;
}

function connectToWA() {
  // If already connected and ready, return immediately
  if (isConnected()) return Promise.resolve();

  // If a connection is currently in progress, return the existing promise
  if (connectPromise) return connectPromise;

  connectPromise = new Promise(async (resolve, reject) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState("auth_info");

      sock = makeWASocket({
        auth: state,
        makeOnlineOnConnect: false,
        printQRInTerminal: true,
        connectTimeoutMs: 60_000,
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          currentQR = qr;
          qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
          console.log("✅ WhatsApp connection opened");
          !!currentQR && (currentQR = null); // Clear QR code once connected if it exists
          _isConnected = true;
          resolve();
        }

        if (connection === "close") {
          _isConnected = false;
          connectPromise = null; // Clear the pending connection promise
          !!currentQR && (currentQR = null); // Clear QR code on disconnect if it exists
          const disconnectError = new Boom(lastDisconnect?.error, {
            statusCode: lastDisconnect?.error?.output?.statusCode,
          });

          // Clean up the socket
          if (sock) {
            sock.ev.removeAllListeners();
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

function reconnectToWA(disconnect) {
  if (isConnected()) {
    console.log("Already connected to WhatsApp.");
    return;
  }

  if (disconnect) {
    console.log("Previous connection closed. Reason:", disconnect.message);
    const shouldReconnect =
      disconnect?.output?.statusCode !== DisconnectReason.loggedOut;

    if (shouldReconnect) {
      console.log("Attempting to reconnect...");
      // Wrap the promise to catch silent errors inside reconnection
      connectToWA().catch((err) =>
        console.error("Reconnection completely failed:", err.message)
      );
    } else {
      console.log("Logged out. Not reconnecting.");
    }
  }
}

async function logout() {
    if (!getSock()) {
        console.log("No active connection to log out from.");
        return;
    }
    try {
        await getSock().logout();
        console.log("✅ Logged out successfully.");
        // Optional: Delete session folder to clear any residual data
        if (fs.existsSync('auth_info')) {
            fs.rmSync('auth_info', { recursive: true, force: true });
            console.log("🗑️ Session files deleted.");
        }

        sock = null; // Clear socket reference
        !!currentQR && (currentQR = null); // Clear QR code

    } catch (error) {
        console.error("❌ Logout failed:", error);
    }
}

module.exports = {
  connectToWA,
  isConnected,
  getSock,
  getQR,
  logout,
};
