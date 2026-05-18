# Contributing to Baileys-API

First off, thank you for considering contributing to Baileys-API! It's people like you that make open-source tools great. This document provides a clear guide on how to get your environment set up and how to submit your contributions.

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Git**
- A WhatsApp account for testing QR logins and messages

### Local Development Setup

1. **Fork and clone the repository:**
   First, fork the project on GitHub, then clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Baileys-API.git
   cd Baileys-API
   ```

2. **Add the original repository as an upstream remote:**
   ```bash
   git remote add upstream https://github.com/Azizham66/Baileys-API.git
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   This project uses `tsx` for hot-reloading TypeScript files.
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:3000`.*

5. **Run TypeScript checks:**
   Before pushing code, make sure it compiles without errors:
   ```bash
   npm run testbuild
   ```

## Project Structure Overview

To help you navigate the codebase, here is how the app is organized:
- `src/index.ts`: The main entry point, sets up Express and WebSockets.
- `src/whatsappClient.ts`: Manages the core Baileys WhatsApp client, session states, and events.
- `src/controllers/`: Express request/response handlers.
- `src/services/`: Core logic interacting with the WhatsApp client.
- `src/routes/`: Express route definitions.

## Coding Style & Guidelines

To keep the codebase maintainable and readable for everyone, please follow these general guidelines:
- **Use TypeScript:** Take advantage of TypeScript for safety. Try to avoid `any` and use types exported by the `@whiskeysockets/baileys` package where applicable.
- **Keep it modular:** If you add a new feature, place the business logic in `services/` and the HTTP logic in `controllers/`.
- **Consistent Responses:** Use the `sendSuccess` and `sendError` utilities for API responses.

## Making a Pull Request

1. **Create a branch:**
   Always create a new branch for your work. Keep the naming clear (e.g., `feature/message-listener` or `fix/connection-bug`):
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write good commit messages:**
   We follow the [Conventional Commits](https://www.conventionalcommits.org/) format. This helps automatically generate changelogs and keeps the history readable.
   ```bash
   git commit -m "feat: add webhook support for incoming messages"
   ```

3. **Push to your fork:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Open a Pull Request:**
   Go to the original repository on GitHub and click "New Pull Request". Please provide a clear description of what your PR solves or adds.

## Need Help?
If you're stuck on a setup step or don't know where to start, feel free to open an Issue asking for guidance!