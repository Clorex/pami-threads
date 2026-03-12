import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import {
  getOrderBySessionId,
  updateOrderAdminFields,
  type OrderStatus,
  type OrderDoc,
} from "@/lib/firebase/orders.repo";
import { sendShippingUpdateEmail } from "@/lib/email/orders";
import { sendReviewRequestEmail } from "@/lib/email/reviews";

const FormSchema = z.object({
  status: z.string().min(1),
  trackingCarrier: z.string().optional().default(""),
  trackingCode: z.string().optional().default(""),
  trackingUrl: z.string().optional().default(""),
});

function isOrderStatus(v: string): v is OrderStatus {
  return ["payment_pending","payment_approved","paid","processing","shipped","delivered","cancelled","refunded"].includes(v);
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  await requireAdmin();
  const { id } = await ctx.params;

  const existing = await getOrderBySessionId(id);
  if (!existing) return NextResponse.redirect(new URL("/admin/orders", req.url));

  const form = await req.formData();
  const parsed = FormSchema.parse({
    status: String(form.get("status") || ""),
    trackingCarrier: String(form.get("trackingCarrier") || ""),
    trackingCode: String(form.get("trackingCode") || ""),
    trackingUrl: String(form.get("trackingUrl") || ""),
  });

  const nextStatus = isOrderStatus(parsed.status) ? parsed.status : existing.status;

  const trackingCarrier = parsed.trackingCarrier.trim() || undefined;
  const trackingCode = parsed.trackingCode.trim() || undefined;
  const trackingUrl = parsed.trackingUrl.trim() || undefined;

  const statusChanged = nextStatus !== existing.status;

  const changed =
    statusChanged ||
    trackingCarrier !== existing.trackingCarrier ||
    trackingCode !== existing.trackingCode ||
    trackingUrl !== existing.trackingUrl;

  await updateOrderAdminFields(id, {
    status: nextStatus,
    trackingCarrier,
    trackingCode,
    trackingUrl,
  });

  // Shipping email rule:
  // Send when status is shipped AND there is tracking AND something changed.
  const hasTracking = Boolean(trackingUrl || trackingCode);
  if (existing.email && nextStatus === "shipped" && hasTracking && changed) {
    const updatedOrder: OrderDoc = {
      ...(existing as unknown as OrderDoc),
      status: nextStatus,
      trackingCarrier,
      trackingCode,
      trackingUrl,
    };

    await sendShippingUpdateEmail(existing.email, updatedOrder);
    await updateOrderAdminFields(id, { shippingEmailLastSentAtMs: Date.now() });
  }

  // Review request rule:
  // Send once when status becomes delivered (and not sent before)
  if (existing.email && nextStatus === "delivered" && statusChanged && !existing.reviewRequestEmailSentAtMs) {
    const updatedOrder: OrderDoc = {
      ...(existing as unknown as OrderDoc),
      status: nextStatus,
      trackingCarrier,
      trackingCode,
      trackingUrl,
    };

    await sendReviewRequestEmail(existing.email, updatedOrder);
    await updateOrderAdminFields(id, { reviewRequestEmailSentAtMs: Date.now() });
  }

  return NextResponse.redirect(new URL("/admin/orders", req.url));
}