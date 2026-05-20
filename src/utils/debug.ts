const DEBUG_WA_EVENTS_ENV_VAR = "DEBUG_WA_EVENTS";

export function isWaEventsDebugEnabled(): boolean {
  const value = process.env[DEBUG_WA_EVENTS_ENV_VAR];
  return value === "1" || value === "true";
}

