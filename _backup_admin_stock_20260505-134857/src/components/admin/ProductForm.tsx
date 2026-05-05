"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImageUploader, type ProductImage } from "@/components/admin/ImageUploader";
import { toSlug } from "@/lib/store/slug";
import { Plus, Trash2 } from "lucide-react";

type Variant = {
  size: string;
  fabric: string;
  color: string;
  stock: number;
  sku?: string;
};

export type ProductFormValues = {
  title: string;
  slug: string;
  description: string;
  fitNotes: string;
  priceDollars: string;
  isActive: boolean;
  collectionsCsv: string;
  images: ProductImage[];
  variants: Variant[];
};

const DEFAULT_VARIANT: Variant = { size: "One size", fabric: "Default", color: "Default", stock: 0 };

export function ProductForm({
  initial,
  onSaved,
  submitLabel,
  submitTo,
  method,
}: {
  initial?: Partial<ProductFormValues>;
  onSaved?: (id?: string) => void;
  submitLabel: string;
  submitTo: string;
  method: "POST" | "PATCH";
}) {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      title: initial?.title || "",
      slug: initial?.slug || "",
      description: initial?.description || "",
      fitNotes: initial?.fitNotes || "",
      priceDollars: initial?.priceDollars || "",
      isActive: initial?.isActive ?? true,
      collectionsCsv: initial?.collectionsCsv || "",
      images: initial?.images || [],
      variants: initial?.variants || [DEFAULT_VARIANT],
    },
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const images = form.watch("images");
  const variants = form.watch("variants");

  function addVariant() {
    const current = form.getValues("variants") || [];
    form.setValue("variants", [...current, { size: "", fabric: "", color: "", stock: 0 }], { shouldDirty: true });
  }

  function removeVariant(idx: number) {
    const current = form.getValues("variants") || [];
    const next = current.filter((_, i) => i !== idx);
    form.setValue("variants", next.length ? next : [DEFAULT_VARIANT], { shouldDirty: true });
  }

  async function submit(values: ProductFormValues) {
    setMsg("");

    if (!values.images?.length) return setMsg("Add at least 1 photo.");

    const price = Number(values.priceDollars);
    if (!Number.isFinite(price) || price <= 0) return setMsg("Enter a valid price.");
    const priceCents = Math.round(price * 100);

    const safeVariants = (values.variants && values.variants.length ? values.variants : [DEFAULT_VARIANT]).map((v) => ({
      size: (v.size || "").trim(),
      fabric: (v.fabric || "").trim(),
      color: (v.color || "").trim(),
      stock: Number(v.stock || 0),
      sku: v.sku?.trim() || undefined,
    }));

    const payload = {
      title: values.title.trim(),
      slug: (values.slug || "").trim() ? toSlug(values.slug) : toSlug(values.title),
      description: values.description || "",
      fitNotes: values.fitNotes || "",
      priceCents,
      currency: "USD" as const,
      collections: (values.collectionsCsv || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: Boolean(values.isActive),
      images: values.images.map((i) => ({
        publicId: i.publicId,
        secureUrl: i.secureUrl,
        width: i.width,
        height: i.height,
        bytes: i.bytes,
        format: i.format,
        alt: i.alt || "",
      })),
      variants: safeVariants,
    };

    if (!payload.title) return setMsg("Title is required.");
    if (!payload.slug) return setMsg("Slug is required.");
    if (!payload.variants.every((v) => v.size && v.fabric && v.color)) return setMsg("Fill Size, Fabric, and Color for each option.");

    try {
      setSaving(true);
      const r = await fetch(submitTo, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || "Could not save");

      setMsg("Saved.");
      onSaved?.(j?.id);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const input = "mt-2 w-full rounded-2xl border px-4 py-3 text-lg";
  const textarea = "mt-2 w-full rounded-2xl border px-4 py-3 text-lg";
  const btn = "rounded-2xl bg-pt-orange hover:bg-pt-orange-hover px-6 py-3 text-lg text-white disabled:opacity-60";
  const ghost = "rounded-2xl border px-4 py-3 text-lg hover:bg-gray-50";

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-10">
      <div className="grid gap-6">
        <div>
          <label className="text-lg font-semibold">Title</label>
          <input className={input} {...form.register("title")} placeholder="Ankara Unisex Shirt" />
        </div>

        <div>
          <div className="text-lg font-semibold">Photos</div>
          <div className="mt-2 text-base text-gray-600">Add product photos.</div>
          <div className="mt-3">
            <ImageUploader value={images} onChange={(next) => form.setValue("images", next, { shouldDirty: true })} />
          </div>
        </div>

        <div>
          <label className="text-lg font-semibold">Price (USD)</label>
          <input className={input} {...form.register("priceDollars")} placeholder="120" />
        </div>

        <label className="flex items-center gap-3 text-lg">
          <input type="checkbox" className="h-5 w-5" {...form.register("isActive")} />
          Active
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="button" className={ghost} onClick={() => setShowMore((s) => !s)}>
            {showMore ? "Hide more" : "More (optional)"}
          </button>
          <button type="button" className={ghost} onClick={() => setShowOptions((s) => !s)}>
            {showOptions ? "Hide options" : "Options (optional)"}
          </button>
        </div>

        {showMore ? (
          <div className="grid gap-6 rounded-3xl border p-6">
            <div>
              <label className="text-lg font-semibold">Slug</label>
              <input className={input} {...form.register("slug")} placeholder="ankara-unisex-shirt" />
              <div className="mt-2 text-base text-gray-600">Leave blank to auto-make from title.</div>
            </div>

            <div>
              <label className="text-lg font-semibold">Description</label>
              <textarea className={textarea} rows={4} {...form.register("description")} />
            </div>

            <div>
              <label className="text-lg font-semibold">Fit notes</label>
              <textarea className={textarea} rows={3} {...form.register("fitNotes")} placeholder="True to size." />
            </div>

            <div>
              <label className="text-lg font-semibold">Collections</label>
              <input className={input} {...form.register("collectionsCsv")} placeholder="New Arrivals, Best Sellers" />
            </div>
          </div>
        ) : null}

        {showOptions ? (
          <div className="rounded-3xl border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Options</div>
                <div className="mt-1 text-base text-gray-600">Size, Fabric, Color, Stock</div>
              </div>

              <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-2xl bg-pt-orange hover:bg-pt-orange-hover px-5 py-3 text-lg text-white">
                <Plus className="h-5 w-5" />
                Add option
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border bg-white">
              <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-base font-semibold text-gray-700">
                <div className="col-span-3">Size</div>
                <div className="col-span-3">Fabric</div>
                <div className="col-span-3">Color</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y">
                {(variants || []).map((_, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3">
                    <input className="col-span-3 rounded-2xl border px-4 py-3 text-lg" {...form.register(`variants.${idx}.size` as const)} placeholder="M / 34" />
                    <input className="col-span-3 rounded-2xl border px-4 py-3 text-lg" {...form.register(`variants.${idx}.fabric` as const)} placeholder="Ankara" />
                    <input className="col-span-3 rounded-2xl border px-4 py-3 text-lg" {...form.register(`variants.${idx}.color` as const)} placeholder="Blue" />
                    <input
                      className="col-span-2 rounded-2xl border px-4 py-3 text-lg"
                      type="number"
                      min={0}
                      {...form.register(`variants.${idx}.stock` as const, { valueAsNumber: true })}
                    />
                    <button type="button" onClick={() => removeVariant(idx)} className="col-span-1 flex items-center justify-center rounded-2xl border hover:bg-gray-50">
                      <Trash2 className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-base text-gray-600">If you don't need options, you can ignore this.</div>
          </div>
        ) : null}

        {msg ? <div className="text-lg text-gray-800">{msg}</div> : null}

        <button disabled={saving} className={btn} type="submit">
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}