# Changelog

All notable changes to this project will be documented in this file.

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
