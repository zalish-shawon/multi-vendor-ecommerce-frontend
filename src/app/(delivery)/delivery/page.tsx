/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, User, Package, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Status Update State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      // This endpoint fetches orders assigned to the logged-in user
      const res = await api.get('/orders/my-deliveries');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return toast.error("Please select a status");
    
    setUpdating(true);
    try {
      await api.put('/orders/status', {
        orderId: selectedOrder._id,
        status: newStatus,
        note: note
      });
      toast.success("Status updated successfully");
      setIsDialogOpen(false);
      fetchDeliveries(); // Refresh list
      setNote('');
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Helper for Badge Colors
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  if (loading) return <div className="p-10 text-center">Loading jobs...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">My Deliveries</h1>
        <Badge variant="outline" className="px-3 py-1 text-base">
          {orders.length} Active Jobs
        </Badge>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-600">No active deliveries assigned.</h3>
          <p className="text-slate-400">Wait for the admin to assign new orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                   <CardTitle className="text-lg font-mono text-slate-700">
                     #{order.transaction_id}
                   </CardTitle>
                   <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                     <Clock className="h-3 w-3" /> 
                     Assigned: {new Date(order.updatedAt).toLocaleDateString()}
                   </p>
                </div>
                <Badge className={getStatusColor(order.order_status)}>
                  {order.order_status}
                </Badge>
              </CardHeader>
              
              <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
                {/* Customer Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Customer Details</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{order.user_id?.name || 'Guest'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span>{order.shipping_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">{order.phone}</a>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                   <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Order Info</h4>
                   <div className="flex justify-between border-b pb-2">
                     <span>Total Amount (COD/Paid)</span>
                     <span className="font-bold">৳{order.total_amount}</span>
                   </div>
                   <div className="space-y-1">
                      {order.products.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-slate-500 text-xs">
                           <span>{item.product_id?.name} x {item.quantity}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 p-4 flex justify-end">
                <Dialog open={isDialogOpen && selectedOrder?._id === order._id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) {
                        setSelectedOrder(order);
                        setNewStatus(order.order_status);
                    }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-slate-900 hover:bg-slate-800">
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Delivery Status</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                       <div className="space-y-2">
                          <Label>Current Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-2">
                          <Label>Add a Note (Optional)</Label>
                          <Textarea 
                            placeholder="e.g. Package left at front desk..." 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                       </div>

                       <Button 
                         onClick={handleUpdateStatus} 
                         className="w-full" 
                         disabled={updating}
                       >
                         {updating ? 'Updating...' : 'Confirm Update'}
                       </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}