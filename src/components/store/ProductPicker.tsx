"use client";

import { useEffect, useMemo, useState } from "react";

export type Pick = { fabric: string; size: string; color: string };
type Variant = Pick & { stock: number };

function uniq(vals: string[]) {
  return Array.from(new Set(vals.map((v) => v.trim()).filter(Boolean))).sort();
}

export function ProductPicker({
  variants,
  onPick,
}: {
  variants: Variant[];
  onPick: (pick: Pick, stock: number) => void;
}) {
  const allFabrics = useMemo(() => uniq(variants.map((v) => v.fabric)), [variants]);

  const [fabric, setFabric] = useState(allFabrics[0] || "");
  const sizesForFabric = useMemo(
    () => uniq(variants.filter((v) => v.fabric === fabric).map((v) => v.size)),
    [variants, fabric]
  );

  const [size, setSize] = useState(sizesForFabric[0] || "");

  const colorsForFabricSize = useMemo(
    () => uniq(variants.filter((v) => v.fabric === fabric && v.size === size).map((v) => v.color)),
    [variants, fabric, size]
  );

  const [color, setColor] = useState(colorsForFabricSize[0] || "");

  useEffect(() => {
    // keep size valid when fabric changes
    if (sizesForFabric.length && !sizesForFabric.includes(size)) setSize(sizesForFabric[0]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric, sizesForFabric.join("|")]);

  useEffect(() => {
    // keep color valid when size changes
    if (colorsForFabricSize.length && !colorsForFabricSize.includes(color)) setColor(colorsForFabricSize[0]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, colorsForFabricSize.join("|")]);

  const picked = useMemo(() => {
    const v = variants.find((x) => x.fabric === fabric && x.size === size && x.color === color);
    return v || null;
  }, [variants, fabric, size, color]);

  useEffect(() => {
    if (!picked) return;
    onPick({ fabric, size, color }, picked.stock || 0);
  }, [picked, fabric, size, color, onPick]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fabric</label>
          <select value={fabric} onChange={(e) => setFabric(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm">
            {allFabrics.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm">
            {sizesForFabric.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Color</label>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm">
            {colorsForFabricSize.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm">
        {picked ? (
          picked.stock > 0 ? (
            <span className="text-green-700">In stock</span>
          ) : (
            <span className="text-red-600">Sold out</span>
          )
        ) : (
          <span className="text-gray-600">Choose options</span>
        )}
      </div>
    </div>
  );
}