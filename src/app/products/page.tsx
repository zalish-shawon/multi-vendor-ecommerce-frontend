/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { toast } from "sonner";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ProductCard from "@/components/shop/ProductCard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Search,
  Filter,
  X,
  PackageOpen,
  ChevronDown,
  Check,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  rating?: number;
  avgRating?: number;
  reviewsCount?: number;
  originalPrice?: number;
}

type SortKey = "relevance" | "price_low" | "price_high" | "newest";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(n || 0),
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState<SortKey>("relevance");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        const data = res.data?.products ? res.data.products : res.data;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);

        // auto-select category from URL
        const categoryFromUrl = searchParams.get("category");
        if (categoryFromUrl) {
          setSelectedCategories([categoryFromUrl]);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Derived categories with counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    const min = priceRange.min ? Number(priceRange.min) : 0;
    const max = priceRange.max ? Number(priceRange.max) : Infinity;

    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const price = Number(product.price || 0);
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategories, priceRange]);

  // Sorted results
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    if (sortBy === "price_low") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high") list.sort((a, b) => b.price - a.price);

    // If you have createdAt, use it. Otherwise keep as is.
    if (sortBy === "newest") {
      list.sort(
        (a: any, b: any) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      );
    }

    return list;
  }, [filteredProducts, sortBy]);

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (selectedCategories.length ? 1 : 0) +
    (priceRange.min || priceRange.max ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Sticky header */}
        <div className="bg-white/80 backdrop-blur border-b sticky top-16 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Shop All</h1>
              <p className="text-xs text-slate-500">
                Find your next gadget in seconds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="h-9 rounded-full border border-slate-200 bg-white px-4 pr-9 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="md:hidden gap-2 rounded-full"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="h-4 w-4" />
                Filters{" "}
                {activeFiltersCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-2 text-[11px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 relative">
          {/* Sidebar filters */}
          <aside
            className={cn(
              "fixed inset-0 z-30 bg-white p-6 transform transition-transform duration-300 ease-in-out",
              "md:relative md:transform-none md:w-72 md:block md:bg-transparent md:p-0",
              showMobileFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            )}
          >
            {/* Mobile top bar */}
            <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="font-extrabold text-lg text-slate-900">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Filter card */}
            <div className="md:sticky md:top-28 space-y-6 rounded-3xl md:rounded-none border md:border-0 border-slate-200 bg-white md:bg-transparent p-5 md:p-0 shadow-sm md:shadow-none">
              {/* Search */}
              <div className="space-y-3">
                <Label className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9 bg-white rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Categories
                </Label>

                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 14).map(([cat, count]) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold transition",
                          active
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300",
                        )}
                      >
                        <span className="truncate max-w-[140px]">{cat}</span>
                        <span
                          className={cn(
                            "text-[11px] px-2 py-0.5 rounded-full",
                            active ? "bg-white/15" : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {count}
                        </span>
                        {active && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Price Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="bg-white rounded-full text-sm"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    className="bg-white rounded-full text-sm"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Clear */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full rounded-full text-red-600 hover:bg-red-50"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results row */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-bold text-slate-900">
                    {sortedProducts.length}
                  </span>{" "}
                  products
                </div>

                {/* Active filter pills */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge className="rounded-full bg-slate-900 text-white">
                      Search: {searchTerm}
                    </Badge>
                  )}

                  {selectedCategories.length > 0 &&
                    selectedCategories.map((c) => (
                      <Badge
                        key={c}
                        className="rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {c}
                      </Badge>
                    ))}

                  {(priceRange.min || priceRange.max) && (
                    <Badge className="rounded-full bg-slate-100 text-slate-700">
                      ৳{priceRange.min || "0"} - ৳{priceRange.max || "∞"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Sort (mobile) */}
              <div className="md:hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 pr-9 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-[380px] rounded-3xl" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-white p-10 text-center">
                <PackageOpen size={64} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  No products found
                </h3>
                <p className="text-slate-500 mt-1">
                  Try changing your search or filters.
                </p>

                <Button className="mt-6 rounded-full" onClick={clearFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            {!loading && sortedProducts.length > 0 && (
              <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Want deals first?
                  </h3>
                  <p className="text-slate-500 mt-1">
                    Subscribe and get exclusive offers + early access.
                  </p>
                </div>
                <Link href="/" className="w-full md:w-auto">
                  <Button className="w-full md:w-auto rounded-full px-7">
                    Go to Home <span className="ml-2">→</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile overlay */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
