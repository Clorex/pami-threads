import Link from "next/link";

function moneyUSD(cents: number) {
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

export function SquareProductCard({
  slug,
  title,
  priceCents,
  imageUrl,
}: {
  slug: string;
  title: string;
  priceCents: number;
  imageUrl: string;
}) {
  const src = imageUrl || "/placeholder.svg";

  return (
    <Link
      href={`/product/${slug}`}
      className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      <div className="p-3">
        <div className="line-clamp-1 text-sm font-semibold text-gray-900">{title}</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">{moneyUSD(priceCents)}</div>
      </div>
    </Link>
  );
}