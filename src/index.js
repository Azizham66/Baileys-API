
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const express = require("express");


const app = express();
const PORT = 3000;

app.use(express.json());



let sock;              // your single socket
let readyPromise;      // a promise that resolves when connection is open

async function connectToWA() {
    if (sock) return;    // already connecting/connected

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    sock = makeWASocket({
        auth: state,
        makeOnlineOnConnect: false,
        printQRInTerminal: true,      // show QR if needed
        connectTimeoutMs: 60_000,
    });

    // Save credentials whenever they update
    sock.ev.on("creds.update", saveCreds);

    readyPromise = new Promise(resolve => {
        sock.ev.on("connection.update", update => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrcode.generate(qr, { small: true });
            }

            if (connection === "open") {
                console.log("✅ WhatsApp connection opened");
                resolve();
            }

            if (connection === "close") {
                const code = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = code !== DisconnectReason.loggedOut;
                console.log("❌ disconnected code=", code, " will reconnect?", shouldReconnect);
                sock = null;
                if (shouldReconnect) connectToWA();
            }
        });
    });
}


async function sendMessage(jid, message) {
    // Ensure we're connected
    await connectToWA();
    await readyPromise;                  // wait until connection === 'open'

    // Now send safely
    return sock.sendMessage(jid, message);
}


async function logout() {

    try {
        await sock.logout();
        console.log("✅ Logged out successfully.");

        // Optional: Delete session folder to clear any residual data
        if (fs.existsSync('auth_info')) {
            fs.rmSync('auth_info', { recursive: true, force: true });
            console.log("🗑️ Session files deleted.");
        }

        sock = null; // Clear socket reference
    } catch (error) {
        console.error("❌ Logout failed:", error);
    }
}

app.post('/send-message', async (req, res) => {
    const { jid, message } = req.body;

    if (!sock) {
        res.status(400).json("Not connected to WhatsApp, make sure to call the endpoint /connect to be able to send a message");
        return;
    }

    await sendMessage(jid, message)
        .then(() => console.log("📤 Message sent"))
        .catch(err => console.error("❌ sendMessage error", err));

    res.status(200).json({ Content: "Message sent Successfully" });
});

app.delete('/logout', async (req, res) => {
    try {
        await connectToWA();
        await readyPromise;
        await logout();
        res.status(200).json({ message: 'Successfully logged out of WhatsApp' });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

app.post('/connect', async (req, res) => {
    try {
        if (!sock) {
            res.status(200).json({message: 'Scan the Qr code in the server terminal to connect'});
            connectToWA().catch(err => console.log(err));
        }
        if (sock) {
            res.status(200).json({message: 'Already connected'});
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: 'Failed to connect' });
    }
})

// Add this function to list groups
async function listGroups() {
    if (!sock) throw new Error('Not connected');

    // Fetch all groups you participate in
    const groups = await sock.groupFetchAllParticipating();

    // groups is an object with keys = group IDs and values = metadata
    return Object.entries(groups).map(([id, metadata]) => ({
        id,
        name: metadata.subject || 'Unnamed Group'
    }));
}



// Add this endpoint to get groups
app.get('/groups', async (req, res) => {
    try {
        if (!sock) await connectToWA();
        await readyPromise;

        const groups = await listGroups();
        res.json(groups);
    } catch (err) {
        console.error("❌ Failed to list groups", err);
        res.status(500).json({ error: 'Failed to list groups' });
    }
});




app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})
