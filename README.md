# WhatsApp API Server with Baileys

This project provides a simple Node.js API interface for sending WhatsApp messages, listing groups, and managing connections using the [Baileys](https://github.com/WhiskeySockets/Baileys) library.

## 📦 Features

- ✅ Connect to WhatsApp using QR code authentication
- 📤 Send messages via REST API
- 👥 List all joined WhatsApp groups
- 🔓 Logout and delete session
- 🚀 Express-based REST server

---

## 🚀 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:


```bash
npm install
```

---

## ⚙️ Usage

1. Start the server

```bash
node index.js
```

This will launch the server at

http://localhost:3000.


---

## 📱 API Endpoints

#### 🔗 `/connect` (POST)

Start the connection process and display the QR code in the terminal.

```bash
curl -X POST http://localhost:3000/connect
```

Response:

```
200 OK: QR code printed in terminal (or already connected)
```



---

#### 💬 `/send-message` (POST)

Send a WhatsApp message to a user or group.

Request Body:

```json
{
  "jid": "1234567890@s.whatsapp.net",
  "message": {
    "text": "Hello from API!"
  }
}
```

cURL Example:

```bash
curl -X POST http://localhost:3000/send-message \
     -H "Content-Type: application/json" \
     -d '{"jid": "1234567890@s.whatsapp.net", "message": { "text": "Hello from API!" }}'
```

Note: Use group IDs as JIDs for group messages (e.g., `1234567890-1234567890@g.us`).


---

#### 👥 `/groups` (GET)

Fetch the list of WhatsApp groups you're part of.

```bash
curl http://localhost:3000/groups
```

Response:

```json
[
  {
    "id": "1234567890-1234567890@g.us",
    "name": "Group Name"
  }
]
```


---

#### 🔓 `/logout` (DELETE)

Logout from WhatsApp and delete session files.

```bash
curl -X DELETE http://localhost:3000/logout
```

Response:

```
200 OK: Logged out and session cleared
```


---

## 🛠 Project Structure

```

.
├── index.js            # Main server file
├── auth_info/          # WhatsApp auth session folder (auto-created)
└── README.md           # You're here!

```

---

## 🔐 Notes

The QR code for login appears in the terminal when you POST to `/connect`.

The session is persisted in the `auth_info` folder.

If you delete the auth_info folder or call `/logout`, you'll need to rescan the QR code.



---

## 🧾 License

MIT


---

## 👤 Author

ABDULAZIZ HAMZAH



---

## ❤️ Support

If you like this project, consider starring ⭐ the repository and sharing it!

---

Let me know if you'd like to add Docker, `.env` support, or Swagger documentation!

