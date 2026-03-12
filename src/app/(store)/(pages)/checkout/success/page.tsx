import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-pt-green">Payment successful</h1>
      <p className="mt-3 text-sm text-gray-600">
        Thank you for your order. YouÃ¢â‚¬â„¢ll receive an email confirmation shortly.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="rounded-xl bg-pt-green hover:bg-pt-green-hover px-5 py-3 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50"
        >
          My account
        </Link>
      </div>
    </div>
  );
}