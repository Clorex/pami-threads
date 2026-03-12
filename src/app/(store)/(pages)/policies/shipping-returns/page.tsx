import Link from "next/link";

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-pt-green">Shipping & Returns</h1>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Shipping</h2>
          <p className="mt-2 text-sm text-gray-600">
            We ship worldwide. Shipping options, cost, and delivery time vary by location and carrier.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Worldwide shipping (varies by location)</li>
            <li>Tracking shared when available</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Returns & Exchanges</h2>
          <p className="mt-2 text-sm text-gray-600">
            We currently offer exchanges only (for example: size exchange), subject to stock availability.
            If your order arrives incorrect or damaged, contact us and we’ll help quickly.
          </p>

          <div className="mt-4">
            <Link href="/about" className="text-sm font-semibold text-gray-700 hover:text-pt-orange underline underline-offset-4">
              Contact via Instagram (About page)
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}