import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-pt-green">No sign-in needed</h1>
      <p className="mt-3 text-sm text-gray-600">
        Pami Threads does not require customer accounts. You can shop and checkout without signing in.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="rounded-xl bg-pt-green px-5 py-3 text-sm font-semibold text-white hover:bg-pt-green-hover">
          Go to shop
        </Link>
        <Link href="/cart" className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50">
          View cart
        </Link>
      </div>
    </div>
  );
}