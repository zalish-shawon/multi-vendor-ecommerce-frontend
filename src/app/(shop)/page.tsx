/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import ProductCard from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,
  Gamepad,
  Zap,
  PackageOpen,
  Monitor,
  Speaker,
  ChevronLeft,
  ChevronRight,
  Timer,
  ShieldCheck,
  Truck,
  RefreshCw,
  BadgePercent,
  Flame,
} from "lucide-react";
import Link from "next/link";

// Icon Mapping
const CATEGORY_ICONS: Record<string, any> = {
  Mobile: Smartphone,
  Phone: Smartphone,
  Laptops: Laptop,
  Computers: Monitor,
  Audio: Headphones,
  Headphones: Headphones,
  Cameras: Camera,
  Wearables: Watch,
  Smartwatch: Watch,
  Gaming: Gamepad,
  Accessories: Zap,
  Speakers: Speaker,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCat, setActiveCat] = useState<string>("All");

  // Slider Ref
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Flash Sale countdown (example: 3 hours from first render)
  const [saleEndsAt] = useState(() => Date.now() + 3 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState(() => saleEndsAt - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(Math.max(0, saleEndsAt - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [saleEndsAt]);

  const countdown = useMemo(() => {
    const total = Math.floor(timeLeft / 1000);
    const hrs = Math.floor(total / 3600);
    const min = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    return { hrs: pad2(hrs), min: pad2(min), sec: pad2(sec) };
  }, [timeLeft]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/products?limit=24"); // fetch more for sections
        const productList = res.data?.products ? res.data.products : res.data;

        if (Array.isArray(productList)) {
          setProducts(productList);

          const uniqueCats = Array.from(
            new Set(productList.map((p: any) => p?.category).filter(Boolean)),
          ) as string[];

          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Slider Logic
  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = 320;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const updateSliderControls = () => {
    const el = sliderRef.current;
    if (!el) return;

    const atLeft = el.scrollLeft <= 2;
    const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

    setCanLeft(!atLeft);
    setCanRight(!atRight);
  };

  useEffect(() => {
    updateSliderControls();
    const el = sliderRef.current;
    if (!el) return;

    const onScroll = () => updateSliderControls();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [products.length]);

  // Featured / filtered products (by category chip)
  const featuredProducts = useMemo(() => {
    if (activeCat === "All") return products.slice(0, 8);
    return products.filter((p) => p?.category === activeCat).slice(0, 8);
  }, [products, activeCat]);

  // Top rated section (if your API has rating field; otherwise fallback to first items)
  const topRated = useMemo(() => {
    const list = [...products];
    const hasRating = list.some((p) => typeof p?.rating === "number");

    if (hasRating) {
      list.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
      return list.slice(0, 8);
    }
    return list.slice(8, 16);
  }, [products]);

  const BRAND_LIST = ["SONY", "SAMSUNG", "APPLE", "LOGITECH", "ASUS", "DELL", "HP", "XIAOMI", "JBL", "LENOVO"];

  return (
    <div className="min-h-screen  from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-16 pb-20">
        {/* 1) HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.9)]">
          {/* glow */}
          <div className="pointer-events-none absolute -top-28 -right-24 h-96 w-96 rounded-full bg-blue-500/25 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-purple-500/25 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 px-6 py-14 md:px-12 md:py-20 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                <span>New Arrivals 2026</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Next Gen Tech{" "}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-purple-300">
                  For Pro Users
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/75 leading-relaxed max-w-xl mx-auto md:mx-0">
                Verified quality, fast delivery, and premium support—upgrade your gear today.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-7 font-bold bg-white text-slate-950 hover:bg-white/90"
                  >
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/products" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full px-7 font-bold border-white/25 text-white hover:bg-white/10 hover:text-white"
                  >
                    View Deals
                  </Button>
                </Link>
              </div>

              {/* trust line */}
              <div className="pt-2 text-xs text-white/55 flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Fast delivery
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout
                </span>
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Easy return
                </span>
              </div>
            </div>

            {/* hero feature card */}
            <div className="hidden md:block">
              <div className="relative mx-auto w-full max-w-sm">
                <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-tr from-blue-500/30 to-purple-500/30 blur-2xl" />
                <div className="relative rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-white/60">FEATURED COLLECTION</div>
                    <div className="h-9 w-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-300" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    <HeroTile title="Premium Headphones" sub="Studio-grade clarity" />
                    <HeroTile title="Gaming Essentials" sub="Low latency, high FPS" />
                    <HeroTile title="Smart Wearables" sub="Health + productivity" />
                  </div>

                  <Link href="/products" className="block mt-8">
                    <Button className="w-full rounded-full bg-white text-slate-950 hover:bg-white/90 font-bold">
                      Explore Collection
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2) SERVICE STRIP (NEW) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ServiceCard icon={<Truck className="h-5 w-5" />} title="Fast Delivery" sub="1–3 business days" />
          <ServiceCard icon={<ShieldCheck className="h-5 w-5" />} title="Secure Payment" sub="Trusted gateways" />
          <ServiceCard icon={<RefreshCw className="h-5 w-5" />} title="7 Day Return" sub="No hassle return" />
        </section>

        {/* 3) CATEGORIES */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Shop by Category
              </h2>
              <p className="text-sm text-slate-500 mt-1">Browse top categories in one click.</p>
            </div>
            <Link href="/products" className="hidden sm:block">
              <Button variant="ghost" className="rounded-full">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {loading
              ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
              : categories.map((cat, i) => {
                  const Icon = CATEGORY_ICONS[cat] || PackageOpen;
                  return (
                    <Link key={i} href={`/products?category=${encodeURIComponent(cat)}`} className="group">
                      <div
                        className={cn(
                          "h-28 rounded-2xl border bg-white p-4",
                          "border-slate-200/70 shadow-sm",
                          "transition-all duration-300",
                          "hover:-translate-y-1 hover:shadow-lg hover:border-blue-200",
                        )}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3 border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 text-center line-clamp-1">
                            {cat}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">Explore</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>

        {/* 4) FLASH SALE (REAL TIMER) */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_18px_50px_-30px_rgba(37,99,235,0.8)]">
            <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/20 blur-3xl" />

            <div className="relative z-10 p-7 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                  <Timer className="h-3.5 w-3.5" />
                  Flash Deal
                </div>

                <h2 className="text-3xl md:text-5xl font-extrabold leading-[1.05]">
                  Super Sale Ends Soon
                </h2>

                <p className="text-white/85 text-base md:text-lg max-w-xl">
                  Up to <span className="font-bold">40% off</span> on selected headphones & gaming gear.
                </p>

                <div className="flex gap-3 justify-center md:justify-start font-mono">
                  <TimeBox label="HRS" value={countdown.hrs} />
                  <TimeBox label="MIN" value={countdown.min} />
                  <TimeBox label="SEC" value={countdown.sec} />
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Link href="/products" className="block">
                  <Button
                    size="lg"
                    className="w-full md:w-auto rounded-full bg-white text-indigo-700 hover:bg-white/90 font-extrabold px-8 h-12 shadow-lg"
                  >
                    Shop The Sale <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-center md:text-right text-xs text-white/70 mt-2">
                  *Limited items available
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5) TRENDING SLIDER */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Trending Now
              </h2>
              <p className="text-slate-500 mt-1">Hottest picks of the week.</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => scrollSlider("left")}
                disabled={!canLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => scrollSlider("right")}
                disabled={!canRight}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="min-w-[260px] md:min-w-[280px] snap-start">
                    <Skeleton className="h-[360px] w-full rounded-2xl" />
                  </div>
                ))
              : products.slice(0, 12).map((product: any) => (
                  <div key={product._id} className="min-w-[260px] md:min-w-[280px] snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </section>

        {/* 6) FEATURED COLLECTIONS (NEW) */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Featured Collections
              </h2>
              <p className="text-slate-500 mt-1">
                Quick picks by category — choose what you want.
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="rounded-full">
                Explore all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap mb-6">
            <Chip active={activeCat === "All"} onClick={() => setActiveCat("All")}>
              All
            </Chip>
            {categories.slice(0, 10).map((c) => (
              <Chip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>
                {c}
              </Chip>
            ))}
          </div>

          {/* grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-[360px] w-full rounded-2xl" />)
              : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* 7) TOP RATED (NEW) */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <BadgePercent className="h-5 w-5 text-blue-600" />
                Top Rated
              </h2>
              <p className="text-slate-500 mt-1">Customer favorites and best picks.</p>
            </div>
            <Link href="/products">
              <Button className="rounded-full">
                View more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-[360px] w-full rounded-2xl" />)
              : topRated.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* 8) BRAND MARQUEE SLIDER (NEW) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Trusted Brands</h3>
              <p className="text-sm text-slate-500 mt-1">
                Genuine products & verified suppliers.
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="rounded-full">
                Shop brands <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Marquee items={BRAND_LIST} />
        </section>

        {/* 9) PROMO / NEWSLETTER (polished) */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Newsletter Subscription
            </h2>
            <p className="text-slate-600">
              Get exclusive deals, early access to drops, and member-only pricing.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 rounded-full px-5 border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition"
              />
              <Button size="lg" className="rounded-full bg-slate-900 hover:bg-slate-800 px-6">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center md:text-left">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- small components ---------- */

function HeroTile({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-white/60 mt-1">{sub}</div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="font-extrabold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold border transition",
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
      )}
    >
      {children}
    </button>
  );
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[72px] rounded-2xl bg-white/15 border border-white/15 px-4 py-3 text-center">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[10px] font-sans font-semibold tracking-widest opacity-80">
        {label}
      </div>
    </div>
  );
}

function Marquee({ items }: { items: string[] }) {
  // Duplicate items for seamless loop
  const loopItems = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />

      <div className="marquee flex gap-3">
        {loopItems.map((brand, i) => (
          <div
            key={i}
            className="px-5 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 font-black tracking-tight text-sm whitespace-nowrap"
          >
            {brand}
          </div>
        ))}
      </div>

      {/* CSS animation */}
      <style jsx>{`
        .marquee {
          width: max-content;
          animation: scroll 18s linear infinite;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
