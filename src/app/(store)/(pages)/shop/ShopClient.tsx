"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShopFilters, type Filters } from "@/components/store/ShopFilters";
import { ProductCard } from "@/components/store/ProductCard";
import { SquareProductCard } from "@/components/store/SquareProductCard";
import type { ShopProduct } from "./page";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function moneyUSD(cents: number) {
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(v);
}

function clampPage(n: number, total: number) {
  if (total <= 1) return 1;
  return Math.min(Math.max(1, n), total);
}

function pageButtons(current: number, total: number) {
  // simple compact pager: 1 ... (current-1) current (current+1) ... total
  const out: (number | "...")[] = [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  out.push(1);
  if (current > 3) out.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) out.push(i);
  if (current < total - 2) out.push("...");
  out.push(total);
  return out;
}

export function ShopClient({ products }: { products: ShopProduct[] }) {
  const searchParams = useSearchParams();
  const initialFabric = searchParams.get("fabric") || "";

  const [filters, setFilters] = useState<Filters>(() => ({
    fabric: initialFabric,
    color: "",
    size: "",
    sort: "default",
    priceMin: "",
    priceMax: "",
  }));

  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fabricsTop = useMemo(() => {
    const all = products.flatMap((p) =>
      p.variants.map((v) => (v.fabric || "").trim())
    );
    return uniq(all).slice(0, 12);
  }, [products]);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    const vals = products.map((p) => p.priceCents || 0);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    // search
    const query = q.trim().toLowerCase();
    if (query) {
      result = result.filter((p) =>
        (p.title || "").toLowerCase().includes(query)
      );
    }

    // variant filters
    if (filters.fabric) {
      const f = filters.fabric.toLowerCase();
      result = result.filter((p) =>
        p.variants.some((v) => (v.fabric || "").toLowerCase() === f)
      );
    }
    if (filters.color) {
      const c = filters.color.toLowerCase();
      result = result.filter((p) =>
        p.variants.some((v) => (v.color || "").toLowerCase() === c)
      );
    }
    if (filters.size) {
      const s = filters.size.toLowerCase();
      result = result.filter((p) =>
        p.variants.some((v) => (v.size || "").toLowerCase() === s)
      );
    }

    // price range (dollars)
    const minD = Number(filters.priceMin);
    const maxD = Number(filters.priceMax);
    const hasMin = Number.isFinite(minD) && String(filters.priceMin).trim() !== "";
    const hasMax = Number.isFinite(maxD) && String(filters.priceMax).trim() !== "";

    if (hasMin || hasMax) {
      result = result.filter((p) => {
        const d = (p.priceCents || 0) / 100;
        if (hasMin && d < minD) return false;
        if (hasMax && d > maxD) return false;
        return true;
      });
    }

    // sort
    if (filters.sort === "price-asc") result.sort((a, b) => a.priceCents - b.priceCents);
    if (filters.sort === "price-desc") result.sort((a, b) => b.priceCents - a.priceCents);

    return result;
  }, [products, filters, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    // Reset to page 1 whenever filters/search changes
    setPage(1);
  }, [filters, q]);

  useEffect(() => {
    setPage((p) => clampPage(p, totalPages));
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const hasActive =
    Boolean(filters.fabric || filters.color || filters.size) ||
    filters.sort !== "default" ||
    Boolean(q.trim()) ||
    Boolean(filters.priceMin.trim()) ||
    Boolean(filters.priceMax.trim());

  const heroImg = "/shop/shop1.jpg"; // add later (optional)
  const ctaImg = "/shop/shop2.jpg"; // add later (optional)

  const recommendations = useMemo(() => {
    // simple: top 8 items from filtered or products
    const src = filtered.length ? filtered : products;
    return src.slice(0, 8);
  }, [filtered, products]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* HERO */}
        <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="relative h-[220px] sm:h-[260px]">
            <Image
              src={heroImg}
              alt="Shop hero"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent" />

            {/* Big background word */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="select-none text-[64px] font-extrabold tracking-tight text-white/85 sm:text-[96px] lg:text-[120px]">
                Shop
              </div>
            </div>

            {/* Top-left brand line */}
            <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-4 text-white">
              <div className="text-xs font-semibold text-white/90">
                Pami Threads Store
              </div>
            </div>
          </div>

          {/* Search Card (overlapping) */}
          <div className="relative -mt-8 px-4 pb-6 sm:-mt-10">
            <div className="rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xl font-extrabold tracking-tight text-gray-900">
                    Give All You Need
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {filtered.length} {filtered.length === 1 ? "product" : "products"}
                    {products.length ? <span className="text-gray-400"> • </span> : null}
                    {products.length ? (
                      <span className="text-gray-500">
                        Price range: {moneyUSD(priceBounds.min)} – {moneyUSD(priceBounds.max)}
                      </span>
                    ) : null}
                  </div>

                  {/* Quick fabric chips */}
                  {fabricsTop.length ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {fabricsTop.slice(0, 6).map((f) => {
                        const active = filters.fabric === f;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                fabric: prev.fabric === f ? "" : f,
                              }))
                            }
                            className={
                              active
                                ? "rounded-full bg-pt-green px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-pt-green-hover"
                                : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:border-pt-orange hover:bg-pt-orange/10 hover:text-pt-orange"
                            }
                          >
                            {f}
                          </button>
                        );
                      })}
                      <Link
                        href="/size-guide"
                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:border-pt-orange hover:bg-pt-orange/10 hover:text-pt-orange"
                      >
                        Size guide
                      </Link>
                    </div>
                  ) : null}
                </div>

                {/* Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pt-green" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search on Pami Threads..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm
                                 focus:border-pt-orange focus:outline-none focus:ring-2 focus:ring-pt-orange/25 sm:w-80"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-pt-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-pt-orange-hover md:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sort
                  </div>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        sort: e.target.value as Filters["sort"],
                      }))
                    }
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
                               focus:border-pt-orange focus:outline-none focus:ring-2 focus:ring-pt-orange/25"
                  >
                    <option value="default">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                {hasActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setFilters({
                        fabric: "",
                        color: "",
                        size: "",
                        sort: "default",
                        priceMin: "",
                        priceMax: "",
                      });
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-pt-red hover:text-pt-red"
                  >
                    Clear all
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    Tip: use filters to find your perfect fit.
                  </div>
                )}
              </div>

              {/* Active summary pills */}
              {hasActive ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {q.trim() ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                      Search: {q.trim()}
                    </span>
                  ) : null}
                  {filters.fabric ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                      Category: {filters.fabric}
                    </span>
                  ) : null}
                  {filters.color ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                      Color: {filters.color}
                    </span>
                  ) : null}
                  {filters.size ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                      Size: {filters.size}
                    </span>
                  ) : null}
                  {filters.priceMin.trim() || filters.priceMax.trim() ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                      Price: {filters.priceMin.trim() ? `$${filters.priceMin}` : "…"} –{" "}
                      {filters.priceMax.trim() ? `$${filters.priceMax}` : "…"}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Layout */}
        <div className="mt-8 grid gap-6 md:grid-cols-[320px_1fr]">
          {/* Desktop filters */}
          <aside className="hidden md:block">
            <div className="sticky top-24 rounded-3xl border bg-white p-5 shadow-sm">
              <ShopFilters products={products} filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Results */}
          <main className="min-w-0">
            {filtered.length ? (
              <>
                <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {(page - 1) * pageSize + 1}
                    </span>
                    {" – "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(page * pageSize, filtered.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {filtered.length}
                    </span>
                  </div>

                  <div className="hidden sm:block">
                    Page{" "}
                    <span className="font-semibold text-gray-900">{page}</span>{" "}
                    /{" "}
                    <span className="font-semibold text-gray-900">
                      {totalPages}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {paged.map((p) => {
                    const badge =
                      (p.variants.find((v) => (v.fabric || "").trim())?.fabric || "").trim() ||
                      "Other";

                    return (
                      <ProductCard
                        key={p.id}
                        slug={p.slug}
                        title={p.title}
                        priceCents={p.priceCents}
                        imageUrl={p.imageUrl}
                        badge={badge}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => clampPage(p - 1, totalPages))}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:border-pt-orange hover:text-pt-orange disabled:opacity-40"
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </button>

                    {pageButtons(page, totalPages).map((x, idx) =>
                      x === "..." ? (
                        <span key={`dots-${idx}`} className="px-2 text-gray-500">
                          …
                        </span>
                      ) : (
                        <button
                          key={x}
                          type="button"
                          onClick={() => setPage(x)}
                          className={
                            x === page
                              ? "rounded-xl bg-pt-green px-3.5 py-2 text-sm font-semibold text-white"
                              : "rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 hover:border-pt-orange hover:text-pt-orange"
                          }
                        >
                          {x}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => setPage((p) => clampPage(p + 1, totalPages))}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:border-pt-orange hover:text-pt-orange disabled:opacity-40"
                      disabled={page >= totalPages}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-3xl border bg-white p-10 text-center">
                <div className="text-base font-semibold text-gray-900">
                  No products found.
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Try clearing filters or searching a different term.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setFilters({
                      fabric: "",
                      color: "",
                      size: "",
                      sort: "default",
                      priceMin: "",
                      priceMax: "",
                    });
                  }}
                  className="mt-5 rounded-xl bg-pt-orange px-6 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Recommendations */}
        {recommendations.length ? (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Explore our recommendations
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  A few picks you might love.
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {recommendations.map((p) => (
                <div key={`rec-${p.id}`} className="w-[220px] shrink-0">
                  <SquareProductCard
                    slug={p.slug}
                    title={p.title}
                    priceCents={p.priceCents}
                    imageUrl={p.imageUrl}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Bottom CTA / Newsletter */}
        <section className="mt-14 overflow-hidden rounded-3xl border bg-gray-900 text-white shadow-sm">
          <div className="relative">
            <div className="relative h-[220px] sm:h-[240px]">
              <Image
                src={ctaImg}
                alt="Shop CTA"
                fill
                sizes="100vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />
            </div>

            <div className="relative -mt-[220px] sm:-mt-[240px] p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
                <div>
                  <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Ready to Get Our New Stuff?
                  </div>
                  <p className="mt-2 max-w-xl text-sm text-white/85">
                    Drops are small-batch. If you want first access, join the list.
                  </p>

                  <div className="mt-5 flex max-w-md flex-col gap-3 sm:flex-row">
                    <input
                      placeholder="Your email"
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-pt-orange/40"
                    />
                    <button
                      type="button"
                      className="rounded-xl bg-pt-orange px-6 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover"
                    >
                      Send
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-extrabold">
                    Pami Threads for bold everyday style
                  </div>
                  <p className="mt-2 text-sm text-white/80">
                    Heritage fabrics, clean silhouettes, and unisex fits—built for comfort and confidence.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-pt-orange"
                    >
                      Browse the collection <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile filters bottom sheet */}
        {showFilters ? (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-3xl bg-white p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-extrabold text-gray-900">
                  Filters
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold hover:border-pt-orange hover:text-pt-orange"
                >
                  <span className="inline-flex items-center gap-2">
                    <X className="h-4 w-4" /> Close
                  </span>
                </button>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-4">
                <ShopFilters products={products} filters={filters} onChange={setFilters} />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="mt-4 w-full rounded-xl bg-pt-green px-5 py-3 text-sm font-semibold text-white hover:bg-pt-green-hover"
              >
                Apply filters
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}