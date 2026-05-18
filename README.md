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

> **Note:** For legacy implementation details (pre-v1.0.0 architecture), please refer to the [Legacy Documentation](docs/legacy_readme.md).

## Features

- **Real-Time WebSockets:** Instantly push connection statuses, logic hooks, and authentication QR codes directly to frontend clients over `socket.io` rather than requiring polling.
- **REST API (v2):** A highly modular MVC architectural layout for processing WhatsApp requests cleanly. 
- **Batch Messaging & Throttling:** Features built-in smart queues that seamlessly handle string arrays for batch messaging with a baked-in 3-second anti-spam delay between requests.
- **TypeScript Support:** End-to-end typed for superior maintainability and safety around the Baileys library.
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
- `POST /api/v2/auth/connect` - Triggers the WhatsApp connection and readies the WebSocket to emit the QR code.
- `DELETE /api/v2/auth/logout` - Terminates the active session and clears local credential caching.
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
```

To see a fully functioning flow between the API and the WebSockets, refer to `examples/test-login.js` and run `node examples/test-login.js`.

---

## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) guide for rigid guidelines on our commit message formats, Single Responsibility requirements, and PR flows.

---

## License

MIT

## Author

Abdulaziz Hamzah


