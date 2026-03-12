import "server-only";
import { Resend } from "resend";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const resend = new Resend(required("RESEND_API_KEY"));

export async function sendLoginPinEmail(to: string, pin: string) {
  const from = required("RESEND_FROM_EMAIL");

  const subject = "Your Pami Threads sign-in code";
  const text = `Your sign-in code is: ${pin}\n\nThis code expires in 10 minutes.`;
  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.4">
    <h2 style="margin:0 0 12px 0">Sign-in code</h2>
    <p style="margin:0 0 16px 0">Use this code to sign in:</p>
    <div style="font-size:28px;letter-spacing:6px;font-weight:700;margin:0 0 16px 0">${pin}</div>
    <p style="margin:0;color:#555">This code expires in 10 minutes.</p>
  </div>`;

  await resend.emails.send({ from, to, subject, text, html });
}
