import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="font-semibold tracking-tight">
            Pami Threads — Admin
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-sm text-gray-700 hover:text-black">
              Products
            </Link>
            <Link href="/admin/orders" className="text-sm text-gray-700 hover:text-black">
              Orders
            </Link>
            <Link href="/admin/reviews" className="text-sm text-gray-700 hover:text-black">
              Reviews
            </Link>
            <Link href="/admin/analytics" className="text-sm text-gray-700 hover:text-black">
              Analytics
            </Link>

            <form action="/admin/api/logout" method="post">
              <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}