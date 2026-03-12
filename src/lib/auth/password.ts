import crypto from "crypto";

const KEYLEN = 64;

export function hashPassword(password: string) {
  const p = (password || "").trim();
  if (p.length < 8) throw new Error("Password must be at least 8 characters.");

  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(p, salt, KEYLEN);

  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const p = (password || "").trim();
  if (!stored) return false;

  const parts = stored.split(":");
  if (parts.length !== 3) return false;

  const [scheme, saltHex, hashHex] = parts;
  if (scheme !== "scrypt") return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(p, salt, expected.length);

  return crypto.timingSafeEqual(actual, expected);
}