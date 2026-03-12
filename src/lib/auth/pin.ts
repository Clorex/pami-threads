import crypto from "crypto";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashPin(pin: string) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("Missing env: AUTH_JWT_SECRET");
  return crypto.createHash("sha256").update(`${pin}:${secret}`).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}
