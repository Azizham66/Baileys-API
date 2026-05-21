<p align="center">
  <img src="assets/projectlogo.png" alt="What's Up Logo" width="180" />
</p>

<h1 align="center">What's Up</h1>

<p align="center">
  <a href="https://github.com/Azizham66/WhatsUP">
    <img src="https://img.shields.io/github/stars/Azizham66/WhatsUP?style=for-the-badge" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Azizham66/WhatsUP/issues">
    <img src="https://img.shields.io/github/issues/Azizham66/WhatsUP?style=for-the-badge" alt="GitHub Issues" />
  </a>
  <a href="https://github.com/Azizham66/WhatsUP/commits/main">
    <img src="https://img.shields.io/github/last-commit/Azizham66/WhatsUP?style=for-the-badge" alt="Last Commit" />
  </a>
  <a href="https://github.com/Azizham66/WhatsUP/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Azizham66/WhatsUP?style=for-the-badge" alt="License" />
  </a>
</p>

A robust, TypeScript-based, modular REST and WebSocket API for interacting with WhatsApp using the [Baileys](https://github.com/WhiskeySockets/Baileys) library.

***

## **Important Notice:** 
This project uses `@whiskeysockets/baileys`, an unofficial third-party library. It is not affiliated with or supported by WhatsApp or Meta. Using this software uncautiously to interact with WhatsApp may violate their Terms of Service and could result in the permanent ban of your WhatsApp account. Use this API strictly at your own risk. The author assumes no liability or responsibility for any account bans, damages, or losses resulting from the use of this project.

***

> **Note:** For legacy implementation details (pre-v1.0.0 architecture), please refer to the [Legacy Documentation](docs/legacy_readme.md).

> **Docs:** Start here for the full guide and troubleshooting: [docs/README.md](docs/README.md).

## Why WhatsUp?

Integrating WhatsApp into your application shouldn't mean reinventing the wheel. While [Baileys](https://github.com/WhiskeySockets/Baileys) is the most powerful library for interacting with the WhatsApp WebSocket protocol, it is fundamentally low-level. Developers integrating Baileys into production apps often face the same grueling hurdles: managing volatile connection states, handling buffer-based protobufs, wrestling with WebSockets, and managing rate limits to prevent aggressive account bans.

**WhatsUp** does the heavy lifting for you. It serves as a robust middleware engine that transforms a raw, low-level library into a friendly, ready-to-use microservice. Here is why you should use it:

- **Zero-Boilerplate Head Start:** Skip weeks of complex infrastructure coding. Clone this repo, run it, and you instantly have a production-ready environment complete with REST endpoints and real-time sockets.
- **Language Agnostic Integration:** Want to write your WhatsApp bot in Python, Go, Rust, or PHP? By abstracting Baileys behind a standard REST API and Socket.IO layer, WhatsUp lets you control WhatsApp from *any* programming language or framework.
- **Ban-Safe Queueing & Throttling:** WhatsApp's anti-spam algorithms are merciless. WhatsUp natively implements `p-queue` serialization and `express-rate-limit`. Outbound messages are safely throttled to avoid flooding, drastically reducing the risk of your number getting banned.
- **Painless Session Management:** Multi-Device (MD) authentication, automated credential caching, graceful reconnects, and version spoofing (to defeat annoying `405` bugs) are handled entirely autonomously in the background.
- **Sanitized, Flat Data Structures:** Raw Baileys message events are notoriously complex and deeply nested. Our native parsers seamlessly translate cryptographic buffers and `WebMessageInfo` objects into clean, flat, highly readable JSON formats.
- **Modern MVC Architecture:** Built on a rigorous Model-View-Controller pattern in strict TypeScript, eliminating spaghetti code. It’s highly modular and extremely easy to extend to fit your specific business logic.

## Features

- **Real-Time WebSockets:** Instantly push connection statuses, logic hooks, authentication QR codes, and incoming message activity (new texts, reactions, edited messages, and deletes) directly to frontend clients over `socket.io` rather than requiring polling.
- **REST API (v2):** A highly modular MVC architectural layout for processing WhatsApp requests cleanly. 
- **Security & Rate Limiting:** Built-in safeguards against abuse, featuring a unified `p-queue` system to serialize all outgoing messages across concurrent requests, an IP-based `express-rate-limit` barrier (60 req/min), and strict JSON payload size limitations to block IP flood and DDoS attacks.
- **Deep Message Parsers:** Seamlessly transforms complex nested Baileys message events into cleanly typed responses. Features native base64 buffering of physical images/media coming inbound.
- **Batch Messaging & Throttling:** Natively supports sending to string arrays for batch messaging with a baked-in 2-second anti-spam delay between requests to protect your WhatsApp account.
- **TypeScript Support:** End-to-end typed for superior maintainability and zero-tolerance safety around the Baileys library.
- **Dynamic Version Spoofing:** Connects seamlessly with the latest WhatsApp client version to combat `405 Method Not Allowed` bugs natively.

---

## Installation

**Clone the repository:**

```bash
git clone https://github.com/Azizham66/WhatsUP.git
cd WhatsUP
```

**Install dependencies:**

```bash
npm install
```

> Note: This repo currently depends on a release-candidate version of Baileys (`@whiskeysockets/baileys`). If you run into breaking changes, check Baileys release notes and consider pinning a stable version.

---

## Development & Execution

**Launch Development Environment (Hot Reload):**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Start Built Server:**
```bash
npm run start
```

**One-Time WhatsApp Pairing (Print QR then exit):**
```bash
npm run connect
```

This starts the API server, prints the QR code in your terminal, waits until WhatsApp is connected, then shuts the server down automatically (credentials remain saved in `auth_info/`).

By default, the REST API and the WebSocket server run on `http://localhost:3000`.

---

## API Reference (v2)

### Authentication
- `POST /api/v2/auth/login` - Triggers the WhatsApp connection and readies the WebSocket to emit the QR code.
- `POST /api/v2/auth/logout` - Terminates the active session (optionally clears local credential caching).
- `POST /connect` & `DELETE /logout` - Exists for backwards compatibility.

### Messaging
- `POST /api/v2/message/send` - Send a text or rich message to a user or group.
  - Also mapped to `POST /send-message` for backwards compatibility.

**Request Body Structure:**
```json
{
  "jid": "1234567890@s.whatsapp.net", 
  "message": { "text": "Hello from API!" }
}
```
*Note: `jid` natively supports an array of strings (e.g. `["123@s...", "124@s..."]`). The service will automatically sequentially send messages with anti-spam sleep throttling.*

### Groups
- `GET /api/v2/group` - List comprehensive metadata for all participating groups.
- `GET /api/v2/group/min` - List condensed ID/Name properties of all groups.
- `GET /api/v2/group/id/:id` - Fetch comprehensive metadata for a specific group ID.
- `GET /api/v2/group/id/:id/min` - Fetch condensed data for a specific group ID.
- `GET /api/v2/group/name/:name` - Fetch metadata matching a string name.

All responses are packaged into a standard data wrapper:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## WebSocket Integration

Connect directly to the root namespace using `socket.io-client`:

```javascript
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

// Subscribe to QR Code emissions to display to the user
socket.on("qr_code", (qrCodeString) => {
    // Generates the raw QR string, convert with your favorite library!
});

// Follow Connection State
socket.on("status", (data) => {
    // Returns elements like: { state: "connected" | "disconnected" }
});

// Stream Incoming WhatsApp Messages
socket.on("message", (msg) => console.log("New Message:", msg));

// Stream Chat Reactions
socket.on("reaction", (rxn) => console.log("New Reaction:", rxn));
```

To see a fully functioning flow between the API and the WebSockets, refer to the included client scripts: 
- **`node examples/test-login.js`** - Triggers a login and simulates outbound test sockets
- **`node examples/messageClient.js`** - Demonstrates how to listen to live message payloads (texts, reactions, deletions, edits) directly using `socket.io`.

---

## Troubleshooting

- If Socket.IO clients receive no events, start here: [docs/troubleshooting.md](docs/troubleshooting.md)
- If you see `@lid` identifiers and expect phone numbers, read: [docs/addressing-modes.md](docs/addressing-modes.md)
- For a full architecture + debugging guide, see: [docs/README.md](docs/README.md)

## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) guide for rigid guidelines on our commit message formats, Single Responsibility requirements, and PR flows.

---

## License

MIT

## Author

Abdulaziz Hamzah


