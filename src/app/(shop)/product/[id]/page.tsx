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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Product
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        // 2. Fetch Reviews (Fail silently if reviews endpoints aren't ready yet)
        try {
          const reviewsRes = await api.get(`/reviews/${id}`);
          setReviews(reviewsRes.data);
        } catch (err) {
          console.log("No reviews found or review endpoint not ready");
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
    // toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <ProductSkeleton />;
  if (!product)
    return <div className="p-20 text-center">Product not found</div>;

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 1. IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border">
            <Image
              src={product.images?.[selectedImage] || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images?.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedImage === i
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-transparent hover:border-gray-300"
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
        </div>

        {/* 2. PRODUCT INFO */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-4">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-slate-700 font-medium ml-1">4.8</span>
              </div>
              <span className="text-slate-400 text-sm">
                ({reviews.length} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 border-b pb-6">
            <span className="text-4xl font-bold text-blue-600">
              ৳{product.price.toLocaleString()}
            </span>
            {/* You can add discount logic here later */}
          </div>

          <p className="text-slate-600 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32">
                <span className="text-sm font-medium text-slate-900">
                  Stock:
                </span>
              </div>
              <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                {product.stock > 0
                  ? `${product.stock} Available`
                  : "Out of Stock"}
              </Badge>
            </div>

            <div className="pt-6 flex gap-4">
              <Button
                size="lg"
                className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800"
                onClick={handleAddToCart} // <--- Use new handler
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t mt-8">
            <div className="flex flex-col items-center text-center text-xs gap-2 text-slate-500">
              <Truck className="h-6 w-6 text-blue-600" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center text-xs gap-2 text-slate-500">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              <span>Genuine Product</span>
            </div>
            <div className="flex flex-col items-center text-center text-xs gap-2 text-slate-500">
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <span>7 Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS (Reviews & Specs) */}
      <div className="mt-16">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-4 text-base"
            >
              Customer Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-4 text-base"
            >
              Specifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="pt-8">
            {reviews.length === 0 ? (
              <p className="text-slate-500">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="grid gap-6">
                {reviews.map((review: any) => (
                  <div
                    key={review._id}
                    className="flex gap-4 border-b pb-6 last:border-0"
                  >
                    <Avatar>
                      <AvatarImage src={review.user_id?.profileImg} />
                      <AvatarFallback>
                        {review.user_id?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">
                          {review.user_id?.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="specs" className="pt-8">
            <div className="prose max-w-none text-slate-600">
              <p>Additional technical specifications would go here.</p>
              {/* You can add a 'specs' field to your Product model later if you want */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full mt-8" />
      </div>
    </div>
  );
}
