"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Package,
    ArrowRight,
    Fingerprint,
    History
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/my-orders`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok || !data?.success) {
                if (data?.message === "token failed") {
                    console.error("Auth Error: Token missing or invalid");
                }
                throw new Error(data?.message || "Failed to load orders");
            }
            setOrders(data.data || []);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white italic text-[10px] tracking-[0.4em] uppercase text-zinc-400 animate-pulse font-black">
            Syncing Archives...
        </div>
    );

    return (
        <div className="bg-white min-h-screen pt-24 px-6 md:px-12 lg:px-24 pb-16 text-black">
            <div className="max-w-5xl mx-auto">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-[1px] bg-zinc-300"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Secure Records</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-black">
                            Archives.
                        </h1>
                        <p className="text-[10px] font-bold text-zinc-400 mt-4 max-w-xs leading-relaxed uppercase tracking-widest">
                            Official acquisition history for <span className="text-black underline underline-offset-4 decoration-zinc-200">Cartify</span>.
                        </p>
                    </div>

                    <div className="bg-zinc-100 border border-zinc-200 p-5 rounded-2xl flex items-center gap-10 shadow-sm">
                        <div>
                            <p className="text-[8px] uppercase tracking-[0.1em] font-black text-zinc-400 mb-1 italic">Total entries</p>
                            <p className="text-3xl font-black italic tracking-tighter text-black leading-none">
                                {String(orders.length).padStart(2, '0')}
                            </p>
                        </div>
                        <History size={20} className="text-zinc-300" />
                    </div>
                </div>

                {/* --- ORDERS LIST --- */}
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="py-20 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-[2rem]">
                            <Package className="mx-auto mb-4 text-zinc-200" size={32} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 italic">No historical data found</p>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const firstItem = order.items?.[0];
                            const product = firstItem?.product;
                            const displayImage = product?.images?.[0] || "/placeholder.png";
                            const displayName = product?.name || "Bespoke Item";

                            return (
                                <div
                                    key={order._id}
                                    className="bg-zinc-100/80 border border-zinc-200/60 p-3 rounded-[1.8rem]"
                                >
                                    <div className="bg-white border border-zinc-100 p-4 rounded-[1.4rem] flex flex-col md:flex-row gap-6 items-center">

                                        {/* IMAGE - Grayscale & Hover effect removed */}
                                        <div className="w-20 h-24 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-100">
                                            <img
                                                src={displayImage}
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "https://placehold.co/200x250/F4F4F5/A1A1AA?text=ITEM"; }}
                                            />
                                        </div>

                                        {/* INFO SECTION */}
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-4">
                                                <div className="text-center md:text-left">
                                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                        <Fingerprint size={12} className="text-zinc-300" />
                                                        <span className="text-[8px] font-black text-zinc-400 tracking-widest uppercase italic">REF: {order._id.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-black leading-tight">{displayName}</h2>
                                                    {order.items?.length > 1 && (
                                                        <p className="text-[8px] font-black text-zinc-400 uppercase mt-0.5 tracking-tighter">+ {order.items.length - 1} SUPPLEMENTARY ITEMS</p>
                                                    )}
                                                </div>

                                                <div className="text-center md:text-right">
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Total Amount</p>
                                                    <p className="text-2xl font-black italic tracking-tighter text-black leading-none">₹{order.totalPrice}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-zinc-50 gap-4">
                                                <div className="flex gap-8">
                                                    <div>
                                                        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest italic">Date</p>
                                                        <p className="text-[10px] font-black text-black uppercase italic">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest italic">Status</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-1 h-1 rounded-full ${order.status === 'Delivered' ? 'bg-black' : 'bg-zinc-300'}`}></div>
                                                            <span className="text-[10px] font-black uppercase text-black italic tracking-tighter">{order.status}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => router.push(`/order?id=${order._id}`)}
                                                    className="bg-black text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:scale-105 transition-transform flex items-center gap-2"
                                                >
                                                    Details <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}