import "server-only";

import { resend } from "@/lib/email/resend";
import type { OrderDoc } from "@/lib/firebase/orders.repo";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function money(cents: number, currency: string) {
  const c = (currency || "usd").toUpperCase();
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(v);
}

function escapeHtml(s: string) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function orderItemsHtml(order: OrderDoc) {
  return (order.items || [])
    .map((i) => {
      const pick = i.pick
        ? ` <span style="color:#666">(${[i.pick.fabric, i.pick.size, i.pick.color].filter(Boolean).join(" • ")})</span>`
        : "";
      return `<li style="margin:0 0 6px 0">${i.quantity} × ${escapeHtml(i.title)}${pick}</li>`;
    })
    .join("");
}

function shippingHtml(order: OrderDoc) {
  if (!order.shipping) return "";
  const s = order.shipping;

  const line2 = s.line2 ? `<br/>${escapeHtml(s.line2)}` : "";
  const cityLine = escapeHtml([s.city, s.state, s.postal_code].filter(Boolean).join(" "));

  return `<p style="margin:12px 0 0 0;color:#555">
    <strong>Shipping:</strong><br/>
    ${escapeHtml(s.name || "")}<br/>
    ${escapeHtml(s.line1 || "")}${line2}<br/>
    ${cityLine}<br/>
    ${escapeHtml(s.country || "")}
  </p>`;
}

export async function sendOrderConfirmationEmail(to: string, order: OrderDoc) {
  const from = required("RESEND_FROM_EMAIL");
  const subject = "Order confirmed — Pami Threads";

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.45">
    <h2 style="margin:0 0 10px 0">Thanks — your order is confirmed</h2>
    <p style="margin:0 0 14px 0;color:#555">Order reference: <strong>${escapeHtml(order.stripeSessionId)}</strong></p>

    <div style="border:1px solid #eee;border-radius:12px;padding:12px">
      <div style="font-weight:700;margin:0 0 8px 0">Items</div>
      <ul style="margin:0;padding-left:18px">${orderItemsHtml(order)}</ul>
      <div style="margin-top:10px;font-weight:700">Total: ${money(order.amountTotalCents, order.currency)}</div>
    </div>

    ${shippingHtml(order)}

    <p style="margin:16px 0 0 0;color:#555">We’ll email you when your order ships.</p>
  </div>`;

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: `Order confirmed. Ref: ${order.stripeSessionId}`,
  });
}

export async function sendShippingUpdateEmail(to: string, order: OrderDoc) {
  const from = required("RESEND_FROM_EMAIL");
  const subject = "Your order is on the way — Pami Threads";

  const trackingLine = order.trackingUrl
    ? `<p style="margin:10px 0 0 0"><a href="${escapeHtml(order.trackingUrl)}" target="_blank" rel="noreferrer">Track your package</a></p>`
    : order.trackingCode
      ? `<p style="margin:10px 0 0 0;color:#555">Tracking code: <strong>${escapeHtml(order.trackingCode)}</strong></p>`
      : `<p style="margin:10px 0 0 0;color:#555">Tracking details will be shared soon.</p>`;

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.45">
    <h2 style="margin:0 0 10px 0">Good news — your order has shipped</h2>
    <p style="margin:0 0 14px 0;color:#555">Order reference: <strong>${escapeHtml(order.stripeSessionId)}</strong></p>
    ${order.trackingCarrier ? `<p style="margin:0 0 8px 0;color:#555">Carrier: <strong>${escapeHtml(order.trackingCarrier)}</strong></p>` : ""}
    ${trackingLine}
    <p style="margin:16px 0 0 0;color:#555">Thank you for shopping with Pami Threads.</p>
  </div>`;

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: `Your order shipped. Ref: ${order.stripeSessionId}`,
  });
}

export async function sendAdminNewOrderEmail(order: OrderDoc) {
  const from = required("RESEND_FROM_EMAIL");
  const to = required("ADMIN_EMAIL");

  const subject = `New order received — ${order.stripeSessionId}`;

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.45">
    <h2 style="margin:0 0 10px 0">New order received</h2>
    <p style="margin:0 0 6px 0;color:#555">
      Order ID: <strong>${escapeHtml(order.stripeSessionId)}</strong>
    </p>
    <p style="margin:0 0 14px 0;color:#555">
      Customer email: <strong>${escapeHtml(order.email || "—")}</strong>
    </p>

    <div style="border:1px solid #eee;border-radius:12px;padding:12px">
      <div style="font-weight:700;margin:0 0 8px 0">Items</div>
      <ul style="margin:0;padding-left:18px">${orderItemsHtml(order)}</ul>
      <div style="margin-top:10px;font-weight:700">Total: ${money(order.amountTotalCents, order.currency)}</div>
      <div style="margin-top:6px;color:#555">Status: <strong>${escapeHtml(order.status)}</strong></div>
    </div>

    ${shippingHtml(order)}
  </div>`;

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: `New order: ${order.stripeSessionId} | Total: ${money(order.amountTotalCents, order.currency)} | Email: ${order.email || "-"}`,
  });
}