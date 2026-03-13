import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Customer sign-in is disabled. Checkout does not require an account." },
    { status: 410 }
  );
}