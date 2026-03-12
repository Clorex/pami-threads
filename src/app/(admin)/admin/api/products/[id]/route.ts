import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { deleteProduct, getProductById, updateProduct } from "@/lib/firebase";
import { toSlug } from "@/lib/store/slug";

const PatchBody = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  fitNotes: z.string().optional(),
  priceCents: z.number().int().positive().optional(),
  collections: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
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
    .min(1)
    .optional(),
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
    .min(1)
    .optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  await requireAdmin();
  const { id } = await ctx.params;

  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product });
}

export async function PATCH(req: Request, ctx: RouteContext) {
  await requireAdmin();
  const { id } = await ctx.params;

  const json = await req.json().catch(() => ({}));
  const body = PatchBody.parse(json);

  const patch: Record<string, unknown> = { ...body };
  if (typeof body.slug === "string") {
    patch.slug = toSlug(body.slug);
  }

  await updateProduct(id, patch as Partial<import("@/lib/firebase/schemas").ProductInput>);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  await requireAdmin();
  const { id } = await ctx.params;

  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}