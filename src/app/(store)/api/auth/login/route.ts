import { NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";

import { db, serverTimestamp } from "@/lib/firebase/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const SESSION_COOKIE = "pt_session";

function secretKey() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("Missing env: AUTH_JWT_SECRET");
  return new TextEncoder().encode(secret);
}

async function signCustomerSession(input: { uid: string; email: string }) {
  return await new SignJWT({
    kind: "customer",
    uid: input.uid,
    email: input.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("pami-threads")
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = Body.parse(json);

  const email = body.email.trim().toLowerCase();
  const password = body.password;

  // Find existing customer by email
  const snap = await db.collection("customers").where("email", "==", email).limit(1).get();

  let uid: string;
  if (snap.empty) {
    // Auto-create customer account on first login (smooth)
    uid = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    await db.collection("customers").doc(uid).set({
      uid,
      email,
      passwordHash,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const doc = snap.docs[0]!;
    const data = doc.data() as any;

    uid = (data.uid || doc.id || "").toString();
    const storedHash = (data.passwordHash || "").toString();

    if (!storedHash) {
      return NextResponse.json({ ok: false, message: "Account missing password. Please contact support." }, { status: 400 });
    }

    const ok = verifyPassword(password, storedHash);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }
  }

  const token = await signCustomerSession({ uid, email });

  const res = NextResponse.json({ ok: true });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}