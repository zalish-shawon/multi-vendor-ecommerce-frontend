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
import { Loader2, Lock, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  // 1. Safety: Default items to empty array if context is undefined
  const { items = [], cartTotal = 0, clearCart } = useCart() || {}; 
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      postalCode: ''
    }
  });

  // 2. Hydration Fix: Wait for component to mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Load User Data & Addresses
  useEffect(() => {
    if (!mounted) return;

    const loadUserData = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser) {
          toast.error('Please login to place an order');
          router.push('/login?redirect=/checkout');
          return;
        }

        // Fetch fresh profile from backend
        const res = await api.get('/profile/getProfile');
        const userData = res.data.user || res.data;
        
        setAddresses(userData.addresses || []);

        // Find Default Address
        const defaultAddr = userData.addresses?.find((a: any) => a.isDefault);

        // Update Form Values
        reset({
          name: userData.name || '',
          phone: userData.phone || '',
          address: defaultAddr?.details || '',
          city: defaultAddr?.city || '',
          postalCode: defaultAddr?.postalCode || ''
        });

      } catch (error) {
        console.error("Failed to load user data");
      }
    };

    loadUserData();
  }, [mounted, router, reset]);

  // 4. Cart Check (Only redirects after mount)
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items, router]);

  const shippingCost = 120;
  const totalAmount = cartTotal + shippingCost;

  // 5. Handle Address Selection
  const handleSelectAddress = (addr: any) => {
    setValue('address', addr.details);
    setValue('city', addr.city);
    setValue('postalCode', addr.postalCode);
    toast.success("Address selected!");
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const orderData = {
        products: items.map((item: any) => ({
          product_id: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: totalAmount,
        shipping_address: `${data.address}, ${data.city} - ${data.postalCode}`,
        phone: data.phone
      };

      const res = await api.post('/orders/create', orderData); // Changed endpoint to match standard REST usually

      if (res.data.url) {
        clearCart();
        window.location.href = res.data.url; 
      } else {
        toast.error('Payment gateway error');
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // 6. Loading States
  if (!mounted) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  
  if (items.length === 0) return null; // Logic handles redirect, this prevents flash

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Shipping Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <Card className="bg-slate-50 border-dashed">
              <CardHeader className="pb-3">
                 <CardTitle className="text-base flex items-center gap-2">
                   <MapPin className="h-4 w-4" /> Saved Addresses
                 </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr: any) => (
                  <div 
                    key={addr._id}
                    onClick={() => handleSelectAddress(addr)}
                    className="cursor-pointer border bg-white p-3 rounded-lg text-sm hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between font-medium">
                        <span>{addr.city}</span>
                        {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Default</span>}
                    </div>
                    <p className="text-slate-500 truncate">{addr.details}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
              {items.map((item: any) => (
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
                className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800" 
                form="checkout-form"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Place Order & Pay
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