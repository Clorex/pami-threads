import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { createProduct, listAllProductsAdmin } from "@/lib/firebase";
import { toSlug } from "@/lib/store/slug";
import type { ProductInput } from "@/lib/firebase/schemas";

const CreateBody = z.object({
  title: z.string().min(1),
  slug: z.string().optional().default(""),
  description: z.string().optional().default(""),
  fitNotes: z.string().optional().default(""),
  priceCents: z.number().int().positive(),
  currency: z.literal("USD").optional().default("USD"),
  collections: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  images: z
    .array(
      z.object({
        publicId: z.string().min(1),
        secureUrl: z.string().url(),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        bytes: z.number().int().nonnegative(),
        format: z.string().min(1),
        alt: z.string().optional().default(""),
      })
    )
    .min(1),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        fabric: z.string().min(1),
        color: z.string().min(1),
        stock: z.number().int().nonnegative().optional().default(0),
        sku: z.string().optional(),
      })
    )
    .min(1),
});

export async function GET() {
  await requireAdmin();
  const products = await listAllProductsAdmin(200);
  return NextResponse.json({ ok: true, products });
}

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => ({}));
  const body = CreateBody.parse(json);

  const slug = body.slug.trim() ? toSlug(body.slug) : toSlug(body.title);

  const input: ProductInput = {
    title: body.title,
    slug,
    description: body.description,
    fitNotes: body.fitNotes || "",
    priceCents: body.priceCents,
    currency: "USD",
    collections: body.collections.map((s) => s.trim()).filter(Boolean),
    isActive: body.isActive,
    images: body.images,
    variants: body.variants,
  };

  const created = await createProduct(input);
  return NextResponse.json({ ok: true, id: created.id });
}