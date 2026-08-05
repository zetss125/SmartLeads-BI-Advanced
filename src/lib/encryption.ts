import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = "smartleads-pii-salt-v1";

function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || "smartleads-bi-jwt-secret";
  return crypto.pbkdf2Sync(secret, SALT, 100000, 32, "sha256");
}

export function encryptPII(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptPII(encrypted: string): string {
  if (!encrypted || !encrypted.includes(":")) return encrypted;

  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(":");
    if (parts.length !== 3) return encrypted;

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const ciphertext = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // If decryption fails, return as-is (might be unencrypted legacy data)
    return encrypted;
  }
}

export function hashForSearch(data: string): string {
  if (!data) return "";
  const key = getEncryptionKey();
  return crypto.createHmac("sha256", key).update(data.toLowerCase().trim()).digest("hex").substring(0, 16);
}

export function hashAPIKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateAPIKeyToken(): string {
  const randomBytes = crypto.randomBytes(32);
  return `slk_${randomBytes.toString("base64url")}`;
}

export function generateId(prefix: string = "id"): string {
  const random = crypto.randomBytes(6).toString("hex");
  const ts = Date.now().toString(36);
  return `${prefix}_${random}_${ts}`;
}
