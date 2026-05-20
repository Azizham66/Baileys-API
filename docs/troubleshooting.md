# Troubleshooting

## No Socket.IO events arriving in `examples/messageClient.js`

1) Confirm the server is running:
- `npm run dev`

2) Ensure WhatsApp is connected (you must trigger login; `messageClient.js` only listens):
- `node examples/test-login.js`

3) Enable event tracing:

PowerShell:
```powershell
$env:DEBUG_WA_EVENTS="1"; npm run dev
```

cmd.exe:
```bat
set DEBUG_WA_EVENTS=1 && npm run dev
```

When enabled, you should see logs like:
- `[wa-events] message listener init`
- `[wa-events] messages.upsert type=notify count=...`
- `[wa-events] emit message`

If you **never** see `messages.upsert`, Baileys is not emitting incoming message events for that session (independent of Socket.IO).

## “unexpected error in 'init queries'” / `Timed Out`

Baileys can log init query timeouts during startup. This can be noisy and may correlate with slow network or WhatsApp-side delays.

What this project does to avoid cascading failures:
- Message parsing avoids blocking calls where possible (e.g., group subject lookup is cached + has a timeout).

## “failed to decrypt message” / `SessionError: No session record`

This is a Baileys/libsignal decrypt error that can happen with certain sessions or message types.

In this repo:
- Message-event handlers are defensive so decrypt/parse failures don’t stop all event emission.

