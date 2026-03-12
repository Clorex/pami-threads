"use client";

import { useMemo } from "react";

export type Filters = {
  fabric: string;
  color: string;
  size: string;
  sort: "default" | "price-asc" | "price-desc";
  priceMin: string;
  priceMax: string;
};

type Variant = { fabric: string; color: string; size: string };
type Product = { variants?: Variant[] };

function uniqueValues(products: Product[], field: keyof Variant): string[] {
  const set = new Set<string>();
  products.forEach((p) =>
    (p.variants || []).forEach((v) => {
      const val = (v[field] || "").trim();
      if (val) set.add(val);
    })
  );
  return Array.from(set).sort();
}

function countByFabric(products: Product[]) {
  const map = new Map<string, number>();
  products.forEach((p) => {
    const fabrics = new Set(
      (p.variants || [])
        .map((v) => (v.fabric || "").trim())
        .filter(Boolean)
    );
    fabrics.forEach((f) => map.set(f, (map.get(f) || 0) + 1));
  });
  return map;
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-pt-orange px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200/60"
          : "rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 hover:border-pt-orange hover:bg-pt-orange/10 hover:text-pt-orange"
      }
    >
      {label}
    </button>
  );
}

function CategoryRow({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex w-full items-center justify-between rounded-2xl bg-pt-green px-4 py-3 text-sm font-semibold text-white"
          : "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
      }
    >
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className={active ? "text-white/90" : "text-gray-500"}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function ShopFilters({
  products,
  filters,
  onChange,
}: {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const fabrics = useMemo(() => uniqueValues(products, "fabric"), [products]);
  const colors = useMemo(() => uniqueValues(products, "color"), [products]);
  const sizes = useMemo(() => uniqueValues(products, "size"), [products]);
  const fabricCounts = useMemo(() => countByFabric(products), [products]);

  const hasAny =
    Boolean(filters.fabric || filters.color || filters.size) ||
    filters.sort !== "default" ||
    Boolean(filters.priceMin.trim()) ||
    Boolean(filters.priceMax.trim());

  function toggle(field: "color" | "size", val: string) {
    onChange({ ...filters, [field]: filters[field] === val ? "" : val });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-gray-900">Category</div>
        {hasAny ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                fabric: "",
                color: "",
                size: "",
                sort: "default",
                priceMin: "",
                priceMax: "",
              })
            }
            className="text-xs font-semibold text-pt-red hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Category list (Fabric) */}
      <div className="space-y-2">
        <CategoryRow
          active={!filters.fabric}
          label="All products"
          count={products.length}
          onClick={() => onChange({ ...filters, fabric: "" })}
        />

        {fabrics.map((f) => (
          <CategoryRow
            key={f}
            active={filters.fabric === f}
            label={f}
            count={fabricCounts.get(f) || 0}
            onClick={() =>
              onChange({ ...filters, fabric: filters.fabric === f ? "" : f })
            }
          />
        ))}
      </div>

      {/* Color */}
      {colors.length ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-pt-green">
            Color
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <Chip
                key={c}
                active={filters.color === c}
                label={c}
                onClick={() => toggle("color", c)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Size */}
      {sizes.length ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-pt-green">
            Size
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <Chip
                key={s}
                active={filters.size === s}
                label={s}
                onClick={() => toggle("size", s)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Price */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-pt-green">
          Price
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-gray-500">Min ($)</div>
            <input
              value={filters.priceMin}
              onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
                         focus:border-pt-orange focus:outline-none focus:ring-2 focus:ring-pt-orange/25"
              placeholder="0"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">Max ($)</div>
            <input
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
                         focus:border-pt-orange focus:outline-none focus:ring-2 focus:ring-pt-orange/25"
              placeholder="200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}