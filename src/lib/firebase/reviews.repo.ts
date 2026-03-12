import "server-only";

import { db, serverTimestamp } from "./admin";
import { COL } from "./collections";

export type ReviewDoc = {
  productId: string;
  userId: string;
  userEmail?: string;

  rating: number; // 1..5
  text: string;

  isApproved: boolean;

  createdAtMs?: number;

  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ReviewWithId = ReviewDoc & { id: string };

function reviewId(productId: string, userId: string) {
  return `${productId}__${userId}`;
}

/**
 * Upsert review:
 * - First time: creates as pending (isApproved=false)
 * - Updates: keeps current approval state (admin-controlled)
 */
export async function upsertReview(input: Omit<ReviewDoc, "createdAt" | "updatedAt" | "createdAtMs">) {
  const id = reviewId(input.productId, input.userId);
  const ref = db.collection(COL.reviews).doc(id);

  const snap = await ref.get();
  const nowMs = Date.now();

  if (!snap.exists) {
    await ref.set({
      ...input,
      isApproved: false, // moderation: pending by default
      createdAtMs: nowMs,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } satisfies ReviewDoc);
  } else {
    const existing = snap.data() as ReviewDoc;

    await ref.update({
      rating: input.rating,
      text: input.text,
      userEmail: input.userEmail || undefined,
      // Keep approval state as-is (admin decides)
      isApproved: Boolean(existing.isApproved),
      updatedAt: serverTimestamp(),
    } satisfies Partial<ReviewDoc>);
  }

  return { id };
}

export async function listApprovedReviewsByProduct(productId: string, limit = 25): Promise<ReviewWithId[]> {
  const snap = await db
    .collection(COL.reviews)
    .where("productId", "==", productId)
    .where("isApproved", "==", true)
    .orderBy("createdAtMs", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ReviewDoc) }));
}

export async function listAllReviewsAdmin(limit = 300): Promise<ReviewWithId[]> {
  const snap = await db.collection(COL.reviews).orderBy("createdAtMs", "desc").limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ReviewDoc) }));
}

export async function setReviewApproval(reviewId: string, isApproved: boolean) {
  await db.collection(COL.reviews).doc(reviewId).update({
    isApproved: Boolean(isApproved),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(reviewId: string) {
  await db.collection(COL.reviews).doc(reviewId).delete();
}