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
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';

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
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell>
                    <Badge className={order.payment_status === 'Success' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-orange-100 text-orange-700 hover:bg-orange-100'}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm text-slate-600">{order.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
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
           <span className="text-sm text-slate-500 mr-2">
             Page {currentPage} of {totalPages}
           </span>
           <Button 
             variant="outline" 
             size="icon" 
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1}
           >
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button 
             variant="outline" 
             size="icon" 
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
           >
             <ChevronRight className="h-4 w-4" />
           </Button>
        </div>
      )}

      {/* --- DETAILS POPUP (MODAL) --- */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Transaction ID: {selectedOrder?.transaction_id}</DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Product List */}
              <div className="border rounded-md p-4 bg-slate-50 space-y-3 max-h-60 overflow-y-auto">
                {selectedOrder.products.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.product_id?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity} x ৳{item.price}</p>
                    </div>
                    <p className="font-bold">৳{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="flex justify-between items-center px-2">
                 <span className="text-slate-500">Total Amount</span>
                 <span className="text-xl font-bold text-blue-600">৳{selectedOrder.total_amount}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                 {selectedOrder.payment_status === 'Success' && (
                   <Button className="w-full gap-2" asChild>
                     <Link href={`/invoice/${selectedOrder._id}`}>
                        <FileText className="h-4 w-4" /> View Invoice
                     </Link>
                   </Button>
                 )}
            
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}