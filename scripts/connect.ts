import { startServer, stopServer } from "../src/server";
import { connectToWA, isConnected, waEmitter } from "../src/whatsappClient";

const EXIT_DELAY_MS = 1000;
const DEFAULT_CONNECT_TIMEOUT_MS = 5 * 60 * 1000;

function parseTimeoutMs(value: string | undefined): number {
  if (!value) return DEFAULT_CONNECT_TIMEOUT_MS;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_CONNECT_TIMEOUT_MS;
  return parsed;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
  const startedServer = await startServer();

  const shutdownServer = async () => {
    try {
      await stopServer(startedServer);
    } catch (error) {
      console.error("Failed to stop server:", error);
    }
  };

  process.on("SIGINT", async () => {
    await shutdownServer();
    process.exit(130);
  });

  if (isConnected()) {
    console.log("Already connected to WhatsApp. Shutting down server.");
    await shutdownServer();
    return;
  }

  const timeoutMs = parseTimeoutMs(process.env.CONNECT_TIMEOUT_MS);
  const timeoutHandle = setTimeout(() => {
    console.error(
      `Timed out after ${timeoutMs}ms waiting for QR scan/connection.`,
    );
    void shutdownServer().finally(() => process.exit(1));
  }, timeoutMs);

  waEmitter.once("qr_code", () => {
    console.log("QR received. Scan it in WhatsApp to authenticate.");
  });

  try {
    await connectToWA();
    clearTimeout(timeoutHandle);
    console.log("Connected. Shutting down server.");
    await delay(EXIT_DELAY_MS);
    await shutdownServer();
  } catch (error) {
    clearTimeout(timeoutHandle);
    console.error("Failed to connect:", error);
    await shutdownServer();
    process.exitCode = 1;
  }
}

void run();

