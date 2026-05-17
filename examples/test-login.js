const { io } = require("socket.io-client");
const qrcode = require("qrcode-terminal");

const SERVER_URL = "http://localhost:3000";
const PHONE_NUMBER = "1234567890"; // Change this to your test WhatsApp number (with country code, no +)

async function testLoginFlow() {
    console.log(`Connecting to WebSocket server at ${SERVER_URL}...`);
    
    // 1. Connect to WebSockets
    const socket = io(SERVER_URL);

    socket.on("connect", () => {
        console.log("✅ WebSocket Connected! ID:", socket.id);
        
        // 2. Trigger the login route right after we connect
        triggerLogin();
    });

    // 3. Listen for WebSocket updates
    socket.on("status", async (data) => {
        console.log("📌 Status Update:", data);
        if (data.state === "connected") {
            console.log("🎉 WhatsApp is successfully connected! You can now send messages.");
            
            // Send a test message immediately after connecting
            await sendTestMessage(`${PHONE_NUMBER}@s.whatsapp.net`, "Hello from the Baileys API!");
            
            process.exit(0);
        }
    });

    socket.on("qr_code", (qr) => {
        console.log("\n🔗 Received QR Code from WebSocket! Please scan:");
        qrcode.generate(qr, { small: true });
    });

    socket.on("disconnect", () => {
        console.log("❌ WebSocket Disconnected.");
    });
}

async function sendTestMessage(jid, text) {
    try {
        console.log(`\n🚀 Sending test message to ${jid} ...`);
        const response = await fetch(`${SERVER_URL}/send-message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jid: jid,
                message: { text: text }
            })
        });
        
        const data = await response.json();
        console.log(`📥 Send Message API Response [${response.status}]:`, data);
    } catch (error) {
        console.error("❌ Failed to send message:", error);
    }
}

async function triggerLogin() {
    try {
        console.log("\n🚀 Triggering POST /api/v2/auth/login ...");
        const response = await fetch(`${SERVER_URL}/api/v2/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();
        console.log(`📥 API Response [${response.status}]:`, data);
    } catch (error) {
        console.error("❌ Failed to hit login endpoint:", error);
    }
}

testLoginFlow();