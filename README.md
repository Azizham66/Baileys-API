# Baileys-API

A lightweight and easy-to-use WhatsApp bot API built using [Baileys](https://github.com/WhiskeySockets/Baileys), a TypeScript/Javascript WhatsApp Web API. This project provides a simple HTTP interface to interact with WhatsApp, making bot development and automation easy.

## 📦 Features

- 🟢 Send messages (text, media, stickers)
- 📥 Receive incoming messages
- 📁 Upload files via the API
- ⚡ Fast setup and deployment
- 🛠️ Built with Express.js and Baileys
- 🔐 Safe session handling

## 🧠 Prerequisites

- Node.js (v18+ recommended)
- Git
- A WhatsApp account
- A cloud or local server to host the bot

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/Azizham66/Baileys-API
cd Baileys-API
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node index.js
```

You’ll see a QR code in the terminal. Scan it with your WhatsApp to connect the bot.

## 🔧 API Endpoints

### `GET /qr`

Returns the current QR code in base64 format (for clients to display to the user).

### `POST /send-message`

Send a message to a specific number.

**Body Parameters** (JSON):

```json
{
  "number": "905XXXXXXXXX",
  "message": "Hello, world!"
}
```

### `POST /send-file`

Send a file (image, video, document, etc.)

**Body Parameters** (form-data):

- `number`: Target number in international format.
- `file`: The file to be sent.

### `GET /status`

Returns the bot's connection status.

## 📁 Folder Structure

```
.
├── index.js          # Main server file
├── session/          # Stores session authentication files
└── uploads/          # Uploaded files (for sending via API)
```

## 📸 Example

Using `curl` to send a message:

```bash
curl -X POST http://localhost:3000/send-message \
-H "Content-Type: application/json" \
-d '{"number": "905XXXXXXXXX", "message": "Hello from Baileys API!"}'
```

## 📌 Notes

- Phone numbers must include the country code, without `+` or `@s.whatsapp.net`.
- The bot will stay connected as long as the session is preserved in the `session/` folder.
- If the QR code doesn't show up, delete the session folder and restart the bot.

## 💡 TODO

- Add authentication middleware
- Add webhook support for incoming messages
- Add media download endpoint

## 🧑‍💻 Author

**Abdulaziz Hamzah**  
[GitHub Profile](https://github.com/Azizham66)

## 🛡️ License

This project is licensed under the MIT License.

---

🟢 Happy Botting with WhatsApp!
