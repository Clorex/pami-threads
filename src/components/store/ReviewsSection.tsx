import { StarRow } from "@/components/store/StarRow";
import { ReviewForm } from "@/components/store/ReviewForm";

export type ReviewView = {
  id: string;
  rating: number;
  text: string;
  userEmail?: string;
  createdAtMs?: number;
};

function shortName(email?: string) {
  if (!email) return "Customer";
  const at = email.indexOf("@");
  if (at <= 1) return "Customer";
  return email.slice(0, 1).toUpperCase() + email.slice(1, at);
}

export function ReviewsSection({
  productId,
  signedIn,
  reviews,
}: {
  productId: string;
  signedIn: boolean;
  reviews: ReviewView[];
}) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;

  return (
    <section className="mt-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold">Reviews</h2>
              <div className="mt-2 text-sm text-gray-600">{count} review(s)</div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-semibold">{avg ? avg.toFixed(1) : "—"}</div>
              <div className="mt-1"><StarRow rating={avg} /></div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {count === 0 ? (
              <div className="text-sm text-gray-600">No reviews yet.</div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold">{shortName(r.userEmail)}</div>
                    <StarRow rating={r.rating} />
                  </div>
                  {r.text ? <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">{r.text}</div> : null}
                </div>
              ))
            )}
          </div>
        </div>

        <ReviewForm productId={productId} signedIn={signedIn} />
      </div>
    </section>
  );
}