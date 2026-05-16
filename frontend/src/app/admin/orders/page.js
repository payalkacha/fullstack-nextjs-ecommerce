"use client";

import { useEffect, useState } from "react";
import {
    Truck, ArrowUpRight, ShieldCheck, Activity,
    Inbox, User, LayoutGrid, CreditCard, CheckCircle, XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const router = useRouter();

    const fetchAllOrders = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/all-orders`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) setOrders(data.data);
        } catch (err) {
            toast.error("COMMUNICATION_ERROR");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllOrders(); }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/status/${orderId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`STATUS: ${newStatus.toUpperCase()}`);
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            toast.error("PROTOCOL_FAILED");
        }
    };

    const filteredOrders = filter === "All"
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filter.toLowerCase());

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-[#fcfcfc] min-h-screen pt-10 px-6 md:px-10 pb-16 text-zinc-800 font-sans">
            <div className="max-w-[1200px] mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-zinc-200 pb-8">
                    <div>
                        <h1 className="text-3xl font-[1000] tracking-tight uppercase leading-none text-zinc-900 italic">
                            Order_Register<span className="text-zinc-300">.</span>
                        </h1>
                        <p className="text-[9px] font-black text-zinc-400 tracking-[0.25em] mt-2 uppercase">Cartify Logistics Database</p>
                    </div>

                    {/* Filter Buttons - Added Cancelled */}
                    <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit border border-zinc-200">
                        {["All", "Paid", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((t) => (
                            <button
                                key={t} onClick={() => setFilter(t)}
                                className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === t
                                    ? "bg-zinc-900 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- ANALYTICS (Updated to 6 columns) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
                    {[
                        { label: "Total Orders", value: orders.length, icon: Inbox },
                        { label: "Paid Orders", value: orders.filter(o => o.status?.toLowerCase() === "paid").length, icon: CreditCard },
                        { label: "Confirmed", value: orders.filter(o => o.status?.toLowerCase() === "confirmed").length, icon: CheckCircle },
                        { label: "In Shipping", value: orders.filter(o => o.status?.toLowerCase() === "shipped").length, icon: Truck },
                        { label: "Delivered", value: orders.filter(o => o.status?.toLowerCase() === "delivered").length, icon: ShieldCheck },
                        { label: "Cancelled", value: orders.filter(o => o.status?.toLowerCase() === "cancelled").length, icon: XCircle },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:border-zinc-300 transition-all group">
                            <div className="flex items-center gap-3 mb-3 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                                <item.icon size={15} strokeWidth={2.5} />
                                <span className="text-[8px] font-black tracking-widest uppercase opacity-50">Metric_0{i + 1}</span>
                            </div>
                            <p className="text-2xl font-[1000] italic tracking-tighter text-zinc-900 leading-none">{item.value}</p>
                            <p className="text-[10px] font-bold uppercase text-zinc-500 mt-2 tracking-widest">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 italic">Customer</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900">Order Date</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 text-center">Amount</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 text-center">Status</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order._id} className="group hover:bg-zinc-50/30 transition-all">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                <User size={16} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black uppercase tracking-tight text-zinc-900 leading-tight">{order.user?.name || "Guest User"}</span>
                                                <span className="text-[9px] text-zinc-300 font-bold tracking-widest uppercase">ID: {order._id.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="text-md font-black italic tracking-tighter text-zinc-900">₹{order.totalPrice.toLocaleString()}</span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-transparent outline-none cursor-pointer transition-all ${order.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                order.status === "Confirmed" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    order.status === "Delivered" ? "bg-zinc-900 text-white" :
                                                        order.status === "Cancelled" ? "bg-red-50 text-red-600 border-red-100" :
                                                            "bg-zinc-100 text-zinc-900"
                                                }`}
                                        >
                                            {["Paid", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => router.push(`/admin/orders/${order._id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-black transition-all shadow-sm active:scale-95 group/btn"
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest">View Details</span>
                                            <ArrowUpRight size={13} strokeWidth={3} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-20 text-zinc-400">
                                            <LayoutGrid size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No Orders Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}