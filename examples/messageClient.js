import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";

console.log(`Connecting to WebSocket server at ${SERVER_URL}...`);
const socket = io(SERVER_URL);

socket.on("connect", () => {
    console.log("✅ WebSocket Connected! ID:", socket.id);
});

socket.on("status", (data) => {
    console.log("📌 Status Update:", data);
});

// Listen new message
socket.on("message", (msg) => {
    const source = msg.isGroup ? `Group (${msg.groupName})` : "Private";
    const senderPrimary = msg.senderNumber || msg.senderName || msg.senderJid;
    const senderLabel =
        senderPrimary && senderPrimary !== msg.senderJid
            ? `${senderPrimary} (${msg.senderJid})`
            : msg.senderJid;

    console.log(`[+] New Msg | ${source} | ${senderLabel}: ${msg.text}`);
});

// Listen reaction
socket.on("reaction", (rxn) => {
    const sender = rxn.reactorNumber || rxn.reactorJid;
    console.log(`[*] Reaction | ${sender} | ${rxn.action}: ${rxn.emoji}`);
});

// Listen delete
socket.on("delete", (del) => {
    const sender = del.senderNumber || del.senderJid;
    console.log(`[-] Delete | ${sender} | Msg ID: ${del.messageId}`);
});

// Listen update
socket.on("messageUpdate", (upd) => {
    console.log(`[~] Update | Msg ID: ${upd.messageIds} | Text: ${upd.text}`);
});

socket.on("disconnect", () => {
    console.log("❌ WebSocket Disconnected.");
});
