# What's Up — Full Guide

This guide explains how this repo is wired internally (REST + Socket.IO + Baileys), how to run it, and how to debug common issues.

## Table of contents

1. [Quick start](#quick-start)
2. [High-level architecture](#high-level-architecture)
3. [Connection flow (QR + session)](#connection-flow-qr--session)
4. [REST API](#rest-api)
5. [WebSocket / Socket.IO events](#websocket--socketio-events)
6. [Message pipeline (Baileys → client)](#message-pipeline-baileys--client)
7. [Media handling](#media-handling)
8. [Rate limiting and message queue](#rate-limiting-and-message-queue)
9. [Reconnect behavior](#reconnect-behavior)
10. [Addressing modes and phone numbers](#addressing-modes-and-phone-numbers)
11. [Debugging (DEBUG_WA_EVENTS)](#debugging-debug_wa_events)
12. [Common error notes](#common-error-notes)

## Quick start

1) Install dependencies:
```bash
npm install
```

2) Run the server (dev):
```bash
npm run dev
```

3) Trigger WhatsApp login (prints QR in the terminal and via Socket.IO):
```bash
node examples/test-login.js
```

4) Run the Socket.IO listener client (shows incoming events):
```bash
node examples/messageClient.js
```

## High-level architecture

This repo has 3 moving parts:

1) **Baileys WhatsApp client** (`src/whatsappClient.ts`)
- Responsible for connecting, maintaining auth, reconnecting, and exposing `isConnected()`/`getSock()` helpers.

2) **REST API** (Express)
- Routes live under `src/routes/*`.
- Controllers live under `src/controllers/*`.
- Services live under `src/services/*`.

3) **WebSocket layer** (Socket.IO)
- Socket.IO server is created in `src/socket.ts` and attached in `src/server.ts`.
- External clients (like `examples/messageClient.js`) connect to `http://localhost:3000` via Socket.IO.

## Connection flow (QR + session)

Source of truth is `src/whatsappClient.ts`.

1) Login starts by calling `connectToWA()`.
2) Baileys `useMultiFileAuthState("auth_info")` persists credentials in `auth_info/`.
3) When Baileys emits a QR (`connection.update`), the server:
- prints the QR to the server terminal
- emits Socket.IO event `qr_code` (so a frontend can render it)
4) When connection opens:
- server emits `status` with `{ state: "connected" }`

Notes:
- `auth_info/` is ignored by git. If you delete it, you will need to scan again.
- If you want to fully logout and clear session, use the logout endpoint.

## REST API

Routes (v2):

### Auth
- `POST /api/v2/auth/login`
  - Starts `connectToWA()` and begins emitting QR updates.
- `POST /api/v2/auth/logout`
  - Logs out of WhatsApp.
  - Optional query: `?deleteSession=false` keeps `auth_info/`.

### Messaging
- `POST /api/v2/message/send`
  - Body:
    ```json
    { "jid": "123@s.whatsapp.net", "message": { "text": "hi" } }
    ```
  - `jid` can also be an array for sequential batch send.

### Groups
- `GET /api/v2/group/*`
  - See `README.md` for the list, or inspect `src/routes/group.routes.ts`.

Response format:
- Controllers should use `sendSuccess`/`sendError` wrappers (see `src/utils/response`).

## WebSocket / Socket.IO events

External clients connect with:
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
```

Events emitted by the server:

- `qr_code` (string)
  - emitted when QR refreshes.
- `status` ({ state: "connected" | "disconnected", info?: unknown })
  - emitted when WhatsApp connects/disconnects.
- `message` (parsed object)
- `reaction` (parsed object)
- `delete` (parsed object)
- `messageUpdate` (parsed object)

The forwarding happens in `src/socket.ts`.

## Message pipeline (Baileys → client)

The message flow is:

1) Baileys emits events on `sock.ev`:
- `messages.upsert`
- `messages.delete`
- `messages.update`
- `messages.reaction`

2) `src/listeners/messageListener.ts` subscribes to those events and converts them into internal events on:
- `messageListener` (Node `EventEmitter`)

3) `src/socket.ts` listens to `messageListener` and calls:
- `io.emit("message", parsedPayload)` etc.

4) External Socket.IO clients receive it and print/handle UI.

Why there is an extra `messageListener` layer:
- It keeps Baileys-specific logic out of Socket.IO code.
- It makes it possible to forward events to other consumers later without changing Socket.IO.

## Media handling

Media parsing happens in `src/utils/messageParser.ts`.

- For images/videos/audio/documents/stickers, the parser attempts `downloadMediaMessage(...)`.
- It converts the resulting buffer to base64 and includes it as `mediaBase64`.

Important:
- If the message has no text (e.g. image without caption), `text` will be `null`. Your clients should handle that.

## Rate limiting and message queue

Two layers exist:

1) HTTP rate limiting
- `express-rate-limit` is applied in `src/server.ts`.

2) Outgoing message serialization (anti-spam)
- `src/services/message.service.ts` uses a global `p-queue` with concurrency `1`.
- The service enforces a delay after each send to reduce spam/ban risk.
- Batch sends are processed sequentially.

## Reconnect behavior

`src/whatsappClient.ts` reconnects unless Baileys indicates you are logged out.

Important detail:
- Every reconnect creates a new Baileys `sock` object.
- That’s why `src/listeners/messageListener.ts` is written to safely detach handlers from an old sock and attach handlers to the new one.

## Addressing modes and phone numbers

See [addressing-modes.md](addressing-modes.md).

Practical implications:
- You may receive message senders as `...@lid`. This is not a phone number.
- In that case, `senderNumber` will be `null`, and you should display `senderName` and/or `senderJid`.

## Debugging (DEBUG_WA_EVENTS)

When enabled, the server prints extra logs to confirm each hop of the pipeline.

PowerShell:
```powershell
$env:DEBUG_WA_EVENTS="1"; npm run dev
```

cmd.exe:
```bat
set DEBUG_WA_EVENTS=1 && npm run dev
```

Logs you should see:
- `message listener init` (listener attached to Baileys sock)
- `messages.upsert ...` (Baileys is delivering events)
- `emit message` (Socket.IO forwarded it)

## Common error notes

### `failed to decrypt message` / `SessionError: No session record`

This is a Baileys/libsignal decrypt error. This repo’s listener layer is defensive so a decrypt failure does not stop all event forwarding.

### `unexpected error in 'init queries'` / `Timed Out`

Baileys can time out initial sync queries. This can be noisy. The repo tries to avoid blocking the message pipeline by:
- using timeouts and caching for group subject lookup in `messageParser`.

If you’re debugging startup stability, start at [troubleshooting.md](troubleshooting.md).

