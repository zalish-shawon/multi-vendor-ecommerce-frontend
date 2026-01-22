/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  if (!order) return <div className="p-20 text-center">Invoice not found</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container max-w-4xl mx-auto">
        
        {/* Actions Bar (Hidden when printing) */}
        <div className="flex justify-end items-center mb-6 print:hidden">
          {/* <Button variant="outline" asChild>
             <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Orders</Link>
          </Button> */}
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>

        {/* Invoice Paper */}
        <Card className="p-10 bg-white shadow-xl print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">NEXUS<span className="text-blue-600">MARKET</span></h1>
               <p className="text-slate-500 text-sm mt-1">Premium Electronics Store</p>
               <p className="text-slate-500 text-sm">Dhaka, Bangladesh</p>
            </div>
            <div className="text-right">
               <h2 className="text-xl font-bold text-slate-700">INVOICE</h2>
               <p className="text-slate-500 mt-1">#{order.transaction_id}</p>
               <p className="text-sm text-slate-500 mt-1">
                 Date: {new Date(order.createdAt).toLocaleDateString()}
               </p>
               <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                 {order.payment_status?.toUpperCase()}
               </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-8 py-8">
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Bill To:</h3>
              <p className="text-slate-600 font-medium">{(order.user_id as any)?.name}</p>
              <p className="text-slate-500 text-sm">{(order.user_id as any)?.email}</p>
              <p className="text-slate-500 text-sm">{order.phone}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-700 mb-2">Ship To:</h3>
              <p className="text-slate-500 text-sm whitespace-pre-line text-right max-w-xs ml-auto">
                {order.shipping_address}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 text-slate-700">Item</th>
                  <th className="py-3 text-slate-700 text-center">Quantity</th>
                  <th className="py-3 text-slate-700 text-right">Price</th>
                  <th className="py-3 text-slate-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-4 text-slate-700">
                      {item.product_id?.name || "Product Info Unavailable"}
                    </td>
                    <td className="py-4 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-700">৳{item.price}</td>
                    <td className="py-4 text-right font-medium text-slate-900">
                      ৳{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>৳{order.total_amount - 120}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>৳120</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>৳{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-slate-500 text-sm">
            <p>Thank you for your business!</p>
            <p>For questions about this invoice, contact support@nexusmarket.com</p>
          </div>

        </Card>
      </div>
    </div>
  );
}