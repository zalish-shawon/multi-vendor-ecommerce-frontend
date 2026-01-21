/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import ProductCard from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Clock, RefreshCw, Smartphone, Laptop, Headphones, Camera, Watch, Gamepad } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=8'); // Fetch 8 products
        setProducts(res.data.products);
      } catch (error) {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Mobiles', icon: Smartphone },
    { name: 'Laptops', icon: Laptop },
    { name: 'Audio', icon: Headphones },
    { name: 'Cameras', icon: Camera },
    { name: 'Wearables', icon: Watch },
    { name: 'Gaming', icon: Gamepad },
  ];

  return (
    <div className="space-y-20 pb-10">
      
      {/* 1. HERO SECTION (Full Width Feel inside Container) */}
      <section className="relative rounded-3xl bg-slate-950 overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 px-8 py-16 md:py-24 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="max-w-2xl space-y-8 text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 border border-blue-800 text-blue-200 text-sm font-medium backdrop-blur-sm">
               <Sparkles className="h-4 w-4" /> 
               <span>New Arrivals 2026</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
               Tech that <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Defines You</span>
             </h1>
             <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
               Upgrade your setup with verified electronics from top vendors. 
               Experience the future today.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
               <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 font-bold px-8 h-12 rounded-full">
                 Shop Now
               </Button>
               <Button size="lg" variant="outline" className="border-slate-700 text-slate-900 hover:bg-slate-800 hover:text-white h-12 rounded-full">
                 View Deals <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </div>
           </div>
           
           {/* Abstract Hero Graphic */}
           <div className="hidden md:flex w-full max-w-sm justify-center">
              <div className="relative w-72 h-72 bg-linear-to-tr from-blue-500 to-purple-600 rounded-3xl rotate-6 shadow-2xl flex items-center justify-center">
                  <div className="absolute inset-1 bg-slate-900/90 rounded-[22px] flex items-center justify-center border border-white/10">
                      <span className="text-slate-500 font-mono text-xs">Featured Product</span>
                  </div>
              </div>
           </div>
        </div>
      </section>

     

      {/* 3. BROWSE BY CATEGORY */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <Link key={i} href={`/products?category=${cat.name}`} className="group">
              <div className="flex flex-col items-center p-6 bg-white border rounded-xl hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Trending Now</h2>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50">
            View All Products <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

       {/* FEATURES / TRUST BADGES */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y py-12">
        {[
          { icon: Truck, title: "Free Shipping", desc: "On orders over ৳5000" },
          { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected payments" },
          { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
          { icon: Clock, title: "24/7 Support", desc: "Dedicated support team" },
        ].map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <feature.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 5. NEWSLETTER CTA */}
      <section className="bg-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Join the Tech Revolution</h2>
          <p className="text-slate-300">Subscribe to our newsletter and get exclusive deals, early access to new drops, and a 10% coupon for your first order.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-full pl-6" 
            />
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 rounded-full px-8">Subscribe</Button>
          </div>
          <p className="text-xs text-slate-500">We care about your data in our privacy policy.</p>
        </div>
      </section>

    </div>
  );
}