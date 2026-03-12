import "server-only";

import { db } from "./admin";
import { COL } from "./collections";
import type { OrderDoc } from "./orders.repo";

export type AnalyticsRange = "1d" | "7d" | "30d";

export type AnalyticsStats = {
  range: AnalyticsRange;
  startMs: number;
  endMs: number;

  ordersCount: number;
  revenueCents: number;

  paidCount: number;
  shippedCount: number;
  deliveredCount: number;

  newCustomersCount: number;
};

export function rangeToStartMs(range: AnalyticsRange, endMs = Date.now()) {
  const day = 24 * 60 * 60 * 1000;
  if (range === "1d") return endMs - 1 * day;
  if (range === "7d") return endMs - 7 * day;
  return endMs - 30 * day;
}

export async function getAnalyticsStats(range: AnalyticsRange): Promise<AnalyticsStats> {
  const endMs = Date.now();
  const startMs = rangeToStartMs(range, endMs);

  // Orders in range
  // NOTE: Requires orders created with createdAtMs (we set this in order creation).
  const ordersSnap = await db
    .collection(COL.orders)
    .where("createdAtMs", ">=", startMs)
    .where("createdAtMs", "<=", endMs)
    .get();

  let revenueCents = 0;
  let paidCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;

  for (const d of ordersSnap.docs) {
    const o = d.data() as OrderDoc;
    revenueCents += Number(o.amountTotalCents || 0);

    if (o.status === "paid" || o.status === "processing") paidCount += 1;
    if (o.status === "shipped") shippedCount += 1;
    if (o.status === "delivered") deliveredCount += 1;
  }

  // New customers in range
  const usersSnap = await db
    .collection(COL.users)
    .where("createdAtMs", ">=", startMs)
    .where("createdAtMs", "<=", endMs)
    .get();

  return {
    range,
    startMs,
    endMs,
    ordersCount: ordersSnap.size,
    revenueCents,
    paidCount,
    shippedCount,
    deliveredCount,
    newCustomersCount: usersSnap.size,
  };
}