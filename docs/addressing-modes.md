# Addressing modes (`@lid` vs `@s.whatsapp.net`)

You may see incoming chats/participants using IDs like:
- `123456789012345@lid`

This is **LID addressing mode**. A `@lid` identifier is **not** a phone number and cannot be reliably converted to `+<countrycode><number>`.

## What you can expect in this API

- `senderJid` is always provided.
- `senderNumber` is only provided when the sender JID is a phone-style JID (typically `...@s.whatsapp.net`).

If you need phone numbers while WhatsApp is operating in LID mode, you must build a mapping layer (contacts/store) using data WhatsApp/Baileys provides, rather than parsing digits from the `@lid` itself.

