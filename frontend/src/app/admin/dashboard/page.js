"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
    Users, Package, ShoppingBag, IndianRupee,
    AlertTriangle, TrendingUp, ExternalLink,
    ShoppingCart, CheckCircle2, Truck, CreditCard,
    LayoutDashboard, XOctagon, ChevronRight
} from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || "Failed to load");
                setStats(data.data);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
        return () => controller.abort();
    }, []);

    const safeStats = stats || {};

    const statusStyles = {
        Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
        Shipped: "bg-zinc-900 text-white border-zinc-800",
        Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    const orderLogistics = [
        { name: "Paid", count: safeStats.paidOrders || 0, icon: <CreditCard size={18} />, style: statusStyles.Paid },
        { name: "Confirmed", count: safeStats.confirmedOrders || 0, icon: <CheckCircle2 size={18} />, style: statusStyles.Confirmed },
        { name: "Shipped", count: safeStats.shippedOrders || 0, icon: <Truck size={18} />, style: statusStyles.Shipped },
        { name: "Delivered", count: safeStats.deliveredOrders || 0, icon: <ShoppingBag size={18} />, style: statusStyles.Delivered },
        { name: "Cancelled", count: safeStats.cancelledOrders || 0, icon: <XOctagon size={18} />, style: statusStyles.Cancelled },
    ];

    const chartData = useMemo(() => {
        return safeStats?.salesGraph || [
            { n: "Mon", s: 0 }, { n: "Tue", s: 0 }, { n: "Wed", s: 0 },
            { n: "Thu", s: 0 }, { n: "Fri", s: 0 }, { n: "Sat", s: 0 }, { n: "Sun", s: 0 }
        ];
    }, [safeStats]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-[3px] border-zinc-100 border-t-zinc-950 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto p-5 md:p-10 space-y-10 bg-[#FCFCFC] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-zinc-950 rounded-[1.2rem] flex items-center justify-center text-white shadow-2xl shadow-zinc-200">
                        <LayoutDashboard size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-zinc-900 italic">Cartify Hub</h2>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Management Overview</p>
                    </div>
                </div>
                <Link href="/" target="_blank" className="inline-flex items-center gap-2 bg-white border border-zinc-200 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm">
                    <ExternalLink size={14} /> Visit Store
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Revenue", value: `₹${(safeStats.totalRevenue || 0).toLocaleString()}`, icon: <IndianRupee size={22} />, dark: true },
                    { label: "Orders", value: safeStats.totalOrders || 0, icon: <ShoppingCart size={22} /> },
                    { label: "Products", value: safeStats.totalProducts || 0, icon: <Package size={22} /> },
                    { label: "Users", value: safeStats.totalUsers || 0, icon: <Users size={22} /> },
                ].map((card, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${card.dark ? "bg-zinc-950 border-zinc-900 text-white shadow-2xl shadow-zinc-300" : "bg-white border-zinc-100 text-zinc-900 shadow-sm"}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 ${card.dark ? "bg-zinc-800" : "bg-zinc-50"}`}>{card.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{card.label}</p>
                        <h3 className="text-4xl font-black mt-2 tracking-tighter italic">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Logistics */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2">Logistics Pipeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {orderLogistics.map((item, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] border ${item.style} flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105`}>
                            <div className="opacity-80">{item.icon}</div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{item.name}</span>
                                <span className="text-2xl font-black italic">{item.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders & Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-[3rem] p-8 md:p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Recent Transactions</h3>
                        <Link href="/admin/orders" className="p-3 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-all text-zinc-950"><ChevronRight size={18} /></Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.15em] border-b border-zinc-50">
                                    <th className="pb-6">ID</th>
                                    <th className="pb-6">Customer</th>
                                    <th className="pb-6">Status</th>
                                    <th className="pb-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {safeStats?.recentOrders?.map((order) => (
                                    <tr key={order?._id} className="group hover:bg-zinc-50/50">
                                        <td className="py-6 text-[11px] font-black text-zinc-900">#{order?._id?.slice(-6).toUpperCase()}</td>
                                        <td className="py-6 text-[11px] font-bold text-zinc-400 italic">{order?.user?.name || "Guest"}</td>
                                        <td className="py-6">
                                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${statusStyles[order?.status] || "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                                                {order?.status}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right text-xs font-black text-zinc-950 italic">₹{order?.totalPrice?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-orange-50 rounded-[3rem] p-8 border border-orange-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100"><AlertTriangle size={20} /></div>
                        <span className="text-[11px] font-black uppercase text-orange-900 tracking-widest">Low Stock Alert</span>
                    </div>
                    <div className="space-y-4">
                        {safeStats?.lowStockProducts?.length > 0 ? (
                            safeStats.lowStockProducts.map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-white rounded-[1.5rem] border border-orange-100/50">
                                    <span className="text-[11px] font-black text-zinc-700 truncate w-28 uppercase">{p?.name}</span>
                                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg italic">{p?.stock} left</span>
                                </div>
                            ))
                        ) : <p className="text-[10px] text-zinc-400 font-bold italic text-center py-10">Inventory is healthy.</p>}
                    </div>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white border border-zinc-100 rounded-[3rem] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" /> Revenue Growth
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-bold">Daily performance of your store</p>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: "#A1A1AA", fontSize: 11, fontWeight: 800 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#A1A1AA", fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="s" stroke="#18181b" strokeWidth={4} fill="url(#colorSales)" dot={{ r: 4, fill: "#18181b", strokeWidth: 2, stroke: "#fff" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl border border-white/10">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 italic tracking-widest">Earnings</p>
                <p className="text-lg font-black italic">₹{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};