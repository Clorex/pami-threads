import { Suspense } from "react";
import { listActiveProducts } from "@/lib/firebase";
import { cldImageUrl } from "@/lib/cloudinary/url";
import { ShopClient } from "./ShopClient";

export const revalidate = 60;

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  imageUrl: string;
  variants: { fabric: string; color: string; size: string }[];
};

export default async function ShopPage() {
  const products = await listActiveProducts(120);

  const items: ShopProduct[] = products.map((p) => {
    const img = p.images?.[0];

    // Square to match square cards everywhere
    const imageUrl = img
      ? cldImageUrl((img as any).publicId || (img as any).secureUrl || "", {
          width: 900,
          height: 900,
          crop: "fill",
          quality: "auto",
          format: "auto",
        })
      : "/placeholder.svg";

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      priceCents: p.priceCents,
      imageUrl,
      variants: (p.variants || []).map((v) => ({
        fabric: v.fabric || "",
        color: v.color || "",
        size: v.size || "",
      })),
    };
  });

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-gray-600">
          Loading shop…
        </div>
      }
    >
      <ShopClient products={items} />
    </Suspense>
  );
}