import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  HeartHandshake,
  Package,
  Ruler,
  Shirt,
  Sparkles,
  Target,
} from "lucide-react";

const IMAGES = {
  hero: "/about/about1.jpg",
  storyA: "/about/about2.jpg",
  storyB: "/about/about3.jpg",
  mission: "/about/about4.jpg",
  cta: "/about/about5.jpg",
  craft: "/about/about6.jpg",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white">
      {children}
    </span>
  );
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/10 px-5 py-4 text-center text-sm font-semibold text-white">
      {children}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
        {icon}
      </div>
      <div className="mt-4 text-lg font-extrabold tracking-tight">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/85">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-pt-green text-sm font-extrabold text-white">
          {n}
        </div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{body}</p>
    </div>
  );
}

function SideBySideImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative h-[220px] sm:h-[240px] lg:h-[260px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

export default function AboutPage() {
  const ig = (process.env.NEXT_PUBLIC_INSTAGRAM_URL || "").trim();

  return (
    <div className="bg-white">
      {/* 1) HERO */}
      <section className="relative">
        <div className="relative h-[260px] sm:h-[320px]">
          <Image
            src={IMAGES.hero}
            alt="Pami Threads - About"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-pt-green/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 text-white">
            <div className="text-xs text-white/85">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>About</span>
            </div>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              About Pami Threads
            </h1>

            <p className="mt-3 max-w-3xl text-sm text-white/90 sm:text-base">
              Pami Threads is a unisex clothing brand bringing Nigerian heritage
              fabrics into a clean, bold, modern Afro-fusion style. We blend
              vibrant textiles like Ankara, Adire (including handmade Adire),
              and Asooke with wearable silhouettes and everyday comfort—so you
              can stand out without trying too hard.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Pill>Australia-based • Nigerian-inspired • Unisex</Pill>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pt-orange px-5 py-2.5 text-xs font-semibold text-white hover:bg-pt-orange-hover"
              >
                Shop the latest <ArrowRight className="h-4 w-4" />
              </Link>

              {ig ? (
                <a
                  href={ig}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Contact us on Instagram
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2) OUR STORY (two small images side-by-side + text) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Images */}
          <div>
            <div className="inline-flex items-center gap-3 rounded-2xl bg-pt-green px-5 py-4 text-white shadow-sm">
              <div className="text-3xl font-extrabold leading-none">5+</div>
              <div className="text-xs font-semibold leading-tight text-white/90">
                Fabric types
                <br />
                we work with
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SideBySideImage src={IMAGES.storyA} alt="Pami Threads story image 1" />
              <SideBySideImage src={IMAGES.storyB} alt="Pami Threads story image 2" />
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-pt-green">
              OUR STORY
            </div>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
              Nigerian heritage—made for today
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-6 text-gray-600">
              <p>
                Pami Threads was created for people who love culture, colour, and
                confident style—but still want pieces that feel modern and easy
                to wear. Our designs are rooted in Nigerian heritage fabrics and
                reworked into clean, bold silhouettes that fit into everyday
                life.
              </p>
              <p>
                We keep our drops intentional: quality fabrics, thoughtful
                design details, and pieces you can dress up or down. Whether
                it’s a statement trouser or a simple set, the goal is the
                same—authentic fabric, elevated finish, and a fit you’ll keep
                reaching for.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">
                Small-batch pieces • Unisex fits • Worldwide shipping (options vary)
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Need help choosing sizing? Check the size guide or message us on
                Instagram.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/size-guide"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  <Ruler className="h-4 w-4" />
                  Size guide
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  FAQ <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3) STATS STRIP */}
      <section className="bg-pt-green">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill>Unisex fits</StatPill>
            <StatPill>Heritage fabrics</StatPill>
            <StatPill>Small-batch drops</StatPill>
            <StatPill>Worldwide shipping</StatPill>
          </div>
        </div>
      </section>

      {/* 4) MISSION / VISION / VALUES */}
      <section className="bg-gradient-to-br from-pt-green via-pt-green to-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-[0.16em] text-white/85">
              WHAT GUIDES US
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              The principles that guide us
            </h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <InfoCard
              icon={<Target className="h-5 w-5" />}
              title="Our Mission"
              body="To create unisex pieces that celebrate Nigerian heritage fabrics through modern, wearable design—bold enough to stand out and effortless enough for everyday."
            />
            <InfoCard
              icon={<Eye className="h-5 w-5" />}
              title="Our Vision"
              body="To be a go-to Afro-fusion brand known for authentic textiles, elevated finishing, and inclusive styling that feels global."
            />
            <InfoCard
              icon={<HeartHandshake className="h-5 w-5" />}
              title="Our Values"
              body="Authenticity, craftsmanship, and confidence. We respect the culture behind the cloth, and we design with intention—fit, comfort, and detail matter."
            />
          </div>
        </div>
      </section>

      {/* 5) CRAFT & FABRICS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-pt-green">
              CRAFT & FABRICS
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
              Fabrics with meaning
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              We choose fabrics that carry history and personality. From the
              energy of Ankara to the depth of Adire patterns, every textile
              brings its own story—and we build modern silhouettes around it.
            </p>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">
                Fabrics we use
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                {["Ankara", "Adire", "Handmade Adire", "Asooke", "Linen"].map(
                  (x) => (
                    <li key={x} className="rounded-2xl bg-gray-50 px-4 py-3">
                      {x}
                    </li>
                  )
                )}
              </ul>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 text-pt-green" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Easy to style
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Bold prints and textures that don’t need heavy styling.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-pt-green" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Modern finish
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Expressive, clean, and wearable—not costume.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* craft image smaller + constrained */}
          <div className="relative h-[260px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <Image
              src={IMAGES.craft}
              alt="Pami Threads fabrics and craft"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6) PROCESS */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-[0.16em] text-pt-green">
              OUR PROCESS
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
              How our pieces come together
            </h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Step
              n="1"
              title="Fabric selection"
              body="We source heritage-inspired fabrics that match the vibe of the collection."
            />
            <Step
              n="2"
              title="Design & pattern"
              body="Clean silhouettes, unisex fit, practical details."
            />
            <Step
              n="3"
              title="Cut & sew"
              body="Crafted with care for neat finishing and strong seams."
            />
            <Step
              n="4"
              title="Quality check"
              body="Fit, finish, and fabric consistency are inspected before release."
            />
            <Step
              n="5"
              title="Pack & ship"
              body="Orders are packed carefully and shipped with tracking where available."
            />
          </div>
        </div>
      </section>

      {/* 7) WHAT WE MAKE RIGHT NOW */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold tracking-[0.16em] text-pt-green">
              RIGHT NOW
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
              What we make (right now)
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Right now, our focus is trousers—different cuts, different fabrics,
              different vibes. Each release is designed to be styled multiple
              ways: casual, smart, or statement.
            </p>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Shirt className="h-4 w-4 text-pt-green" />
                Current focus
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                <li>Ankara trousers</li>
                <li>Adire trousers</li>
                <li>Handmade Adire trousers</li>
                <li>Linen trousers</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">
                Quick links
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  Shop <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/size-guide"
                  className="inline-flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  Size guide <Ruler className="h-4 w-4" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  FAQ <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  Cart <Package className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Shipping</div>
              <p className="mt-2 text-sm text-gray-600">
                We ship worldwide (options vary by location).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="relative overflow-hidden">
        <div className="relative h-[240px] sm:h-[280px]">
          <Image
            src={IMAGES.cta}
            alt="Shop Pami Threads"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-pt-green/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to find your next statement piece?
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
              Explore the latest drop, check the size guide, or message us on
              Instagram—we’ll help you choose the right fit.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pt-orange px-6 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>

              {ig ? (
                <a
                  href={ig}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Contact on Instagram
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}