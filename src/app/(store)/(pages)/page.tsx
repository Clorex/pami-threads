import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  Crown,
  Leaf,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Waves,
} from "lucide-react";

import { listActiveProducts } from "@/lib/firebase";
import { cldImageUrl } from "@/lib/cloudinary/url";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

const STATIC = {
  // Your hero image is transparent; we now render it directly on the hero background (no white card).
  hero: "/hero.png",

  // Reusing your About images as safe defaults (you can replace later with /public/home/... images if you want).
  promo1: "/about/about2.jpg",
  promo2: "/about/about3.jpg",
  about: "/about/about4.jpg",
};

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <div className="text-xs font-semibold tracking-[0.16em] text-pt-green">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{desc}</p>
      ) : null}
    </div>
  );
}

function Pill({
  children,
  variant = "light",
}: {
  children: React.ReactNode;
  variant?: "light" | "dark";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold",
        variant === "light"
          ? "border border-gray-200 bg-white text-gray-900"
          : "bg-white/15 text-white"
      )}
    >
      {children}
    </span>
  );
}

function FabricBubble({
  name,
  href,
  Icon,
  count,
}: {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center rounded-3xl border border-gray-200 bg-white px-5 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-pt-orange/60 hover:shadow-md"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pt-green/10 text-pt-green transition group-hover:bg-pt-orange/10 group-hover:text-pt-orange">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-3 text-sm font-extrabold text-gray-900">{name}</div>
      <div className="mt-1 text-xs font-semibold text-gray-500">
        {count} {count === 1 ? "product" : "products"}
      </div>
    </Link>
  );
}

function PromoCard({
  tag,
  title,
  desc,
  href,
  imageSrc,
  tint = "green",
}: {
  tag: string;
  title: string;
  desc: string;
  href: string;
  imageSrc: string;
  tint?: "green" | "orange";
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-[200px] sm:h-[220px]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
        <div
          className={clsx(
            "absolute inset-0",
            tint === "green"
              ? "bg-gradient-to-r from-pt-green/80 via-pt-green/30 to-transparent"
              : "bg-gradient-to-r from-pt-orange/80 via-pt-orange/25 to-transparent"
          )}
        />
      </div>

      <div className="relative -mt-[200px] sm:-mt-[220px] p-6 text-white">
        <Pill variant="dark">{tag}</Pill>
        <div className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </div>
        <p className="mt-2 max-w-md text-sm text-white/90">{desc}</p>

        <div className="mt-5">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const products = await listActiveProducts(24);

  const newArrivals = products.slice(0, 8);
  const bestSellers = products
    .filter((p) => (p.collections || []).some((c) => c.toLowerCase().includes("best")))
    .slice(0, 8);

  function thumbUrl(p: (typeof products)[number]) {
    const img = p.images?.[0];
    if (!img) return "/placeholder.svg";

    return cldImageUrl((img as any).publicId || (img as any).secureUrl || "", {
      width: 900,
      height: 900,
      crop: "fill",
      quality: "auto",
      format: "auto",
    });
  }

  function badgeFor(p: (typeof products)[number]) {
    const v = (p.variants || []).find((x) => (x.fabric || "").trim());
    return (v?.fabric || "").trim();
  }

  // Fabric counts (for the bubble row)
  const fabricCount = new Map<string, number>();
  products.forEach((p) => {
    const set = new Set(
      (p.variants || []).map((v) => (v.fabric || "").trim()).filter(Boolean)
    );
    set.forEach((f) => fabricCount.set(f, (fabricCount.get(f) || 0) + 1));
  });

  const fabrics = [
    { name: "Ankara", href: "/shop?fabric=Ankara", Icon: Sparkles },
    { name: "Adire", href: "/shop?fabric=Adire", Icon: Waves },
    { name: "Asooke", href: "/shop?fabric=Asooke", Icon: Crown },
    { name: "Linen", href: "/shop?fabric=Linen", Icon: Leaf },
  ].map((x) => ({ ...x, count: fabricCount.get(x.name) || 0 }));

  const features = [
    {
      title: "Handmade & Authentic",
      desc: "Crafted pieces with bold prints and clean finishing.",
      Icon: Scissors,
      accent: "border-pt-green",
      iconBg: "bg-pt-green/10",
    },
    {
      title: "African Heritage",
      desc: "Celebrating Ankara, Adire, and timeless cultural patterns.",
      Icon: Sparkles,
      accent: "border-pt-orange",
      iconBg: "bg-pt-orange/10",
    },
    {
      title: "Unisex & Inclusive",
      desc: "Modern Afro-fusion designs made for everyone.",
      Icon: Users,
      accent: "border-pt-red",
      iconBg: "bg-pt-red/10",
    },
    {
      title: "Quality Craftsmanship",
      desc: "Elegant but comfortable — stylish for daily wear.",
      Icon: ShieldCheck,
      accent: "border-pt-green",
      iconBg: "bg-pt-green/10",
    },
  ];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-pt-green/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(240,140,26,0.12),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(63,95,43,0.12),transparent_55%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-14">
          {/* Left */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{products.length}+ pieces available</Pill>
              <Pill>Unisex • Afro-fusion • Handmade</Pill>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              The Ultimate Afro-modern
              <span className="text-pt-green"> Shopping</span> Destination
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Bold African fabrics, modern silhouettes, and clean finishing.
              Designed to feel confident, wearable, and unmistakably you.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pt-orange px-6 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
              >
                Learn about us
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pt-green/10 text-pt-green">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-900">
                    Worldwide shipping
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    Delivered with care
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pt-orange/10 text-pt-orange">
                  <Ruler className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-900">
                    Size guide
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    Sizing made simple
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right (NO white card behind transparent PNG) */}
          <div className="mx-auto w-full max-w-lg">
            <div className="relative h-[420px] sm:h-[520px]">
              <Image
                src={STATIC.hero}
                alt="Pami Threads hero"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-contain drop-shadow-2xl"
              />
            </div>

            
          </div>
        </div>
      </section>

      {/* SHOP BY FABRIC */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading
          eyebrow="SHOP BY"
          title="Shop by fabrics"
          desc="Choose your vibe. Start with the fabric you love most."
        />

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fabrics.map((f) => (
            <FabricBubble
              key={f.name}
              name={f.name}
              href={f.href}
              Icon={f.Icon}
              count={f.count}
            />
          ))}
        </div>
      </section>

      {/* PROMO CARDS */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <PromoCard
            tag="Signature fabrics"
            title="Bold statement trousers"
            desc="Clean silhouettes with heritage prints — easy to dress up or down."
            href="/shop"
            imageSrc={STATIC.promo1}
            tint="green"
          />
          <PromoCard
            tag="Limited drops"
            title="Modern Afro-fusion essentials"
            desc="Small-batch pieces with standout details and everyday comfort."
            href="/shop"
            imageSrc={STATIC.promo2}
            tint="orange"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionHeading
          eyebrow="WHY US"
          title="What makes Pami Threads special"
          desc="African heritage fabrics, modern unisex style, and handmade authenticity — designed to feel bold and wearable."
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, desc, Icon, accent, iconBg }) => (
            <div
              key={title}
              className={clsx(
                "rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md",
                "border-t-4",
                accent
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx("rounded-xl p-2", iconBg)}>
                  <Icon className="h-5 w-5 text-gray-900" />
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {title}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title="New arrivals" desc="Fresh pieces added recently." />
          <Link
            href="/shop"
            className="text-sm font-semibold text-gray-700 hover:text-pt-orange"
          >
            View all
          </Link>
        </div>

        {newArrivals.length ? (
          <div className="mt-6 grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {newArrivals.map((p) => (
              <div key={p.id} className="w-full max-w-[220px]">
                <ProductCard
                  slug={p.slug}
                  title={p.title}
                  priceCents={p.priceCents}
                  imageUrl={thumbUrl(p)}
                  badge={badgeFor(p)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-sm text-gray-600">
            No products yet. Add products in Admin → Products.
          </div>
        )}
      </section>

      {/* ABOUT / STATS */}
      <section className="bg-pt-green/5 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative mx-auto w-full max-w-lg">
              <div className="relative h-[360px] overflow-hidden rounded-[999px] border border-gray-200 bg-white shadow-sm sm:h-[420px]">
                <Image
                  src={STATIC.about}
                  alt="About Pami Threads"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 hidden rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:block">
                <div className="text-2xl font-extrabold text-pt-green">
                  Unisex
                </div>
                <div className="text-xs font-semibold text-gray-500">
                  Designed for everyone
                </div>
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow="ABOUT US"
                title="Delivering heritage fabrics with a modern finish"
                desc="We blend Nigerian-inspired textiles with clean silhouettes and everyday comfort — so you can wear culture confidently, day to day."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-xl font-extrabold text-gray-900">5+</div>
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    Fabric types
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-xl font-extrabold text-gray-900">
                    Small-batch
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    Intentional drops
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-xl font-extrabold text-gray-900">
                    Worldwide
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    Shipping options
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-xl bg-pt-green px-6 py-3 text-sm font-semibold text-white hover:bg-pt-green-hover"
                >
                  Read our story
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  Shop now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title="Best sellers" desc="Customer favorites." />
          <Link
            href="/shop"
            className="text-sm font-semibold text-gray-700 hover:text-pt-orange"
          >
            View all
          </Link>
        </div>

        {bestSellers.length ? (
          <div className="mt-6 grid grid-flow-col auto-cols-[75%] gap-4 overflow-x-auto pb-2 pr-4 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <div key={p.id}>
                <ProductCard
                  slug={p.slug}
                  title={p.title}
                  priceCents={p.priceCents}
                  imageUrl={thumbUrl(p)}
                  badge={badgeFor(p)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-sm text-gray-600">
            Mark products with a collection containing “best” (e.g. “Best Sellers”) to show them here.
          </div>
        )}
      </section>

      {/* CTA / Newsletter */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="overflow-hidden rounded-3xl border bg-gray-900 text-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Ready to get the next drop?
                </div>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Get updates on new arrivals and limited releases.
                </p>

                <div className="mt-5 flex max-w-md flex-col gap-3 sm:flex-row">
                  <input
                    placeholder="Your email"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-pt-orange/40"
                  />
                  <button
                    type="button"
                    className="rounded-xl bg-pt-orange px-6 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-extrabold">Need sizing help?</div>
                <p className="mt-2 text-sm text-white/80">
                  Use the size guide to pick the right fit quickly.
                </p>
                <div className="mt-4">
                  <Link
                    href="/size-guide"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-pt-orange"
                  >
                    View size guide <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="h-1.5 bg-gradient-to-r from-pt-green via-pt-orange to-pt-red" />
        </div>
      </section>
    </div>
  );
}