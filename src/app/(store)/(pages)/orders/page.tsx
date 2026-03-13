import Link from "next/link";

export const revalidate = 0;

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-pt-green">Order updates by email</h1>
      <p className="mt-3 text-sm text-gray-600">
        We don’t use customer accounts. After checkout, you’ll receive order confirmation and updates via email.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="rounded-xl bg-pt-green px-5 py-3 text-sm font-semibold text-white hover:bg-pt-green-hover">
          Shop
        </Link>
        <Link href="/about" className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50">
          About us
        </Link>
      </div>
    </div>
  );
}