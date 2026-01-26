/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Inside handleSubmitReview function:

  const handleSubmitReview = async () => {
    if (!newComment) return toast.error("Please write a comment");

    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews/add", {
        product_id: product._id,
        rating: newRating,
        comment: newComment,
      });

      // The 'res.data' now contains user_id.name and user_id.profileImg
      // So we can safely add it to the top of the list
      setReviews([res.data, ...reviews]);

      setNewComment("");
      toast.success("Review posted successfully!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to post review";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        try {
          const reviewsRes = await api.get(`/reviews/${id}`);
          setReviews(reviewsRes.data);
        } catch (err) {
          console.log("No reviews found");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Could not load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Added to cart!");
  };

  if (loading) return <ProductSkeleton />;
  if (!product)
    return <div className="p-20 text-center text-xl">Product not found</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* 1. BREADCRUMB */}
      <div className="container py-4 border-b mb-8">
        <div className="flex items-center text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-slate-900 font-medium">{product.category}</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* 2. IMAGE GALLERY (Sticky on desktop) */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <Image
                src={product.images?.[selectedImage] || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain p-4 hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === i
                        ? "border-blue-600 ring-2 ring-blue-50 opacity-100"
                        : "border-transparent bg-slate-50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. PRODUCT DETAILS */}
          <div className="flex flex-col h-full">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1"
                >
                  {product.category}
                </Badge>
                {product.stock > 0 ? (
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-600">
                    Out of Stock
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-slate-900 font-bold ml-1.5 text-sm">
                    4.8
                  </span>
                </div>
                <span className="text-slate-400 text-sm">
                  | {reviews.length} Verified Reviews
                </span>
              </div>

              <div className="flex items-end gap-3 mb-8 border-b border-slate-100 pb-8">
                <span className="text-5xl font-bold text-blue-600 tracking-tight">
                  ৳{product.price.toLocaleString()}
                </span>
                <span className="text-slate-400 mb-2 text-lg line-through">
                  ৳{(product.price * 1.1).toFixed(0)}{" "}
                  {/* Fake Original Price for effect */}
                </span>
              </div>

              <div className="prose prose-slate text-slate-600 mb-8 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                {/* Optional Buy Now or Wishlist */}
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">
                      Free Shipping
                    </p>
                    <p className="text-slate-500 text-xs">On orders over 5k</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">
                      2 Year Warranty
                    </p>
                    <p className="text-slate-500 text-xs">Full coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">7 Day Return</p>
                    <p className="text-slate-500 text-xs">No questions asked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. TABS SECTION (Specs & Reviews) */}
        <div className="mt-20">
          <Tabs defaultValue="specs" className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                <TabsTrigger
                  value="specs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 text-base font-medium text-slate-500 hover:text-slate-700 transition-all"
                >
                  Technical Specifications
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-4 text-base font-medium text-slate-500 hover:text-slate-700 transition-all"
                >
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* --- SPECIFICATIONS TAB --- */}
            <TabsContent
              value="specs"
              className="pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="max-w-3xl">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Product Details
                </h3>

                {product.specifications && product.specifications.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    {product.specifications.map((spec: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-3 border-b last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <div className="p-4 sm:p-5 bg-slate-50/50 sm:bg-slate-50 font-medium text-slate-700 sm:border-r">
                          {spec.key}
                        </div>
                        <div className="p-4 sm:p-5 text-slate-600 col-span-2">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-lg bg-slate-50 text-slate-500">
                    No detailed specifications available for this product.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* --- REVIEWS TAB --- */}
            <TabsContent value="reviews" className="pt-8 animate-in fade-in">
              <div className="max-w-3xl space-y-8">
                {/* 1. WRITE REVIEW FORM (Restored) */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Write a Review
                  </h3>
                  <div className="space-y-4">
                    {/* Star Rating Inputs */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          type="button"
                          className="focus:outline-none transition-transform active:scale-95"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-slate-500 font-medium">
                        {newRating} Stars
                      </span>
                    </div>

                    {/* Comment Box */}
                    <Textarea
                      placeholder="Share your experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-white min-h-[100px]"
                    />

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? "Posting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>

                {/* 2. CUSTOMER REVIEWS LIST */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Customer Feedback
                  </h3>

                  {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed">
                      <p className="text-slate-500 italic">
                        No reviews yet. Be the first to share your thoughts!
                      </p>
                    </div>
                  ) : (
                    reviews.map((review: any) => (
                      <div
                        key={review._id}
                        className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={review.user_id?.profileImg} />
                            <AvatarFallback>
                              {review.user_id?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {review.user_id?.name || "Anonymous"}
                                </h4>
                                <div className="flex text-yellow-400 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                              {review.comment}
                            </p>

                            {/* Vendor Reply */}
                            {review.vendor_reply && (
                              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 relative">
                                <div className="absolute -top-2 left-4 w-3 h-3 bg-blue-50 border-t border-l border-blue-100 transform rotate-45"></div>
                                <p className="text-xs font-bold text-blue-700 mb-1">
                                  Response from Store:
                                </p>
                                <p className="text-sm text-blue-600 leading-relaxed">
                                  {review.vendor_reply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
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

function ProductSkeleton() {
  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full mt-8" />
        </div>
      </div>
    </div>
  );
}
