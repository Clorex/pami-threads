import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getAnalyticsStats, type AnalyticsRange } from "@/lib/firebase/analytics.repo";

export const revalidate = 0;

function moneyUSD(cents: number) {
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function pickRange(input: string | undefined): AnalyticsRange {
  if (input === "1d" || input === "7d" || input === "30d") return input;
  return "7d";
}

function RangeTabs({ current }: { current: AnalyticsRange }) {
  const tabs: { key: AnalyticsRange; label: string }[] = [
    { key: "1d", label: "Last day" },
    { key: "7d", label: "Last 7 days" },
    { key: "30d", label: "Last 30 days" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={`/admin/analytics?range=${t.key}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${
            current === t.key ? "border-pt-red bg-pt-red text-white" : "hover:bg-gray-50"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const range = pickRange(sp.range);

  const stats = await getAnalyticsStats(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">Quick numbers for your store.</p>
        </div>

        <RangeTabs current={range} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Orders</div>
          <div className="mt-2 text-3xl font-semibold">{stats.ordersCount}</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Revenue</div>
          <div className="mt-2 text-3xl font-semibold">{moneyUSD(stats.revenueCents)}</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">New customers</div>
          <div className="mt-2 text-3xl font-semibold">{stats.newCustomersCount}</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery progress</div>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <div>Paid/Processing: <span className="font-semibold">{stats.paidCount}</span></div>
            <div>Shipped: <span className="font-semibold">{stats.shippedCount}</span></div>
            <div>Delivered: <span className="font-semibold">{stats.deliveredCount}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 text-sm text-gray-600">
        Tip: These numbers update as new orders and customers are created.
      </div>
    </div>
  );
}