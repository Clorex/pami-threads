import { NextResponse } from "next/server";
import { z } from "zod";
import { signSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/cookie";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const { email, password } = Body.parse(json);

  const adminEmail = required("ADMIN_EMAIL").trim().toLowerCase();
  const adminPassword = required("ADMIN_PASSWORD");

  if (email.trim().toLowerCase() !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ ok: false, message: "Invalid details" }, { status: 401 });
  }

  const token = await signSession({ kind: "admin", email: adminEmail }, 60 * 60 * 8);

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}
