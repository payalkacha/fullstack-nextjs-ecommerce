"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Printer, Phone,
    Package, ShieldCheck, CreditCard, Truck, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/${id}`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setOrder(data.order || data.data);
            } else {
                toast.error("Order details not found");
            }
        } catch (err) {
            toast.error("Server connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchOrder(); }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white font-sans">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <p className="mt-4 text-[10px] font-black tracking-[0.3em] text-black uppercase italic">Cartify_Loading...</p>
        </div>
    );

    if (!order) return <div className="p-20 text-center uppercase font-black text-black">Order Not Found</div>;

    return (
        <div className="bg-[#f8f8f8] min-h-screen py-10 px-4 antialiased font-sans">

            {/* CRITICAL FIX: Aa CSS Sidebar ane uper na header ne 
               pan hide kari deshe bhale te Layout file ma hoy.
            */}
            <style jsx global>{`
                @media print {
                    /* 1. Hide EVERYTHING except our receipt */
                    body * { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    
                    /* 2. Position receipt at the very top-left */
                    .print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                    }

                    /* 3. Hide Sidebar/Navbars of your Admin Panel */
                    header, nav, aside, footer, .no-print, button {
                        display: none !important;
                        height: 0 !important;
                        width: 0 !important;
                    }

                    /* 4. Page settings to prevent extra blank pages */
                    @page {
                        size: auto;
                        margin: 5mm;
                    }
                    body { background: white !important; }
                }
            `}</style>

            {/* Top Controls (No-Print) */}
            <div className="max-w-[850px] mx-auto mb-6 flex justify-between items-center no-print">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-all">
                    <ArrowLeft size={16} /> Dashboard
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-3 bg-black text-white px-8 py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 shadow-xl active:scale-95 transition-all"
                >
                    <Printer size={16} /> PRINT INVOICE
                </button>
            </div>

            {/* Official Invoice Document (Print-Section) */}
            <div className="max-w-[850px] mx-auto bg-white border border-zinc-200 shadow-2xl overflow-hidden print-section">

                {/* Header */}
                <div className="p-10 border-b-4 border-black flex justify-between items-start">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-[1000] tracking-tighter text-black italic">CARTIFY.</h1>
                        <div className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest w-fit">
                            ORDER_{order.status}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-black uppercase tracking-widest opacity-40">Invoice Reference</p>
                        <p className="font-mono text-sm font-black text-black">
                            #{String(order._id).toUpperCase().slice(-12)}
                        </p>
                    </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-2 border-b border-zinc-100">
                    <div className="p-10 border-r border-zinc-100">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6 flex items-center gap-2">
                            <Truck size={14} /> Shipping_To
                        </h2>
                        <div className="space-y-2">
                            <p className="text-xl font-[1000] text-black uppercase italic leading-none">{order.name}</p>
                            <p className="text-[12px] font-bold text-black leading-relaxed uppercase">
                                {order.address},<br />
                                {order.city} - {order.pincode}<br />
                                GUJARAT, INDIA
                            </p>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-black uppercase">
                                <Phone size={12} className="text-zinc-300" /> {order.phone}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-zinc-50/50">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6 flex items-center gap-2">
                            <CreditCard size={14} /> Payment_Details
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Method</p>
                                <p className="text-sm font-black text-black uppercase italic">
                                    {order.paymentMethod === "ONLINE" ? "RAZORPAY_PREPAID" : "CASH_ON_DELIVERY"}
                                </p>
                            </div>
                            <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black text-black w-fit">
                                {order.paymentStatus}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black text-white text-[8px] font-black uppercase tracking-[0.4em]">
                            <th className="px-10 py-5">Product_Manifest</th>
                            <th className="px-6 py-5 text-center">Qty</th>
                            <th className="px-10 py-5 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td className="px-10 py-6">
                                    <p className="text-xs font-[1000] text-black uppercase italic tracking-tight">{item.name}</p>
                                    <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">SKU-00{index + 101}</p>
                                </td>
                                <td className="px-6 py-6 text-center text-xs font-black text-black font-mono italic">{item.quantity}</td>
                                <td className="px-10 py-6 text-right text-xs font-[1000] text-black font-mono">₹{item.price?.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total Summary */}
                <div className="flex border-t-2 border-black">
                    <div className="flex-1 p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-4 p-4 border border-zinc-200 bg-white w-fit">
                            <ShieldCheck className="text-black" size={24} />
                            <p className="text-[10px] font-black text-black uppercase tracking-widest italic">Official_Authentic_Manifest</p>
                        </div>
                    </div>
                    <div className="w-full md:w-96 p-10 border-l border-zinc-100">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-black uppercase tracking-tighter text-black">Total_Amount:</span>
                            <span className="text-4xl font-[1000] italic tracking-tighter text-black">
                                ₹{order.totalPrice?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 bg-black text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Package size={20} className="text-zinc-600" />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] italic text-zinc-400">Computer_Generated_Copy</p>
                    </div>
                    <p className="text-[10px] font-black uppercase italic tracking-widest opacity-40">Cartify_V1.0</p>
                </div>
            </div>
        </div>
    );
}