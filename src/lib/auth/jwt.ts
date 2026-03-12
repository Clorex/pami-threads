import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type CustomerSession = {
  kind: "customer";
  uid: string;
  email: string;
};

export type AdminSession = {
  kind: "admin";
  email: string;
};

export type Session = CustomerSession | AdminSession;

function secretKey() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("Missing env: AUTH_JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session, maxAgeSeconds = 60 * 60 * 24 * 30) {
  const payload = session as unknown as JWTPayload;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .setIssuer("pami-threads")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<Session> {
  const { payload } = await jwtVerify(token, secretKey(), { issuer: "pami-threads" });
  return payload as unknown as Session;
}
