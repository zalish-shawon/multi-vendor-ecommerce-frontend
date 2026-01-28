/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, Package, TrendingUp, Store } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data);
      } catch (error) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  // Transform Chart Data (Format Dates)
  const chartData = data?.revenueChart?.map((item: any) => ({
    name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: item.revenue,
    orders: item.orders
  })) || [];

  const cards = [
    {
      title: 'Total Revenue',
      value: `৳${data?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
      trend: '+12% from last month'
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: '+5 new today'
    },
    {
      title: 'Active Vendors',
      value: data?.totalVendors || 0,
      icon: Store,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: 'Verified Partners'
    },
    {
      title: 'Total Customers',
      value: data?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      trend: 'Active Accounts'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time platform insights and performance.</p>
        </div>
        <div className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full border shadow-sm">
           Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{card.value}</div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" /> {card.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid gap-4 md:grid-cols-7">
        
        {/* REVENUE CHART */}
        <Card className="col-span-4 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue performance for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `৳${value}`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b' }}
                        formatter={(value: number | undefined) => [value !== undefined ? `৳${value}` : '-', 'Revenue']}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                    <p>No revenue data for this week yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RECENT ORDERS LIST */}
        <Card className="col-span-3 border-slate-100 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions from customers.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
             <div className="space-y-6">
                {data?.recentOrders?.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">No orders found.</p>
                ) : (
                    data?.recentOrders?.map((order: any) => (
                        <div key={order._id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border bg-slate-50">
                                    <AvatarFallback className="text-xs font-bold text-slate-600">
                                        {order.customer_id?.name?.substring(0,2).toUpperCase() || 'GU'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-900 leading-none">
                                        {order.customer_id?.name || "Guest User"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {order.customer_id?.email}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-slate-900">৳{order.total_amount}</div>
                                <Badge 
                                   variant="outline" 
                                   className={`text-[10px] px-1.5 py-0 h-5 mt-1 ${
                                      order.payment_status === 'Paid' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                   }`}
                                >
                                   {order.payment_status}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}