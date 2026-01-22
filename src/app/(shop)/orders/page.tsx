/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { AuthService } from "@/services/auth.service";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  //   console.log(orders);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders");
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (AuthService.getCurrentUser()) {
      fetchOrders();
    } else {
      window.location.href = "/login";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto mb-4 bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders found</h2>
        <p className="text-slate-500 mb-6">
          Looks like you haven&apos;t bought anything yet.
        </p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order: any) => (
          <Card key={order._id} className="overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Order Placed
                </p>
                <p className="text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Total
                </p>
                <p className="text-sm font-medium">৳{order.total_amount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Order #
                </p>
                <p className="text-sm font-mono text-slate-600">
                  {order.transaction_id}
                </p>
              </div>
              <div>
                {/* Status Badge Logic */}
                {order.payment_status === "Success" ? (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="destructive">Unpaid / Failed</Badge>
                )}
              </div>
              {/* INVOICE BUTTON */}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/invoice/${order._id}`}>Invoice</Link>
              </Button>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                {order.products.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {/* If we populated product details, show image. Fallback to name */}
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative">
                        {/* Ideally show image here if populated */}
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          IMG
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.product_id?.name || "Product Info Unavailable"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">৳{item.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
