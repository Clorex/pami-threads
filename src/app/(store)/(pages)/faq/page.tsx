import Link from "next/link";

const FAQ = [
  { q: "Do you ship worldwide?", a: "Yes. We ship worldwide. Shipping options and delivery times vary by location and carrier." },
  { q: "How long does delivery take?", a: "Delivery time depends on your location and carrier. Any tracking available will be shared after shipment." },
  { q: "Can I return or exchange?", a: "We currently offer exchanges only (for example: size exchange), subject to stock availability. See Shipping & Returns for details." },
  { q: "How do I choose my size?", a: "Use the Size Guide (letters + waist sizes). If you’re between sizes, we generally recommend sizing up for comfort." },
  { q: "How do I care for Ankara/Adire fabrics?", a: "Gentle wash (cold water) is recommended. Avoid harsh bleaching. Air dry when possible." },
  { q: "Do you offer custom orders?", a: "Custom requests may be available depending on capacity. Contact us via Instagram (About page)." },
  { q: "Do you offer wholesale/bulk orders?", a: "Yes for select pieces. Contact us via Instagram with quantities, timeline, and destination." },
  { q: "What payment methods do you accept?", a: "Payment methods depend on checkout configuration. If checkout accepts it, it’s supported." },
  { q: "How do I track my order?", a: "If tracking is available, it will be shared after your order ships. You can also check your Orders page after signing in." },
  { q: "What does “unisex fit” mean?", a: "Our styles are designed to be worn by anyone. Check size guide + fit notes on each product." },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-pt-green">FAQ</h1>
        <Link href="/policies/shipping-returns" className="text-sm font-semibold text-gray-700 hover:text-pt-orange">
          Shipping & Returns
        </Link>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        This is a starter FAQ template. You can expand it anytime.
      </p>

      <div className="mt-8 space-y-3">
        {FAQ.map((x) => (
          <details key={x.q} className="rounded-2xl border bg-white p-5">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900">{x.q}</summary>
            <p className="mt-3 text-sm text-gray-600">{x.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}