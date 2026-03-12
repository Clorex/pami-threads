import type { Metadata } from "next";
import "./globals.css";

const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/g, "");

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "Pami Threads",
    template: "%s — Pami Threads",
  },
  description: "Bold African fabrics. Handmade style. Fashion for everyone.",
  openGraph: {
    title: "Pami Threads",
    description: "Bold African fabrics. Handmade style. Fashion for everyone.",
    url: base,
    siteName: "Pami Threads",
    type: "website",
  },
  alternates: {
    canonical: base,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}