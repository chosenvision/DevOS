import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * AES-256-GCM encryption for OAuth refresh tokens at rest. Server-only —
 * never import this from a Client Component (the "node:crypto" import
 * alone would fail the client bundle, which is the point: it's a hard
 * guarantee this key never ships to the browser).
 *
 * TOKEN_ENCRYPTION_KEY is any secret string; it's stretched into a proper
 * 256-bit key via scrypt with a fixed salt (fine here — the secret itself
 * is the entropy source, not a low-entropy user password).
 */

function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` and add it to your environment before connecting Google."
    );
  }
  return scryptSync(secret, "devos-token-encryption", 32);
}

/** Returns `iv:authTag:ciphertext`, all hex-encoded. */
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(payload: string): string {
  const [ivHex, authTagHex, dataHex] = payload.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Malformed encrypted token payload.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
