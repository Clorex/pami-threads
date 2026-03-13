import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-pt-green">Accounts are not required</h1>
      <p className="mt-3 text-sm text-gray-600">
        We keep checkout simple—no customer accounts. Order updates are sent by email.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="rounded-xl bg-pt-green px-5 py-3 text-sm font-semibold text-white hover:bg-pt-green-hover">
          Continue shopping
        </Link>
        <Link href="/faq" className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50">
          FAQ
        </Link>
      </div>
    </div>
  );
}