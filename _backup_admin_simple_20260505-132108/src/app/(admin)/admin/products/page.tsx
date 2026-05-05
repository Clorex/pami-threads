"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type VariantSlim = { fabric: string };

type Product = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  isActive: boolean;
  variants?: VariantSlim[];
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [fabric, setFabric] = useState("All");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  /* Load all products from API */
  async function load() {
    setMsg("");
    const r = await fetch("/admin/api/products", { method: "GET" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) {
      setMsg("Could not load products.");
      return;
    }
    setItems(j.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  /* Build unique fabric list from all products */
  const fabrics = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) =>
      (p.variants || []).forEach((v) => {
        const f = (v.fabric || "").trim();
        if (f) set.add(f);
      })
    );
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  /* Filter products by search query + fabric */
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQ =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query);
      const matchesFabric =
        fabric === "All" ||
        (p.variants || []).some((v) => (v.fabric || "").trim() === fabric);
      return matchesQ && matchesFabric;
    });
  }, [items, q, fabric]);

  /* Delete a product */
  async function del(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      setBusy(true);
      const r = await fetch(`/admin/api/products/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      await load();
    } catch {
      setMsg("Could not delete product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create, edit, and organize your products.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-xl bg-pt-orange hover:bg-pt-orange-hover px-4 py-2 text-sm text-white text-center"
        >
          New product
        </Link>
      </div>

      {/* Search + fabric filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Search by title or slug..."
        />
        <select
          value={fabric}
          onChange={(e) => setFabric(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          {fabrics.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {msg && <div className="text-sm text-gray-700">{msg}</div>}

      {/* Product table */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-12 items-center gap-2 px-4 py-3"
            >
              <div className="col-span-5">
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-xs text-gray-500">/{p.slug}</div>
              </div>
              <div className="col-span-2 text-sm">
                ${(p.priceCents / 100).toFixed(2)}
              </div>
              <div className="col-span-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  disabled={busy}
                  onClick={() => del(p.id)}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}