# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-05-20

### Features
- **Real-Time Incoming Message Broadcaster:** WebSockets now stream incoming WhatsApp events instantly to connected frontend clients. Includes support for:
  - `message` (live incoming texts, parsed media)
  - `reaction` (emoji additions/removals mapped perfectly to the reactor)
  - `delete` (message revokes/deletes)
  - `messageUpdate` (edited message tracking)
- **Deep Payload Parsers:** Added `src/utils/messageParser.ts` for clean structural execution. Dynamically sanitizes Baileys deeply-nested and cryptic data schemas. Intercepts incoming messages to parse media attachments seamlessly into physical `base64` buffers. Handles precise logic for distinguishing Private Chat senders vs. Group Chat participants dynamically.
- **Configurable Message Pipeline:** Added the `EnableMessageEvents` configuration object. You can now toggle `receive`, `delete`, `update`, and `reaction` listeners explicitly at scale natively.
- **Global API Rate Limiting:** Enforced `express-rate-limit` on the main server (locking to 60 requests/minute) mapped seamlessly beside the internal concurrent `p-queue` delays, fundamentally shielding the local API and the host WhatsApp account from spam & flood flags.

### Architecture & Fixes
- **Strictly Typed Ecosystem (Zero Any):** Fully replaced trailing `any` types across the listener ecosystem. Safely mapped union type anomalies fired by Baileys inside `messages.delete` and partial updates fired from `messages.update`. 
- **Array Traversal Safety:** Ensured array iterations natively intercept reaction/update arrays accurately.

---

## [1.0.0] - 2026-05-18

### Features
- **TypeScript Migration**: Fully rewrote the initial JavaScript codebase into a strictly-typed TypeScript application.
- **Modular REST Architecture**: Decoupled the monolithic index into an MVC-inspired architecture with isolated `routes/`, `controllers/`, and `services/` for Authentication, Messaging, and Group Management.
- **WebSocket Integration**: Implemented `socket.io` to emit real-time WhatsApp events. QR codes, authentication states, and connection statuses are now pushed directly to connected clients actively instead of being polled via REST.
- **Enhanced Message Dispatcher**: Upgraded the messaging endpoint (`/api/v2/message`) natively supporting both a single string or an array of recipients.
- **Anti-Spam Throttling**: Configured sequential 3-second automated delays between outgoing dispatches when sending multiple messages simultaneously to prevent flagging by WhatsApp's anti-spam servers.
- **Version Spoofing Protection**: Added a dynamic fetch of the latest web version for Baileys connection generation, aggressively eliminating `405` cyclic connection crashes.
- **API Formatting Automation**: Standardized success and failure responses via the custom wrappers `sendSuccess` and `sendError`.

### Changed
- Refactored `package.json` scripts: `start` points correctly to the compiled output, while `dev` successfully monitors `src/index.ts` using `tsx`.
- Changed main API logic space to strict `api/v2/` routes.

---

## [0.1.0-alpha] - Initial Setup

### Features
- Connect to WhatsApp using terminal/API QR code authentication.
- Send single-target text messages via simple REST API POST request.
- List all joined WhatsApp groups.
- Logout and delete the saved session state from the `auth_info/` directory.
- Express-based REST HTTP server setup.
