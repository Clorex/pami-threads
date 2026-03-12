"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { readCart, type CartItem } from "@/lib/store/cart";

type SessionInfo = {
  kind?: "customer" | "admin";
  email?: string;
} | null;

function countCart(items: CartItem[]) {
  return (items || []).reduce((sum, i) => sum + (Number(i.qty || 0) || 0), 0);
}

export function StoreHeader() {
  const [session, setSession] = useState<SessionInfo>(null);
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setSession(j?.session || null))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    function refresh() {
      try {
        setCartCount(countCart(readCart()));
      } catch {
        setCartCount(0);
      }
    }
    refresh();
    window.addEventListener("pt_cart_changed", refresh);
    return () => window.removeEventListener("pt_cart_changed", refresh);
  }, []);

  const loggedIn = session?.kind === "customer";

  const links = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/shop", label: "Shop" },
      { href: "/about", label: "About" },
      { href: "/gallery", label: "Gallery" },
      { href: "/faq", label: "FAQ" },
    ],
    []
  );

  function linkClass(href: string) {
    const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return active
      ? "text-gray-900 border-b-2 border-pt-orange pb-1"
      : "text-gray-700 hover:text-pt-orange";
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.jpg" alt="Pami Threads" width={44} height={44} priority className="rounded-md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border bg-white p-2 text-gray-800 hover:border-pt-orange hover:text-pt-orange md:hidden"
            aria-label="Open menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {loggedIn ? (
            <Link href="/account" className="text-gray-700 hover:text-pt-orange" aria-label="My account">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-pt-orange">
              Sign in
            </Link>
          )}

          {/* Cart icon with count */}
          <Link href="/cart" className="relative text-gray-700 hover:text-pt-orange" aria-label="Shopping bag">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-pt-orange px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open ? (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-pt-orange px-4 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover"
              >
                Cart ({cartCount})
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}