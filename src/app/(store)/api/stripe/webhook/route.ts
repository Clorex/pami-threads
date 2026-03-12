import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe/server";
import {
  createOrUpdateOrderBySessionId,
  getOrderBySessionId,
  markOrderConfirmationEmailSent,
  type OrderItem,
  type ShippingAddress,
  type OrderDoc,
} from "@/lib/firebase/orders.repo";
import { sendOrderConfirmationEmail } from "@/lib/email/orders";

export const runtime = "nodejs";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function sessionToOrder(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const currency = session.currency || "usd";
  const amountTotalCents = session.amount_total || 0;

  const uid = (session.metadata?.uid || "").trim() || undefined;
  const email =
    (session.customer_details?.email || session.metadata?.email || "").trim().toLowerCase() || undefined;

    const sd = (session as any).shipping_details;

  const shipping: ShippingAddress | undefined = sd
    ? {
        name: sd.name || undefined,
        phone: session.customer_details?.phone || undefined,
        line1: sd.address?.line1 || undefined,
        line2: sd.address?.line2 || undefined,
        city: sd.address?.city || undefined,
        state: sd.address?.state || undefined,
        postal_code: sd.address?.postal_code || undefined,
        country: sd.address?.country || undefined,
      }
    : undefined;
const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });

  const items: OrderItem[] = [];
  for (const li of lineItems.data) {
    let pick: OrderItem["pick"] = undefined;
    let productId: string | undefined;
    let slug: string | undefined;

    const priceProduct = li.price?.product;
    if (typeof priceProduct === "string" && priceProduct) {
      try {
        const prod = await stripe.products.retrieve(priceProduct);
        const md = prod.metadata || {};
        pick = {
          fabric: md.fabric || undefined,
          size: md.size || undefined,
          color: md.color || undefined,
        };
        productId = md.productId || undefined;
        slug = md.slug || undefined;
      } catch {
        // ignore
      }
    }

    items.push({
      title: li.description || "Item",
      quantity: li.quantity || 1,
      amountSubtotalCents: li.amount_subtotal || 0,
      amountTotalCents: li.amount_total || 0,
      currency,
      pick,
      productId,
      slug,
    });
  }

  const order: Omit<OrderDoc, "createdAt" | "updatedAt"> = {
    stripeSessionId: sessionId,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    uid,
    email,
    status: "paid",
    currency,
    amountTotalCents,
    items,
    shipping,
  };

  return { sessionId, order };
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false, message: "Missing signature" }, { status: 400 });

  const secret = required("STRIPE_WEBHOOK_SECRET");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { sessionId, order } = await sessionToOrder(session);

      // Save order (idempotent)
      await createOrUpdateOrderBySessionId(sessionId, order);

      // Send confirmation email only once
      if (order.email) {
        const existing = await getOrderBySessionId(sessionId);
        const alreadySent = Boolean(existing?.confirmationEmailSentAtMs);

        if (!alreadySent) {
          await sendOrderConfirmationEmail(order.email, order as OrderDoc);
          await markOrderConfirmationEmailSent(sessionId);
        }
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: event.type });
  } catch {
    return NextResponse.json({ ok: false, message: "Webhook handling failed" }, { status: 500 });
  }
}