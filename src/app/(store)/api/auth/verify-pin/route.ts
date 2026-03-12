import { NextResponse } from "next/server";
import { z } from "zod";

import { findValidAuthPin, markAuthPinUsed, upsertCustomerByEmail } from "@/lib/firebase";
import { hashPin, normalizeEmail, safeEqual, signSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/cookie";

const Body = z.object({
  email: z.string().email(),
  pin: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const { email, pin } = Body.parse(json);

  const normalized = normalizeEmail(email);
  const found = await findValidAuthPin(normalized);
  if (!found) return NextResponse.json({ ok: false, message: "Invalid code" }, { status: 400 });

  const incoming = hashPin(pin);
  if (!safeEqual(incoming, found.data.pinHash)) {
    return NextResponse.json({ ok: false, message: "Invalid code" }, { status: 400 });
  }

  await markAuthPinUsed(found.id);

  const user = await upsertCustomerByEmail(normalized);

  const token = await signSession({ kind: "customer", uid: user.id, email: normalized });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}
