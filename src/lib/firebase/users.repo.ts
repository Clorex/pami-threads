import "server-only";

import { db, serverTimestamp } from "./admin";
import { COL } from "./collections";

export type CustomerUser = {
  email: string;
  createdAtMs?: number;
  updatedAtMs?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export async function upsertCustomerByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const snap = await db.collection(COL.users).where("email", "==", normalized).limit(1).get();

  const nowMs = Date.now();

  if (!snap.empty) {
    const doc = snap.docs[0]!;
    await doc.ref.update({ updatedAt: serverTimestamp(), updatedAtMs: nowMs });
    return { id: doc.id, email: normalized };
  }

  const ref = db.collection(COL.users).doc();
  const doc: CustomerUser = {
    email: normalized,
    createdAtMs: nowMs,
    updatedAtMs: nowMs,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await ref.set(doc);
  return { id: ref.id, email: normalized };
}