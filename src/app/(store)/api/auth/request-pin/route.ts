import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthPin } from "@/lib/firebase";
import { generatePin, hashPin, normalizeEmail } from "@/lib/auth";
import { sendLoginPinEmail } from "@/lib/email/resend";

const Body = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const { email } = Body.parse(json);

  const normalized = normalizeEmail(email);
  const pin = generatePin();
  const pinHash = hashPin(pin);

  await createAuthPin(normalized, pinHash, 10);
  await sendLoginPinEmail(normalized, pin);

  return NextResponse.json({ ok: true });
}
