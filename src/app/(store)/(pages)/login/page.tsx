"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setMsg("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        setMsg(j?.message || "Could not sign in.");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next") || "/";
      window.location.href = next;
    } catch {
      setMsg("Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-pt-green">Sign in</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in with your email and password.
        </p>

        <label className="mt-6 block text-sm font-medium">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="mt-2 w-full rounded-xl border px-3 py-2"
          placeholder="you@example.com"
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="mt-2 w-full rounded-xl border px-3 py-2"
          placeholder="At least 8 characters"
        />

        {msg ? <div className="mt-4 text-sm text-red-600">{msg}</div> : null}

        <button
          onClick={signIn}
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-pt-green px-4 py-2 text-white hover:bg-pt-green-hover disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-3 text-xs text-gray-500">
          If you don’t have an account yet, we’ll create one automatically on first sign-in.
        </div>
      </div>
    </div>
  );
}