"use client";

import { useMemo, useState } from "react";
import { compressForUpload, uploadToCloudinary } from "@/lib/cloudinary/client";

function moneyUSD(cents: number) {
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function StatusPill({ status }: { status: string }) {
  const { label, cls } = useMemo(() => {
    if (status === "payment_approved") return { label: "Approved", cls: "bg-green-100 text-green-800 border-green-200" };
    if (status === "payment_pending") return { label: "Pending approval", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { label: status, cls: "bg-gray-100 text-gray-800 border-gray-200" };
  }, [status]);

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

export function BankTransferClient({
  orderId,
  status,
  amountTotalCents,
  currency,
  proofUrl,
}: {
  orderId: string;
  status: string;
  amountTotalCents: number;
  currency: string;
  proofUrl: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function upload(file: File) {
    setMsg("");
    setBusy(true);
    try {
      const compressed = await compressForUpload(file);

      // 1) sign
      const r = await fetch("/api/payments/sign", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) throw new Error(j?.message || "Could not start upload");

      // 2) upload to cloudinary
      const uploaded = await uploadToCloudinary(compressed, j);

      // 3) save proof to order
      const r2 = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, publicId: uploaded.publicId, secureUrl: uploaded.secureUrl }),
      });
      const j2 = await r2.json().catch(() => ({}));
      if (!r2.ok || !j2?.ok) throw new Error(j2?.message || "Could not submit proof");

      setMsg("Payment proof uploaded. Waiting for admin approval.");
      window.location.reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-pt-green">Bank transfer checkout</h1>
        <StatusPill status={status} />
      </div>

      <p className="mt-3 text-sm text-gray-600">
        Total: <span className="font-semibold">{moneyUSD(amountTotalCents)}</span>
      </p>

      <div className="mt-8 rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-gray-900">Pay by bank transfer</div>
        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <div><span className="font-semibold">Bank:</span> UZA BANK</div>
          <div><span className="font-semibold">Account number:</span> 1234567890</div>
          <div><span className="font-semibold">Account name:</span> PAMI THREADS</div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Use your Order ID as reference if your bank app supports it: <span className="font-mono">{orderId}</span>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-gray-900">Upload payment screenshot</div>
        <p className="mt-2 text-sm text-gray-600">
          After transfer, upload a screenshot of your payment confirmation. Admin will review and approve.
        </p>

        {proofUrl ? (
          <div className="mt-4">
            <a className="text-sm font-semibold text-pt-orange underline underline-offset-4" href={proofUrl} target="_blank" rel="noreferrer">
              View uploaded screenshot
            </a>
          </div>
        ) : null}

        <div className="mt-5">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-pt-orange px-5 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover">
            {busy ? "Uploading..." : "I have made payment — Upload screenshot"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy || status === "payment_approved"}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) upload(f);
              }}
            />
          </label>
        </div>

        {msg ? <div className="mt-3 text-sm text-gray-700">{msg}</div> : null}
      </div>

      <div className="mt-6 text-sm">
        <a className="font-semibold text-gray-700 hover:text-pt-orange underline underline-offset-4" href="/orders">
          View your orders
        </a>
      </div>
    </div>
  );
}