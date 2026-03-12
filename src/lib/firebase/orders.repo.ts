import "server-only";

import { db, serverTimestamp } from "./admin";
import { COL } from "./collections";

export type OrderItem = {
  title: string;
  quantity: number;
  amountSubtotalCents: number;
  amountTotalCents: number;
  currency: string;
  pick?: { fabric?: string; size?: string; color?: string };
  productId?: string;
  slug?: string;
};

export type ShippingAddress = {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

export type OrderStatus =
  | "payment_pending"
  | "payment_approved"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderDoc = {
  stripeSessionId: string;
  stripePaymentIntentId?: string;

  // Bank transfer flow
  paymentMethod?: "stripe" | "bank_transfer";
  paymentProof?: {
    publicId: string;
    secureUrl: string;
    uploadedAtMs: number;
  };
  paymentApprovedAtMs?: number;
uid?: string;
  email?: string;

  status: OrderStatus;
  currency: string;
  amountTotalCents: number;

  items: OrderItem[];

  shipping?: ShippingAddress;

  trackingCarrier?: string;
  trackingCode?: string;
  trackingUrl?: string;

  confirmationEmailSentAtMs?: number;
  shippingEmailLastSentAtMs?: number;
  reviewRequestEmailSentAtMs?: number;

  createdAtMs?: number;

  createdAt?: unknown;
  updatedAt?: unknown;
};

export type OrderWithId = OrderDoc & { id: string };

export async function getOrderBySessionId(sessionId: string): Promise<OrderWithId | null> {
  const snap = await db.collection(COL.orders).doc(sessionId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as OrderDoc) };
}

export async function createOrUpdateOrderBySessionId(
  sessionId: string,
  doc: Omit<OrderDoc, "createdAt" | "updatedAt">
) {
  const ref = db.collection(COL.orders).doc(sessionId);
  const existing = await ref.get();

  const nowMs = Date.now();

  if (!existing.exists) {
    await ref.set({
      ...doc,
      stripeSessionId: sessionId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAtMs: nowMs,
    } satisfies OrderDoc);
  } else {
    await ref.update({
      ...doc,
      stripeSessionId: sessionId,
      updatedAt: serverTimestamp(),
    } satisfies Partial<OrderDoc>);
  }

  return { id: ref.id };
}

export async function updateOrderAdminFields(
  sessionId: string,
  patch: Partial<
    Pick<
      OrderDoc,
      | "status"
      | "trackingCarrier"
      | "trackingCode"
      | "trackingUrl"
      | "shippingEmailLastSentAtMs"
      | "reviewRequestEmailSentAtMs"
    >
  >
) {
  const ref = db.collection(COL.orders).doc(sessionId);
  await ref.update({
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function markOrderConfirmationEmailSent(sessionId: string) {
  const ref = db.collection(COL.orders).doc(sessionId);
  await ref.update({ confirmationEmailSentAtMs: Date.now(), updatedAt: serverTimestamp() });
}

export async function listOrdersForCustomer(input: { uid?: string; email?: string }, limit = 50): Promise<OrderWithId[]> {
  const email = (input.email || "").trim().toLowerCase();
  const uid = (input.uid || "").trim();

  let q = db.collection(COL.orders) as FirebaseFirestore.Query;

  if (uid) {
    q = q.where("uid", "==", uid);
  } else if (email) {
    q = q.where("email", "==", email);
  } else {
    return [];
  }

  // NOTE: This orderBy may require an index depending on your Firestore setup.
  // If Firestore complains later, we can remove orderBy or add the index.
  q = q.orderBy("createdAtMs", "desc").limit(limit);

  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) }));
}

export async function listAllOrdersAdmin(limit = 200): Promise<OrderWithId[]> {
  const snap = await db.collection(COL.orders).orderBy("createdAtMs", "desc").limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) }));
}

/**
 * Buyer-check for reviews:
 * Returns true if the customer has ANY order containing this productId.
 * Uses a simple scan of recent orders (safe and reliable).
 */
export async function customerHasPurchasedProduct(input: { uid?: string; email?: string }, productId: string) {
  const uid = (input.uid || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const pid = (productId || "").trim();
  if (!pid) return false;

  let q = db.collection(COL.orders) as FirebaseFirestore.Query;

  if (uid) q = q.where("uid", "==", uid);
  else if (email) q = q.where("email", "==", email);
  else return false;

  // Avoid orderBy to reduce index requirements for this check
  const snap = await q.limit(100).get();
  if (snap.empty) return false;

  for (const d of snap.docs) {
    const order = d.data() as OrderDoc;
    for (const it of order.items || []) {
      if ((it.productId || "").trim() === pid) return true;
    }
  }

  return false;
}
export async function createBankTransferOrder(input: {
  uid: string;
  email: string;
  currency: string;
  amountTotalCents: number;
  items: OrderItem[];
}) {
  const ref = db.collection(COL.orders).doc();
  const nowMs = Date.now();

  const doc: OrderDoc = {
    stripeSessionId: ref.id,
    uid: input.uid,
    email: input.email,
    status: "payment_pending",
    paymentMethod: "bank_transfer",
    currency: input.currency,
    amountTotalCents: input.amountTotalCents,
    items: input.items,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs: nowMs,
  };

  await ref.set(doc);
  return { id: ref.id };
}

export async function submitPaymentProofForOrder(input: {
  orderId: string;
  uid: string;
  proof: { publicId: string; secureUrl: string };
}) {
  const ref = db.collection(COL.orders).doc(input.orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("ORDER_NOT_FOUND");
  const order = snap.data() as OrderDoc;

  if ((order.uid || "").trim() !== input.uid) throw new Error("FORBIDDEN");

  await ref.update({
    paymentProof: {
      publicId: input.proof.publicId,
      secureUrl: input.proof.secureUrl,
      uploadedAtMs: Date.now(),
    },
    status: "payment_pending",
    updatedAt: serverTimestamp(),
  });
}

export async function approvePaymentForOrderAdmin(orderId: string) {
  const ref = db.collection(COL.orders).doc(orderId);
  await ref.update({
    status: "payment_approved",
    paymentApprovedAtMs: Date.now(),
    updatedAt: serverTimestamp(),
  });
}