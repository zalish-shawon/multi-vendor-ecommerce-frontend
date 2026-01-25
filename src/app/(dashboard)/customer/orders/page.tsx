/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  CheckCircle2,
  Circle,
  Truck,
  Package,
  XCircle
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  // --- FILTER & PAGINATION LOGIC ---
  const filteredOrders = orders.filter((order) => 
    order.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- HELPER: GET BADGE COLORS ---
  const getDeliveryColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
      case 'Out for Delivery': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
      case 'Shipped': return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'; // Pending/Processing
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'Out for Delivery': return <Truck className="h-5 w-5 text-blue-600" />;
      case 'Shipped': return <Package className="h-5 w-5 text-orange-600" />;
      case 'Cancelled': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Circle className="h-5 w-5 text-slate-300" />;
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search Transaction ID..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              currentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-xs">{order.transaction_id}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold">৳{order.total_amount}</TableCell>
                  
                  {/* PAYMENT STATUS */}
                  <TableCell>
                    <Badge className={
                      order.payment_status === 'Success' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }>
                      {order.payment_status || 'Pending'}
                    </Badge>
                  </TableCell>

                  {/* DELIVERY STATUS */}
                  <TableCell>
                     <Badge variant="outline" className={`font-medium border ${getDeliveryColor(order.order_status)}`}>
                        {order.order_status || 'Pending'}
                     </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                     <Eye className="h-5 w-5 text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
           <span className="text-sm text-slate-500 mr-2">Page {currentPage} of {totalPages}</span>
           <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
             <ChevronRight className="h-4 w-4" />
           </Button>
        </div>
      )}

      {/* --- DETAILS POPUP (MODAL) --- */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Transaction ID: {selectedOrder?.transaction_id}</DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              
              {/* LEFT: Product List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Items</h3>
                <div className="border rounded-md p-4 bg-slate-50 space-y-3 max-h-60 overflow-y-auto">
                  {selectedOrder.products.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{item.product_id?.name || 'Unknown Product'}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">৳{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>৳{selectedOrder.total_amount}</span>
                </div>
              </div>

              {/* RIGHT: Tracking Timeline */}
              <div className="space-y-4">
                 <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Delivery Status</h3>
                 
                 <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 ml-2">
                    {(selectedOrder.tracking_history && selectedOrder.tracking_history.length > 0) ? (
                        selectedOrder.tracking_history.map((track: any, index: number) => (
                            <div key={index} className="relative">
                                <div className="absolute -left-[21px] top-0 bg-white p-1">
                                    {getStatusIcon(track.status)}
                                </div>
                                <div className="pl-2">
                                    <p className="font-bold text-sm">{track.status}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(track.updatedAt).toLocaleDateString()} {new Date(track.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    {track.note && <p className="text-xs text-slate-400 mt-1 italic">"{track.note}"</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="relative">
                             <div className="absolute -left-[21px] top-0 bg-white p-1">
                                <Circle className="h-5 w-5 text-blue-500 fill-blue-500" />
                            </div>
                            <div className="pl-2">
                                <p className="font-bold text-sm">{selectedOrder.order_status || 'Pending'}</p>
                                <p className="text-xs text-slate-500">Current Status</p>
                            </div>
                        </div>
                    )}
                 </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="col-span-1 md:col-span-2 flex gap-3 mt-4 border-t pt-4">
                 {selectedOrder.payment_status === 'Success' && (
                   <Button className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800" asChild>
                     <Link href={`/invoice/${selectedOrder._id}`}>
                        <FileText className="h-4 w-4" /> View Invoice
                     </Link>
                   </Button>
                 )}
                 <Button variant="secondary" className="flex-1" onClick={() => setSelectedOrder(null)}>
                   Close
                 </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}