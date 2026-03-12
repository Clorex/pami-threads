"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type GalleryItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  collections: string[]; // used for grouping/tabs
  fabrics: string[];     // fallback if collections empty
  isActive: boolean;     // active/draft/inactive display (optional)
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => (x || "").trim()).filter(Boolean)));
}

function titleCase(s: string) {
  return (s || "")
    .trim()
    .split(/\s+/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Tab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition",
        active
          ? "bg-pt-orange text-white"
          : "border border-gray-200 bg-white text-gray-800 hover:border-pt-orange hover:text-pt-orange"
      )}
    >
      <span>{label.toUpperCase()}</span>
      {typeof count === "number" ? (
        <span className={active ? "text-white/90" : "text-gray-500"}>({count})</span>
      ) : null}
    </button>
  );
}

export function GalleryClient({ items }: { items: GalleryItem[] }) {
  const ALL = "All";

  // Tabs are based on admin “collections”
  const allCollections = useMemo(() => {
    const col = uniq(items.flatMap((i) => i.collections));
    // if admin uses mixed casing, normalize display only
    return col.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const tabs = useMemo(() => [ALL, ...allCollections], [allCollections]);

  const [activeTab, setActiveTab] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (activeTab === ALL) return items;

    const key = activeTab.toLowerCase();
    return items.filter((i) =>
      (i.collections || []).some((c) => (c || "").toLowerCase() === key)
    );
  }, [items, activeTab]);

  // Coverflow state
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dirRef = useRef<1 | -1>(1);

  // Reset when tab changes
  useEffect(() => {
    setActiveIndex(0);
    dirRef.current = 1;
  }, [activeTab]);

  // Auto move left->right->left (ping-pong)
  useEffect(() => {
    if (paused) return;
    if (filtered.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((cur) => {
        const last = filtered.length - 1;
        let next = cur + dirRef.current;

        if (next > last) {
          dirRef.current = -1;
          next = Math.max(0, last - 1);
        } else if (next < 0) {
          dirRef.current = 1;
          next = Math.min(last, 1);
        }

        return next;
      });
    }, 2400);

    return () => window.clearInterval(id);
  }, [filtered.length, paused]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set(ALL, items.length);
    for (const c of allCollections) {
      const key = c.toLowerCase();
      map.set(
        c,
        items.filter((i) => i.collections.some((x) => x.toLowerCase() === key))
          .length
      );
    }
    return map;
  }, [items, allCollections]);

  // Responsive sizing/spacing
  const [w, setW] = useState<number>(1200);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const spacing = w < 640 ? 110 : w < 1024 ? 150 : 190;
  const baseW = w < 640 ? 190 : w < 1024 ? 230 : 260;
  const baseH = w < 640 ? 270 : w < 1024 ? 340 : 390;

  function goPrev() {
    if (filtered.length <= 1) return;
    dirRef.current = -1;
    setActiveIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    if (filtered.length <= 1) return;
    dirRef.current = 1;
    setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
  }

  const visibleRange = 4; // how many on each side to render

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-pt-orange hover:underline">
              Home
            </Link>{" "}
            / <span>Gallery</span>
          </div>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
            Gallery
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Every product uploaded in Admin is automatically displayed here — active, inactive, or draft.
          </p>
        </div>

        {/* Tabs (Collections) */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <Tab
              key={t}
              active={activeTab === t}
              label={titleCase(t)}
              count={counts.get(t)}
              onClick={() => setActiveTab(t)}
            />
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border bg-white p-10 text-center text-sm text-gray-600">
            No items in this collection yet.
          </div>
        ) : (
          <>
            {/* Coverflow */}
            <div
              className={clsx(
                "relative mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm",
                "px-4 py-10 sm:px-8"
              )}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* brand-tinted background */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,140,26,0.10),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(63,95,43,0.10),transparent_55%)]" />

              <div className="relative mx-auto h-[380px] sm:h-[440px] lg:h-[520px] max-w-6xl [perspective:1200px]">
                {/* arrows */}
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 text-gray-900 shadow-sm hover:border-pt-orange hover:text-pt-orange"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 text-gray-900 shadow-sm hover:border-pt-orange hover:text-pt-orange"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {filtered.map((item, idx) => {
                  const offset = idx - activeIndex;
                  const abs = Math.abs(offset);

                  if (abs > visibleRange) return null;

                  const scale = offset === 0 ? 1.05 : Math.max(0.72, 0.92 - abs * 0.08);
                  const rotateY = offset * -18;
                  const translateX = offset * spacing;
                  const translateZ = offset === 0 ? 80 : 0;

                  const opacity = Math.max(0.35, 1 - abs * 0.18);
                  const zIndex = 50 - abs;

                  const statusLabel = item.isActive ? "Active" : "Draft";

                  return (
                    <div
                      key={item.id}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        width: `${baseW}px`,
                        height: `${baseH}px`,
                        transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        transition: "transform 650ms cubic-bezier(.2,.8,.2,1), opacity 650ms cubic-bezier(.2,.8,.2,1)",
                        opacity,
                        zIndex,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPaused(true);
                          setActiveIndex(idx);
                        }}
                        className="group relative h-full w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm hover:shadow-md"
                        aria-label={`View ${item.title}`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="260px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* top pills */}
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-gray-900">
                            {(item.collections[0] || item.fabrics[0] || "Other").toUpperCase()}
                          </span>
                          <span
                            className={clsx(
                              "rounded-full px-3 py-1 text-[11px] font-extrabold",
                              item.isActive
                                ? "bg-pt-green text-white"
                                : "bg-gray-900/70 text-white"
                            )}
                          >
                            {statusLabel.toUpperCase()}
                          </span>
                        </div>

                        {/* title (only fully shown on active) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                          <div
                            className={clsx(
                              "line-clamp-2 text-sm font-extrabold text-white transition",
                              offset === 0 ? "opacity-100" : "opacity-0"
                            )}
                          >
                            {item.title}
                          </div>

                          <div
                            className={clsx(
                              "mt-2 text-xs font-semibold text-white/85 transition",
                              offset === 0 ? "opacity-100" : "opacity-0"
                            )}
                          >
                            Tap the image to open product
                          </div>
                        </div>
                      </button>

                      {/* click-through link (only for active item to avoid accidental clicks) */}
                      {offset === 0 ? (
                        <Link
                          href={`/product/${item.slug}`}
                          className="absolute inset-0 z-10"
                          aria-label={`Open product ${item.title}`}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* hint */}
            
            </div>
          </>
        )}
      </div>
    </div>
  );
}