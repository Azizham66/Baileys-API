const JID_SEPARATOR = "@";
const DEVICE_SEPARATOR = ":";
const LID_SUFFIX = "@lid";
const S_WHATSAPP_NET_SUFFIX = "@s.whatsapp.net";

// E.164 max length is 15 digits (excluding +). We keep it conservative to avoid treating LIDs as phone numbers.
const MIN_E164_DIGITS = 7;
const MAX_E164_DIGITS = 15;

function stripDeviceSuffix(localPart: string): string {
    const deviceSeparatorIndex = localPart.indexOf(DEVICE_SEPARATOR);
    if (deviceSeparatorIndex === -1) return localPart;
    return localPart.slice(0, deviceSeparatorIndex);
}

function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

function isPlausibleE164Digits(digits: string): boolean {
    return digits.length >= MIN_E164_DIGITS && digits.length <= MAX_E164_DIGITS;
}

/**
 * Best-effort extraction of phone number from a WhatsApp JID.
 * Returns null for non-phone identifiers (e.g. LID addressing mode).
 */
export function getNumberFromJID(jid: string): string | null {
    if (!jid) return null;

    // LID addressing mode is not a phone number; avoid showing misleading huge "+<digits>"
    if (jid.endsWith(LID_SUFFIX)) return null;

    // Only attempt to parse known phone-number JIDs
    if (!jid.endsWith(S_WHATSAPP_NET_SUFFIX)) return null;

    const atIndex = jid.indexOf(JID_SEPARATOR);
    if (atIndex === -1) return null;

    const localPart = stripDeviceSuffix(jid.slice(0, atIndex));
    const digits = digitsOnly(localPart);

    if (!isPlausibleE164Digits(digits)) return null;

    return `+${digits}`;
}
