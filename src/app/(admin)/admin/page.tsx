import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Manage products and orders.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/products" className="rounded-2xl border bg-white p-5 hover:bg-gray-50">
          <div className="text-sm text-gray-600">Manage</div>
          <div className="mt-1 text-lg font-semibold">Products</div>
        </Link>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-gray-600">Coming next</div>
          <div className="mt-1 text-lg font-semibold">Orders</div>
        </div>
      </div>
    </div>
  );
}