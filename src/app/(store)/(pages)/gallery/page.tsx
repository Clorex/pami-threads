import { listAllProductsAdmin } from "@/lib/firebase/products.repo";
import { cldImageUrl } from "@/lib/cloudinary/url";
import { GalleryClient, type GalleryItem } from "./GalleryClient";

export const revalidate = 60;

function cleanList(v: unknown): string[] {
  return Array.from(
    new Set(
      (Array.isArray(v) ? v : [])
        .map((x) => String(x || "").trim())
        .filter(Boolean)
    )
  );
}

export default async function GalleryPage() {
  // All products (active + inactive + draft). Increase if you expect more.
  const products = await listAllProductsAdmin(500);

  const items: GalleryItem[] = products.map((p) => {
    const img = (p.images?.[0] as any) || null;

    const imageUrl = img
      ? cldImageUrl(img.publicId || img.secureUrl || "", {
          width: 1400,
          height: 1800,
          crop: "fill",
          quality: "auto",
          format: "auto",
        })
      : "/placeholder.svg";

    const collections = cleanList((p as any).collections);
    const fabrics = cleanList((p as any).variants?.map((v: any) => v?.fabric));

    return {
      id: p.id,
      slug: p.slug,
      title: p.title || "Untitled",
      imageUrl,
      collections,
      fabrics,
      // infer draft/inactive if isActive is false/empty
      isActive: Boolean((p as any).isActive),
    };
  });

  return <GalleryClient items={items} />;
}