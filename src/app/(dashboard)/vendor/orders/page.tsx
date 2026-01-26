/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Eye } from 'lucide-react';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/vendor/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = (order: any) => {
    // Basic JS Print Logic - In real app, you might use a PDF library
    const printWindow = window.open('', '', 'width=800,height=600');
    if(printWindow) {
        printWindow.document.write(`
            <html>
                <head><title>Invoice #${order.transaction_id}</title></head>
                <body style="font-family: sans-serif; padding: 20px;">
                    <h1>Invoice</h1>
                    <p><strong>Order ID:</strong> ${order.transaction_id}</p>
                    <p><strong>Customer:</strong> ${order.customer?.name}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <hr/>
                    <table style="width: 100%; text-align: left;">
                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                        <tbody>
                            ${order.items.map((item: any) => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>৳${item.price}</td>
                                    <td>৳${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <hr/>
                    <h3>Total Due: ৳${order.vendor_total}</h3>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Order ID</TableHead>
              <TableHead>My Items</TableHead>
              <TableHead>My Earnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs">{order.transaction_id}</TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-slate-500">x{item.quantity}</span>
                        </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-green-600">৳{order.vendor_total}</TableCell>
                <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(order)}>
                    <Printer className="h-4 w-4 mr-2" /> Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}