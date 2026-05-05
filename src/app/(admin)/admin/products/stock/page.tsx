import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAllProductsAdmin } from "@/lib/firebase";

export const revalidate = 0;

function money(cents: number, currency?: string) {
  const c = (currency || "usd").toUpperCase();
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(v);
}

function totalStock(p: any) {
  const vs = Array.isArray(p?.variants) ? p.variants : [];
  return vs.reduce((sum: number, v: any) => sum + Number(v?.stock || 0), 0);
}

function inStockVariantsCount(p: any) {
  const vs = Array.isArray(p?.variants) ? p.variants : [];
  return vs.filter((v: any) => Number(v?.stock || 0) > 0).length;
}

function Row({ p }: { p: any }) {
  const stock = totalStock(p);
  const inVars = inStockVariantsCount(p);
  const allVars = Array.isArray(p?.variants) ? p.variants.length : 0;
  const soldOut = stock <= 0;

  return (
    <div className="flex flex-col gap-3 rounded-3xl border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xl font-semibold truncate">{p?.title || "Untitled"}</div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${soldOut ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
            {soldOut ? "Sold out" : "In stock"}
          </span>
        </div>

        <div className="mt-2 text-base text-gray-700">
          Price: <span className="font-semibold">{money(p?.priceCents || 0, p?.currency || "USD")}</span>
          {"  "} | Stock: <span className="font-semibold">{stock}</span>
          {"  "} | Options in stock: <span className="font-semibold">{inVars}</span>/<span className="font-semibold">{allVars}</span>
        </div>

        {p?.slug ? (
          <div className="mt-1 text-sm text-gray-500 break-all">/product/{p.slug}</div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link className="rounded-2xl border px-4 py-2 text-base hover:bg-gray-50" href={`/admin/products/${p.id}/edit`}>
          Edit
        </Link>

        {p?.slug ? (
          <a
            className="rounded-2xl border px-4 py-2 text-base hover:bg-gray-50"
            href={`/product/${p.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            View
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default async function AdminProductStockPage() {
  await requireAdmin();

  const products: any[] = await listAllProductsAdmin(1000);
  const inStock = products.filter((p) => totalStock(p) > 0);
  const soldOut = products.filter((p) => totalStock(p) <= 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Stock</h1>
          <div className="mt-2 text-base text-gray-600">
            In stock: <span className="font-semibold">{inStock.length}</span> {"  "}
            Sold out: <span className="font-semibold">{soldOut.length}</span>
          </div>
        </div>

        <Link className="rounded-2xl border px-4 py-2 text-base hover:bg-gray-50" href="/admin/products">
          Back
        </Link>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <div className="text-2xl font-semibold">In stock</div>
          {inStock.length ? inStock.map((p) => <Row key={p.id} p={p} />) : <div className="text-base text-gray-600">None.</div>}
        </div>

        <div className="space-y-4">
          <div className="text-2xl font-semibold">Sold out</div>
          {soldOut.length ? soldOut.map((p) => <Row key={p.id} p={p} />) : <div className="text-base text-gray-600">None.</div>}
        </div>
      </div>
    </div>
  );
}