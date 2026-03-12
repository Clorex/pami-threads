import { requireAdmin } from "@/lib/auth/session";
import { listAllReviewsAdmin, type ReviewWithId } from "@/lib/firebase/reviews.repo";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews: ReviewWithId[] = await listAllReviewsAdmin(300);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="mt-1 text-sm text-gray-600">Approve, hide, or delete customer reviews.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Product</div>
          <div className="col-span-1">Stars</div>
          <div className="col-span-4">Text</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y">
          {reviews.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3">
              <div className="col-span-3">
                <div className="text-sm font-semibold">{r.userEmail || "—"}</div>
                <div className="mt-1 text-xs text-gray-500">{r.userId}</div>
              </div>

              <div className="col-span-2">
                <div className="text-sm font-semibold">{r.productId}</div>
                <div className="mt-1 text-xs">
                  <span className={r.isApproved ? "text-green-700" : "text-gray-500"}>
                    {r.isApproved ? "Approved" : "Hidden / Pending"}
                  </span>
                </div>
              </div>

              <div className="col-span-1 text-sm font-semibold">{r.rating}</div>

              <div className="col-span-4 text-sm text-gray-700 whitespace-pre-line">
                {r.text || <span className="text-gray-400">—</span>}
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                <form action={`/admin/api/reviews/${r.id}`} method="post">
                  <input type="hidden" name="action" value={r.isApproved ? "hide" : "approve"} />
                  <button className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50" type="submit">
                    {r.isApproved ? "Hide" : "Approve"}
                  </button>
                </form>

                <form action={`/admin/api/reviews/${r.id}`} method="post">
                  <input type="hidden" name="action" value="delete" />
                  <button className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}

          {reviews.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-600">No reviews yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}