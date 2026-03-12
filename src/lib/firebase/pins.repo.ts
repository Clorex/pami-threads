import "server-only";

import { db } from "./admin";
import { COL } from "./collections";

export type AuthPinDoc = {
  email: string;
  pinHash: string;
  createdAtMs: number;
  expiresAtMs: number;
  usedAtMs?: number;
};

export async function createAuthPin(email: string, pinHash: string, ttlMinutes = 10) {
  const now = Date.now();
  const expiresAtMs = now + ttlMinutes * 60 * 1000;

  const ref = db.collection(COL.authPins).doc();
  const doc: AuthPinDoc = { email, pinHash, createdAtMs: now, expiresAtMs };

  await ref.set(doc);
  return { id: ref.id, expiresAtMs };
}

export async function findValidAuthPin(email: string) {
  const snap = await db
    .collection(COL.authPins)
    .where("email", "==", email)
    .orderBy("createdAtMs", "desc")
    .limit(10)
    .get();

  if (snap.empty) return null;

  const now = Date.now();

  for (const d of snap.docs) {
    const data = d.data() as AuthPinDoc;
    const used = typeof data.usedAtMs === "number";
    const expired = data.expiresAtMs <= now;

    if (!used && !expired) {
      return { id: d.id, ref: d.ref, data };
    }
  }

  return null;
}

export async function markAuthPinUsed(id: string) {
  await db.collection(COL.authPins).doc(id).update({ usedAtMs: Date.now() });
}
