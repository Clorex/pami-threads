import "server-only";

import { resend } from "@/lib/email/resend";
import type { OrderDoc } from "@/lib/firebase/orders.repo";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function sendReviewRequestEmail(to: string, order: OrderDoc) {
  const from = required("RESEND_FROM_EMAIL");
  const subject = "How was your order? Leave a review — Pami Threads";

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/g, "");
  const items = (order.items || []).slice(0, 10);

  const linksHtml = items
    .map((i) => {
      const slug = (i.slug || "").trim();
      const href = slug ? `${appUrl}/product/${slug}` : `${appUrl}/shop`;
      const label = i.title || "View item";
      return `<li style="margin:0 0 6px 0"><a href="${href}" target="_blank" rel="noreferrer">${label}</a></li>`;
    })
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.45">
    <h2 style="margin:0 0 10px 0">We’d love your feedback</h2>
    <p style="margin:0 0 12px 0;color:#555">
      If you enjoyed your Pami Threads pieces, please leave a quick review. It helps others shop with confidence.
    </p>

    <div style="border:1px solid #eee;border-radius:12px;padding:12px">
      <div style="font-weight:700;margin:0 0 8px 0">Review your items</div>
      <ul style="margin:0;padding-left:18px">${linksHtml}</ul>
    </div>

    <p style="margin:14px 0 0 0;color:#555">Thank you for shopping with Pami Threads.</p>
  </div>`;

  await resend.emails.send({ from, to, subject, html, text: "Please leave a review for your recent order." });
}