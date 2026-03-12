import Link from "next/link";
import { requireCustomer } from "@/lib/auth/session";
import { listOrdersForCustomer, type OrderWithId } from "@/lib/firebase/orders.repo";

export const revalidate = 0;

function money(cents: number, currency: string) {
  const c = (currency || "usd").toUpperCase();
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(v);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "payment_pending") return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Pending</span>;
  if (status === "payment_approved") return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Approved</span>;
  return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">{status}</span>;
}

export default async function OrdersPage() {
  const s = await requireCustomer();
  const orders: OrderWithId[] = await listOrdersForCustomer({ uid: s.uid, email: s.email }, 50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pt-green">My orders</h1>
          <p className="mt-1 text-sm text-gray-600">{orders.length} order(s)</p>
        </div>
        <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-pt-orange">
          Continue shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-white p-10 text-center text-sm text-gray-600">
          No orders yet.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold">Order</div>
                  <div className="mt-1 text-sm text-gray-700">{o.id}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <span>Status:</span> <StatusBadge status={o.status} />
                  </div>

                  {o.status === "payment_pending" ? (
                    <div className="mt-3">
                      <Link
                        className="text-sm font-semibold text-pt-orange underline underline-offset-4"
                        href={`/checkout/bank-transfer?orderId=${encodeURIComponent(o.id)}`}
                      >
                        Upload / view payment proof
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="text-sm font-semibold">{money(o.amountTotalCents, o.currency)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}