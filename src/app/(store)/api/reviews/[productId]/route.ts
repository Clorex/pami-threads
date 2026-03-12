import { NextResponse } from "next/server";
import { z } from "zod";

import { listApprovedReviewsByProduct, upsertReview, customerHasPurchasedProduct } from "@/lib/firebase";
import { requireCustomer } from "@/lib/auth/session";

const PostBody = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).default(""),
});

type Ctx = { params: Promise<{ productId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { productId } = await ctx.params;
  const reviews = await listApprovedReviewsByProduct(productId, 25);
  return NextResponse.json({ ok: true, reviews });
}

export async function POST(req: Request, ctx: Ctx) {
  const { productId } = await ctx.params;

  let customer: { uid: string; email: string };
  try {
    customer = await requireCustomer();
  } catch {
    return NextResponse.json({ ok: false, message: "Please sign in to leave a review." }, { status: 401 });
  }

  const hasBought = await customerHasPurchasedProduct({ uid: customer.uid, email: customer.email }, productId);
  if (!hasBought) {
    return NextResponse.json(
      { ok: false, message: "Only customers who purchased this item can leave a review." },
      { status: 403 }
    );
  }

  const json = await req.json().catch(() => ({}));
  const body = PostBody.parse(json);

  await upsertReview({
    productId,
    userId: customer.uid,
    userEmail: customer.email,
    rating: body.rating,
    text: (body.text || "").trim(),
    isApproved: false, // pending approval
  });

  return NextResponse.json({ ok: true, pending: true });
}