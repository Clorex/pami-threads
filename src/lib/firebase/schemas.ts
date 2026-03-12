import { z } from "zod";

export const MoneyCurrencySchema = z.literal("USD");

export const ProductImageSchema = z.object({
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().nonnegative(),
  format: z.string().min(1),
  alt: z.string().default(""),
});

export const ProductVariantSchema = z.object({
  size: z.string().min(1),
  fabric: z.string().min(1),
  color: z.string().min(1),
  stock: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
});

export const ProductSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().default(""),
  fitNotes: z.string().default(""),
  priceCents: z.number().int().positive(),
  currency: MoneyCurrencySchema.default("USD"),
  collections: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().default(true),
  images: z.array(ProductImageSchema).min(1),
  variants: z.array(ProductVariantSchema).min(1),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const ReviewSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).default(""),
  isApproved: z.boolean().default(true),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;