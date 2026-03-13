"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { readCart, type CartItem } from "@/lib/store/cart";

function countCart(items: CartItem[]) {
  return (items || []).reduce((sum, i) => sum + (Number(i.qty || 0) || 0), 0);
}

type Indicator = { x: number; w: number; show: boolean };

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [bump, setBump] = useState(false);
  const [indicator, setIndicator] = useState<Indicator>({ x: 0, w: 0, show: false });

  const pathname = usePathname();

  const navRef = useRef<HTMLElement | null>(null);
  const linkEls = useRef<Record<string, HTMLAnchorElement | null>>({});

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

  // Cart badge bump when count changes (only when > 0)
  useEffect(() => {
    if (cartCount <= 0) return;
    setBump(true);
    const t = window.setTimeout(() => setBump(false), 280);
    return () => window.clearTimeout(t);
  }, [cartCount]);

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

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname?.startsWith(href);
  }

  function linkClass(href: string) {
    const active = isActive(href);
    return active ? "text-gray-900" : "text-gray-700 hover:text-pt-orange";
  }

  function recalcIndicator() {
    const nav = navRef.current;
    if (!nav) return setIndicator({ x: 0, w: 0, show: false });

    const active = links.find((l) => isActive(l.href));
    if (!active) return setIndicator({ x: 0, w: 0, show: false });

    const el = linkEls.current[active.href];
    if (!el) return setIndicator({ x: 0, w: 0, show: false });

    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const x = elRect.left - navRect.left;
    const w = elRect.width;

    setIndicator({ x, w, show: true });
  }

  useLayoutEffect(() => {
    recalcIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function onResize() {
      recalcIndicator();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pressable =
    "transition-transform duration-150 will-change-transform active:scale-[0.98]";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className={"flex items-center " + pressable} aria-label="Home">
          <Image
            src="/logo.jpg"
            alt="Pami Threads"
            width={44}
            height={44}
            priority
            className="rounded-md"
          />
        </Link>

        {/* Desktop nav + sliding indicator */}
        <nav
          ref={(el) => {
            navRef.current = el;
          }}
          className="relative hidden items-center gap-6 text-sm font-semibold md:flex"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              ref={(el) => {
                linkEls.current[l.href] = el;
              }}
              className={
                "inline-block pb-2 " +
                linkClass(l.href) +
                " transition-colors duration-150 hover:-translate-y-[1px] " +
                pressable
              }
            >
              {l.label}
            </Link>
          ))}

          {/* indicator */}
          <span
            aria-hidden
            className="absolute bottom-0 h-0.5 rounded-full bg-pt-orange transition-[transform,width,opacity] duration-300"
            style={{
              width: indicator.w ? `${indicator.w}px` : "0px",
              transform: `translateX(${indicator.x}px)`,
              opacity: indicator.show ? 1 : 0,
            }}
          />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={
              "inline-flex items-center justify-center rounded-xl border bg-white p-2 text-gray-800 hover:border-pt-orange hover:text-pt-orange md:hidden " +
              pressable
            }
            aria-label="Open menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Cart icon with count */}
          <Link
            href="/cart"
            className={"relative text-gray-700 hover:text-pt-orange " + pressable}
            aria-label="Shopping bag"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span
                className={
                  "absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-pt-orange px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white " +
                  (bump ? "pt-badge-bump" : "")
                }
              >
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
                  className={
                    "rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-pt-orange hover:text-pt-orange " +
                    pressable
                  }
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className={
                  "rounded-xl bg-pt-orange px-4 py-3 text-sm font-semibold text-white hover:bg-pt-orange-hover " +
                  pressable
                }
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
