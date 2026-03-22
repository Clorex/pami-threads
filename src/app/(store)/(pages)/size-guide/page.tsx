import Link from "next/link";

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-pt-green">Size Guide</h1>
          <p className="mt-3 text-sm text-gray-600">
            Use this guide for trousers. We include both letter sizes and waist sizes (inches + cm).
          </p>
        </div>
        <Link href="/shop" className="text-sm font-semibold text-gray-700 hover:text-pt-orange">
          Back to shop
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="text-sm font-semibold text-gray-900">Fit notes</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Unisex fit: choose by waist size first.</li>
          <li>If you are between sizes, size up for comfort.</li>
          <li>Fabric can affect feel and drape (linen fits differently from Ankara).</li>
        </ul>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
        <div className="border-b bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-900">
          Trousers sizing (guide)
        </div>

        <div className="p-5 overflow-x-auto">
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-4">Letter</th>
                <th className="py-2 pr-4">Waist (in)</th>
                <th className="py-2 pr-4">Waist (cm)</th>
                <th className="py-2 pr-4">Hip (in)</th>
                <th className="py-2 pr-4">Hip (cm)</th>
                <th className="py-2 pr-4">Inseam (in)</th>
                <th className="py-2 pr-4">Inseam (cm)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                ["S", "28–30", "71–76", "36–38", "91–97", "30–32", "76–81"],
                ["M", "31–33", "79–84", "39–41", "99–104", "31–33", "79–84"],
                ["L", "34–36", "86–91", "42–44", "107–112", "31–33", "79–84"],
                ["XL", "37–40", "94–102", "45–48", "114–122", "32–34", "81–86"],
              ].map((row) => (
                <tr key={row[0]} className="border-t">
                  {row.map((cell, i) => (
                    <td key={i} className="py-3 pr-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border bg-white p-6">
        <div className="text-sm font-semibold text-gray-900">Need help choosing?</div>
        <p className="mt-2 text-sm text-gray-600">
          Check the FAQ or contact us via Instagram (About page).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/faq" className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:border-pt-orange hover:text-pt-orange">
            FAQ
          </Link>
          <Link href="/about" className="rounded-xl bg-pt-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-pt-green-hover">
            About (Contact)
          </Link>
        </div>
      </div>
    </div>
  );
}