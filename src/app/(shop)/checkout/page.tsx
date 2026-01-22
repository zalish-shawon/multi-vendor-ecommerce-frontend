/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCart } from '@/context/CartContext';
import { AuthService } from '@/services/auth.service';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = AuthService.getCurrentUser();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      postalCode: ''
    }
  });

  // 1. Protect Route & Empty Cart Check
  useEffect(() => {
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [user, items, router]);

  const shippingCost = 120;
  const totalAmount = cartTotal + shippingCost;

  // 2. Handle Order Submission
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Prepare Payload for Backend
      const orderData = {
        products: items.map(item => ({
          product_id: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: totalAmount,
        shipping_address: `${data.address}, ${data.city} - ${data.postalCode}`,
        phone: data.phone
      };

      // Send to Backend
      const res = await api.post('/orders/create', orderData);

      if (res.data.url) {
        // SUCCESS: Clear cart and Redirect to SSLCommerz
        clearCart();
        toast.success('Redirecting to Payment Gateway...');
        window.location.href = res.data.url; 
      } else {
        toast.error('Something went wrong initiating payment.');
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Shipping Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...register('name', { required: true })} placeholder="John Doe" />
                    {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input {...register('phone', { required: true })} placeholder="017..." />
                    {errors.phone && <span className="text-red-500 text-xs">Phone is required</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...register('address', { required: true })} placeholder="House 12, Road 5, Block B" />
                  {errors.address && <span className="text-red-500 text-xs">Address is required</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input {...register('city', { required: true })} placeholder="Dhaka" />
                    {errors.city && <span className="text-red-500 text-xs">City is required</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input {...register('postalCode', { required: true })} placeholder="1212" />
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 bg-slate-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                  <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>৳{shippingCost}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-blue-600">৳{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" 
                form="checkout-form" // Connects button to form
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Pay Now
                  </>
                )}
              </Button>
            </CardFooter>
            <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
                Secured by SSLCommerz
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}