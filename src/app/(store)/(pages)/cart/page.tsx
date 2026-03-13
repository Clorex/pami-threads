"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readCart, removeFromCart, setQty, type CartItem } from "@/lib/store/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const refresh = () => setItems(readCart());
    refresh();
    window.addEventListener("pt_cart_changed", refresh);
    return () => window.removeEventListener("pt_cart_changed", refresh);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.qty, 0),
    [items]
  );

  async function checkout() {
    setMsg("");
    if (!items.length) return;

    try {
      setBusy(true);

      const r = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            title: i.title,
            priceCents: i.priceCents,
            qty: i.qty,
            imageUrl: i.imageUrl,
            pick: i.pick,
          })),
        }),
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j?.ok || !j?.url) {
        setMsg(j?.message || "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = j.url;
    } catch {
      setMsg("Could not start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pt-green">Your bag</h1>
          <p className="mt-1 text-sm text-gray-600">{items.length} item(s)</p>
        </div>
        <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-pt-orange">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-white p-10 text-center text-sm text-gray-600">
          Your bag is empty.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((i) => (
            <div key={i.key} className="flex gap-4 rounded-2xl border bg-white p-4">
              <div className="relative h-28 w-20 overflow-hidden rounded-xl bg-gray-100">
                <Image src={i.imageUrl} alt={i.title} fill sizes="80px" className="object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">{i.title}</div>
                    <div className="mt-1 text-xs text-gray-600">
                      {i.pick.fabric} • {i.pick.size} • {i.pick.color}
                    </div>
                  </div>

                  <div className="text-sm font-semibold">${(i.priceCents / 100).toFixed(2)}</div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Qty</span>
                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) => {
                        setQty(i.key, Number(e.target.value || 1));
                        setItems(readCart());
                      }}
                      className="w-20 rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(i.key);
                      setItems(readCart());
                    }}
                    className="text-xs font-medium text-gray-600 hover:text-pt-red"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">${(total / 100).toFixed(2)}</span>
            </div>

            {msg ? <div className="mt-3 text-sm text-gray-700">{msg}</div> : null}

            <button
              type="button"
              onClick={checkout}
              disabled={busy}
              className="mt-4 w-full rounded-xl bg-pt-green px-5 py-3 text-sm font-semibold text-white hover:bg-pt-green-hover disabled:opacity-60"
            >
              {busy ? "Starting checkout..." : "Proceed to checkout"}
            </button>

            <div className="mt-3 text-xs text-gray-500">
              You’ll enter shipping details and complete payment securely.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}