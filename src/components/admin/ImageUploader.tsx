/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import {
  compressForUpload,
  uploadToCloudinary,
  type UploadedImage,
  type SignedUpload,
} from "@/lib/cloudinary/client";
import { Plus, X, Loader2 } from "lucide-react";

export type ProductImage = UploadedImage & { alt?: string };

/**
 * Asks our backend to sign a Cloudinary upload.
 * Only admins can call this (protected by middleware).
 */
async function getSignedUpload(): Promise<SignedUpload> {
  const r = await fetch("/admin/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.ok) throw new Error("Could not start upload");
  return {
    cloudName: j.cloudName,
    apiKey: j.apiKey,
    timestamp: j.timestamp,
    folder: j.folder,
    signature: j.signature,
  };
}

/**
 * Tile-grid image uploader.
 * - Shows existing images as square tiles
 * - Last tile is a "+" button to add more
 * - Each tile has an X to remove
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: ProductImage[];
  onChange: (next: ProductImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick() {
    setError("");
    inputRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setBusy(true);

      // Step 1: compress image client-side (target ~350KB, max 1600px, webp)
      const compressed = await compressForUpload(file);

      // Step 2: get signed params from our API
      const signed = await getSignedUpload();

      // Step 3: upload directly to Cloudinary
      const uploaded = await uploadToCloudinary(compressed, signed);

      // Step 4: add to list
      onChange([...(value || []), { ...uploaded, alt: "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function removeAt(idx: number) {
    const img = value[idx];
    const next = value.filter((_, i) => i !== idx);
    onChange(next);

    // Best-effort: delete from Cloudinary so it doesn't use storage
    fetch("/admin/api/cloudinary/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: img.publicId }),
    }).catch(() => {});
  }

  return (
    <div>
      {/* Tile grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {/* Existing image tiles */}
        {(value || []).map((img, idx) => (
          <div
            key={img.publicId}
            className="relative aspect-square overflow-hidden rounded-2xl border bg-white"
          >
            <img
              src={img.secureUrl}
              alt={img.alt || "Product image"}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add tile (the "+" button) */}
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed bg-white hover:bg-gray-50 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <Plus className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <div className="mt-2 text-xs text-gray-500">
        Images are compressed before upload to save storage.
      </div>
    </div>
  );
}