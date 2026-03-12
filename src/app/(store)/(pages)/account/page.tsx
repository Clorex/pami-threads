"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setEmail(j?.session?.email || ""))
      .catch(() => setEmail(""));
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-pt-green">My account</h1>
      <p className="mt-2 text-sm text-gray-600">{email ? `Signed in as ${email}` : ""}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/orders" className="rounded-xl bg-pt-green hover:bg-pt-green-hover px-4 py-2 text-sm font-semibold text-white text-center">
          View orders
        </Link>

        <button
          type="button"
          onClick={signOut}
          className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}