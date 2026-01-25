/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, MapPin, User, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, driversRes] = await Promise.all([
        api.get("/admin/orders"),
        api.get("/admin/delivery-men"),
      ]);
      setOrders(ordersRes.data);
      setDeliveryMen(driversRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver) return toast.error("Select a driver");

    try {
      await api.post("/admin/orders/assign", {
        orderId: selectedOrder._id,
        deliveryManId: selectedDriver,
      });
      toast.success("Delivery Assigned Successfully!");
      setIsDialogOpen(false);
      fetchData(); // Refresh table
    } catch (error) {
      toast.error("Assignment Failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Badge variant="outline" className="px-3 py-1">
          {orders.length} Active Orders
        </Badge>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs font-medium">
                  {order.transaction_id}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {/* 👇 Update to order.customer_id.name */}
                    <span className="font-medium text-sm">
                      {order.customer_id?.name || "Guest"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {order.shipping_address?.substring(0, 20)}...
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  ৳{order.total_amount}
                </TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(order.order_status)}
                    variant="outline"
                  >
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.delivery_person_id ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {order.delivery_person_id.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={isDialogOpen && selectedOrder?._id === order._id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedOrder(order);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Truck className="h-4 w-4" /> Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Delivery Person</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="p-3 bg-slate-50 rounded text-sm space-y-1">
                          <p>
                            <span className="font-semibold">Order:</span> #
                            {order.transaction_id}
                          </p>
                          <p>
                            <span className="font-semibold">Location:</span>{" "}
                            {order.shipping_address}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Select Driver
                          </label>
                          <Select onValueChange={setSelectedDriver}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a delivery man..." />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryMen.map((man) => (
                                <SelectItem key={man._id} value={man._id}>
                                  {man.name} ({man.phone || "No Phone"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button onClick={handleAssign} className="w-full">
                          Confirm Assignment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
