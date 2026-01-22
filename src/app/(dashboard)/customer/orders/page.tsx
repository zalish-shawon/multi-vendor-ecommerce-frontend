/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order cancelled');
      fetchOrders(); // Refresh list
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  // Basic Pay Later Implementation (Redirect to checkout with same items)
  // Real implementation would reactivate the old transaction ID
  const handlePayNow = (order: any) => {
    toast.info("Redirection to payment gateway...");
    // Ideally call an endpoint like /api/orders/retry/${order._id}
    // For now, we inform the user this feature is tied to the backend
  };

  if (loading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.map((order: any) => (
        <Card key={order._id}>
          <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">ID: {order.transaction_id}</p>
            </div>
            <div className="flex gap-2">
               {/* Status Badge */}
               <Badge className={order.payment_status === 'Success' ? 'bg-green-600' : 'bg-orange-500'}>
                 {order.payment_status === 'Success' ? 'Paid' : 'Pending Payment'}
               </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
             <div className="flex justify-between items-center">
               <div className="space-y-1">
                 {order.products.map((p: any, i: number) => (
                   <div key={i}>{p.product_id?.name} (x{p.quantity})</div>
                 ))}
               </div>
               <div className="text-right">
                 <p className="text-xl font-bold">৳{order.total_amount}</p>
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex justify-end gap-3 mt-6">
               {order.status === 'Pending' && order.payment_status !== 'Success' && (
                 <>
                   <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleCancel(order._id)}>
                     Cancel Order
                   </Button>
                   <Button onClick={() => handlePayNow(order)}>
                     Pay Now
                   </Button>
                 </>
               )}
               {order.payment_status === 'Success' && (
                 <Button variant="outline">View Invoice</Button>
               )}
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}