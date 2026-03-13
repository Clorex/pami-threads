import { NextResponse } from "next/server";
import { z } from "zod";

import { stripe } from "@/lib/stripe/server";

const Body = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        slug: z.string().min(1),
        title: z.string().min(1),
        priceCents: z.number().int().positive(),
        qty: z.number().int().min(1).max(20),
        imageUrl: z.string().min(1),
        pick: z.object({
          fabric: z.string().min(1),
          size: z.string().min(1),
          color: z.string().min(1),
        }),
      })
    )
    .min(1),
});

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = Body.parse(json);

  const appUrl = required("NEXT_PUBLIC_APP_URL").replace(/\/+$/g, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    // Let Stripe collect email during checkout (no customer account needed)
    // customer_email: undefined,

    shipping_address_collection: {
      allowed_countries: ["AU", "NG", "US", "CA", "GB", "NZ"],
    },
    billing_address_collection: "auto",

    line_items: body.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: "usd",
        unit_amount: i.priceCents,
        product_data: {
          name: i.title,
          images: [i.imageUrl],
          metadata: {
            productId: i.productId,
            slug: i.slug,
            fabric: i.pick.fabric,
            size: i.pick.size,
            color: i.pick.color,
          },
        },
      },
    })),

    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,

    metadata: {
      source: "pami-threads",
    },
  });

  return NextResponse.json({ ok: true, url: session.url });
}