/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'; // <--- MUST BE A CLIENT COMPONENT

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // 

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart(); // <--- 2. Get the function

  // 3. Handle Click (Prevent navigation when clicking the button)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link href={`/product/${product._id}`}>
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-xl h-full flex flex-col">
      {/* 1. IMAGE CONTAINER */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {/* Category Badge */}
        <span className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-white/90 text-xs font-bold text-gray-700 backdrop-blur-sm">
            {product.category}
          </Badge>
        </span>

        {/* Product Image */}
        <Image 
          src={product.images?.[0] || 'https://placehold.co/600x600/png?text=No+Image'} 
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
           <Button asChild size="icon" variant="secondary" className="rounded-full">
             <Link href={`/product/${product._id}`}><Eye className="h-4 w-4" /></Link>
           </Button>
        </div>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <Badge variant="destructive" className="text-sm px-4 py-1">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      {/* 2. CONTENT */}
      <CardContent className="p-4 flex-1">
        <Link href={`/product/${product._id}`}>
           <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
             {product.name}
           </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
           <div className="flex flex-col">
             <span className="text-xs text-muted-foreground">Price</span>
             <span className="font-bold text-xl text-blue-600">৳{product.price.toLocaleString()}</span>
           </div>
        </div>
      </CardContent>

      {/* 3. FOOTER (Now Wired Up) */}
      <CardFooter className="p-4 pt-0">
        <Button 
            className="w-full bg-slate-900 hover:bg-blue-600 transition-colors" 
            disabled={product.stock <= 0}
            onClick={handleAddToCart} // <--- 4. Attach Event
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}