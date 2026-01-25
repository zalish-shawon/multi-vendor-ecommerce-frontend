'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react'; // <--- Import useState
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // <--- Import Input
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from 'lucide-react'; // <--- Import Tag Icon
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState(''); // <--- State for input

  const handleApplyPromo = () => {
    if (!promoCode) return;
    // For now, just show a dummy message since backend isn't ready
    toast.info(`Promo code "${promoCode}" is not valid yet.`);
    setPromoCode('');
  };

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-slate-50 p-6 rounded-full">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-sm">
          Looks like you haven&apos;t added anything to your cart yet. Browse our products to find something you like.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 mt-4">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const shipping = 120;
  const tax = 0;
  const finalTotal = cartTotal + shipping + tax;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
              <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg line-clamp-1">
                    <Link href={`/product/${item._id}`} className="hover:underline">
                        {item.name}
                    </Link>
                </h3>
                <p className="text-sm text-muted-foreground">Unit Price: ৳{item.price}</p>
                <p className="text-xs text-green-600 font-medium">In Stock</p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right min-w-[80px]">
                <div className="font-bold text-lg">৳{(item.price * item.quantity).toLocaleString()}</div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 h-auto p-0 mt-1"
                    onClick={() => removeFromCart(item._id)}
                >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            </Card>
          ))}

          <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-0 bg-slate-50">
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping Estimate</span>
                        <span>৳{shipping}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>৳{tax}</span>
                    </div>
                    
                    {/* --- NEW PROMO CODE SECTION --- */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="Promo Code" 
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="bg-white"
                            />
                            <Button variant="outline" onClick={handleApplyPromo}>Apply</Button>
                        </div>
                    </div>

                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span className="text-blue-600">৳{finalTotal.toLocaleString()}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" asChild>
                        <Link href="/checkout">
                            Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
  );
}