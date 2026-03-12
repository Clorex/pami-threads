import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/session";
import { submitPaymentProofForOrder } from "@/lib/firebase/orders.repo";

export const runtime = "nodejs";

const Body = z.object({
  orderId: z.string().min(1),
  publicId: z.string().min(1),
  secureUrl: z.string().min(1),
});

export async function POST(req: Request) {
  const customer = await requireCustomer();
  const json = await req.json().catch(() => ({}));
  const body = Body.parse(json);

  await submitPaymentProofForOrder({
    orderId: body.orderId,
    uid: customer.uid,
    proof: { publicId: body.publicId, secureUrl: body.secureUrl },
  });

  return NextResponse.json({ ok: true });
}