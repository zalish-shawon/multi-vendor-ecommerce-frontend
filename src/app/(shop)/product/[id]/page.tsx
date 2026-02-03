/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

import {
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
  Heart,
  Share2,
  PackageCheck,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatBDT(value: number) {
  return new Intl.NumberFormat("en-US").format(value); // English digits
}


function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // ---------- Derived rating stats ----------
  const ratingStats = useMemo(() => {
    const total = reviews?.length || 0;
    if (!total) {
      return {
        avg: 0,
        total: 0,
        dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
      };
    }

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const r of reviews) {
      const val = clamp(Number(r?.rating ?? 0), 1, 5);
      dist[val] += 1;
      sum += val;
    }

    return { avg: sum / total, total, dist };
  }, [reviews]);

  const avgText = useMemo(() => {
    if (!ratingStats.total) return "0.0";
    return ratingStats.avg.toFixed(1);
  }, [ratingStats]);

  // ---------- Submit review ----------
  const handleSubmitReview = async () => {
    if (!product?._id) return;
    if (!newComment.trim()) return toast.error("Please write a comment");

    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews/add", {
        product_id: product._id,
        rating: newRating,
        comment: newComment,
      });

      setReviews((prev) => [res.data, ...prev]); // safer
      setNewComment("");
      setNewRating(5);
      toast.success("Review posted successfully!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to post review";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ---------- Fetch ----------
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        try {
          const reviewsRes = await api.get(`/reviews/${id}`);
          setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        } catch {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Could not load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success("Added to cart!");
  };

  if (loading) return <ProductSkeleton />;

  if (!product)
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">Product not found</p>
          <p className="text-slate-500 mt-2">
            The item may have been removed or the link is incorrect.
          </p>
          <Link href="/products" className="inline-block mt-6">
            <Button className="rounded-full">Back to products</Button>
          </Link>
        </div>
      </div>
    );

  const images: string[] = product.images?.length ? product.images : ["/placeholder.png"];
  const inStock = Number(product.stock) > 0;

  const price = Number(product.price || 0);
  const fakeOriginal = Math.round(price * 1.12);
  const discountPct = price ? Math.round(((fakeOriginal - price) / fakeOriginal) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-20">
      {/* BREADCRUMB */}
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link
              href={`/products?category=${encodeURIComponent(product.category || "")}`}
              className="hover:text-blue-600 transition"
            >
              {product.category || "Products"}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="truncate max-w-[260px] text-slate-900 font-medium">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_60%)]" />
              <Image
                src={images[selectedImage] || "/placeholder.png"}
                alt={product.name}
                fill
                priority
                className="object-contain p-6 transition-transform duration-500 hover:scale-[1.04]"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative w-20 h-20 rounded-2xl overflow-hidden border transition-all flex-shrink-0 bg-white",
                      selectedImage === i
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300 opacity-90 hover:opacity-100",
                    )}
                    aria-label={`Select image ${i + 1}`}
                    type="button"
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Mini perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Perk icon={<Truck className="h-4 w-4" />} title="Fast Delivery" sub="1–3 business days" />
              <Perk icon={<ShieldCheck className="h-4 w-4" />} title="Warranty" sub="Up to 2 years" />
              <Perk icon={<RefreshCw className="h-4 w-4" />} title="Easy Returns" sub="7 days return" />
            </div>
          </div>

          {/* MIDDLE: Details */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Category + stock */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1">
                  {product.category || "General"}
                </Badge>

                {inStock ? (
                  <span className="text-xs font-semibold text-green-700 inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-red-600">Out of Stock</span>
                )}

                {discountPct > 0 && (
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Save {discountPct}%
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-extrabold text-slate-900">{avgText}</span>
                  <span className="text-xs text-slate-500">({ratingStats.total})</span>
                </div>
                <span className="text-sm text-slate-500">
                  Verified Reviews • Secure checkout • Quality guaranteed
                </span>
              </div>

              {/* Price */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-sm text-slate-500">Price</div>
                    <div className="mt-1 flex items-end gap-3">
                      <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        ৳{formatBDT(price)}
                      </div>
                      {fakeOriginal > price && (
                        <div className="text-slate-400 text-lg line-through mb-1">
                          ৳{formatBDT(fakeOriginal)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => toast.info("Wishlist feature coming soon")}
                      type="button"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => {
                        navigator?.clipboard?.writeText?.(window.location.href);
                        toast.success("Link copied!");
                      }}
                      type="button"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>

                  <Link href="/cart" className="flex-1">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-12 rounded-full"
                      disabled={!inStock}
                    >
                      Buy Now
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Extra trust */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MiniTrust icon={<PackageCheck className="h-4 w-4 text-blue-600" />} title="Original Product" />
                  <MiniTrust icon={<ShieldCheck className="h-4 w-4 text-blue-600" />} title="Secure Payment" />
                  <MiniTrust icon={<RefreshCw className="h-4 w-4 text-blue-600" />} title="7-day Return" />
                </div>
              </div>

              {/* Description */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">Overview</h3>
                <p className="text-slate-600 leading-relaxed">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Rating summary card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Customer Ratings</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Based on {ratingStats.total} review{ratingStats.total === 1 ? "" : "s"}.
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-slate-900">{avgText}</div>
                    <div className="flex justify-end text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.round(ratingStats.avg) ? "fill-current" : "text-slate-200",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[5, 4, 3, 2, 1].map((k) => {
                    const count = ratingStats.dist[k] || 0;
                    const pct = ratingStats.total ? (count / ratingStats.total) * 100 : 0;
                    return (
                      <div key={k} className="flex items-center gap-3">
                        <div className="w-14 text-sm text-slate-700 font-semibold">{k}★</div>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-10 text-sm text-slate-500 text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-14">
          <Tabs defaultValue="specs" className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                <TabsTrigger
                  value="specs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 text-base font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Technical Specifications
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 text-base font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* SPECS */}
            <TabsContent value="specs" className="pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="max-w-4xl">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-6">Product Details</h3>

                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      {product.specifications.map((spec: any, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-3 border-b last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          <div className="p-4 sm:p-5 bg-slate-50 font-semibold text-slate-700 sm:border-r">
                            {spec.key}
                          </div>
                          <div className="p-4 sm:p-5 text-slate-600 col-span-2">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center rounded-2xl border border-dashed bg-slate-50 text-slate-500">
                      No detailed specifications available for this product.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* REVIEWS */}
            <TabsContent value="reviews" className="pt-8 animate-in fade-in duration-300">
              <div className="max-w-4xl space-y-8">
                {/* Write Review */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-4">Write a Review</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          type="button"
                          className="focus:outline-none transition-transform active:scale-95"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={cn(
                              "w-6 h-6",
                              star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300",
                            )}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-slate-500 font-semibold">{newRating} Stars</span>
                    </div>

                    <Textarea
                      placeholder="Share your experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-white min-h-[110px] rounded-2xl"
                    />

                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="rounded-full"
                    >
                      {submittingReview ? "Posting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <h3 className="text-xl font-extrabold text-slate-900">Customer Feedback</h3>
                    <div className="text-sm text-slate-500">
                      Showing {reviews.length} review{reviews.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl border border-dashed bg-slate-50">
                      <p className="text-slate-500 italic">
                        No reviews yet. Be the first to share your thoughts!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div
                          key={review._id}
                          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-11 w-11 border">
                              <AvatarImage src={review.user_id?.profileImg} />
                              <AvatarFallback>
                                {review.user_id?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <h4 className="font-extrabold text-slate-900">
                                    {review.user_id?.name || "Anonymous"}
                                  </h4>
                                  <div className="flex text-yellow-400 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "w-4 h-4",
                                          i < Number(review.rating || 0) ? "fill-current" : "text-slate-200",
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <span className="text-xs text-slate-400">
                                  {review.createdAt
                                    ? new Date(review.createdAt).toLocaleDateString()
                                    : ""}
                                </span>
                              </div>

                              <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                                {review.comment}
                              </p>

                              {review.vendor_reply && (
                                <div className="mt-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 relative">
                                  <div className="absolute -top-2 left-6 w-3 h-3 bg-blue-50 border-t border-l border-blue-100 rotate-45" />
                                  <p className="text-xs font-extrabold text-blue-700 mb-1">
                                    Response from Store
                                  </p>
                                  <p className="text-sm text-blue-700/90 leading-relaxed">
                                    {review.vendor_reply}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Perk({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function MiniTrust({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-2">
      {icon}
      <span className="text-xs font-semibold text-slate-700">{title}</span>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex gap-3">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <Skeleton className="w-20 h-20 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="h-7 w-1/3 rounded-full" />
          <Skeleton className="h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-6 w-1/2 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-36 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
