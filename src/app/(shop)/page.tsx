/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
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

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Slider Ref
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/products?limit=12"); // Fetch more for slider
        const productList = res.data.products ? res.data.products : res.data;
        if (Array.isArray(productList)) {
          setProducts(productList);
          const uniqueCats = Array.from(
            new Set(productList.map((p: any) => p.category)),
          ).filter(Boolean) as string[];
          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Slider Logic
  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 300; // Approx card width
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl bg-slate-950 overflow-hidden text-white shadow-2xl mx-4 mt-4">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px]"></div>

        <div className="relative z-10 px-6 py-16 md:py-24 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-800 text-blue-200 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              <span>New Arrivals 2026</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Next Gen Tech <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                For Pro Users.
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-lg mx-auto md:mx-0">
              Discover the latest gadgets and accessories. Verified quality,
              fast delivery, and premium support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center md:justify-start">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 rounded-full w-full sm:w-auto"
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-black font-bold hover:bg-slate-800 hover:text-white rounded-full w-full sm:w-auto"
                >
                  View Deals
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex w-full max-w-sm justify-center relative">
            <div className="absolute inset-0 bg-linear-to-tr from-blue-500 to-purple-600 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative w-72 h-72 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500 group cursor-pointer">
              <Zap className="h-24 w-24 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-6 text-slate-400 font-mono text-xs">
                FEATURED COLLECTION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {loading
            ? [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            : categories.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat] || PackageOpen;
                return (
                  <Link
                    key={i}
                    href={`/products?category=${cat}`}
                    className="group"
                  >
                    <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-28">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm text-slate-700 group-hover:text-blue-700 text-center line-clamp-1">
                        {cat}
                      </span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </section>

      {/* 3. FLASH SALE SECTION (NEW) */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <Timer className="h-3 w-3" /> Flash Deal
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold">
                Super Sale Ends Soon!
              </h2>
              <p className="text-red-100 text-lg max-w-md">
                Get up to 40% off on selected headphones and gaming gear. Offer
                valid while stocks last.
              </p>
              <div className="flex gap-4 justify-center md:justify-start font-mono text-2xl font-bold">
                <div className="bg-white/20 p-3 rounded-lg min-w-[60px] text-center">
                  02
                  <div className="text-[10px] font-sans font-normal opacity-70">
                    HRS
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-lg min-w-[60px] text-center">
                  45
                  <div className="text-[10px] font-sans font-normal opacity-70">
                    MIN
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-lg min-w-[60px] text-center">
                  12
                  <div className="text-[10px] font-sans font-normal opacity-70">
                    SEC
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-red-50 font-bold px-8 h-12 rounded-full shadow-lg"
                >
                  Shop The Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRENDING SLIDER (UPDATED) */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Trending Now
            </h2>
            <p className="text-slate-500 mt-1">Hottest picks of the week.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollSlider("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollSlider("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scroll Container */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[280px] snap-center">
                  <Skeleton className="h-[350px] w-full rounded-xl" />
                </div>
              ))
            : products.map((product: any) => (
                <div
                  key={product._id}
                  className="min-w-[260px] md:min-w-[280px] snap-center"
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </section>

      {/* 5. BRANDS/TRUST (NEW) */}
      <section className="container mx-auto px-4 py-8 border-t border-b">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Simple text placeholders for brands - replace with SVGs ideally */}
          {["SONY", "SAMSUNG", "APPLE", "LOGITECH", "ASUS", "DELL"].map(
            (brand, i) => (
              <div
                key={i}
                className="text-2xl font-black text-slate-800 tracking-tighter"
              >
                {brand}
              </div>
            ),
          )}
        </div>
      </section>

      {/* 6. PROMO BANNER */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-slate-100 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-200">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold text-slate-900">
              Newsletter Subscription
            </h2>
            <p className="text-slate-600">
              Join our newsletter and unlock exclusive deals, early access to
              new drops, and special member pricing.
            </p>
          </div>
          <div className="w-full max-w-md flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 rounded-full px-5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />
            <Button
              size="lg"
              className="rounded-full bg-slate-900 hover:bg-slate-800"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
