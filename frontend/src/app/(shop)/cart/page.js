"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react"; // install lucide-react if not already

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [isClearing, setIsClearing] = useState(false);
    const router = useRouter();

    const fetchCart = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/get`, { credentials: "include" });
            const data = await res.json();
            if (data.success) setCart(data.data);
        } catch (err) {
            toast.error("Network issue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);

    const updateQty = async (id, qty) => {
        if (qty < 1) return;
        setUpdatingId(id);

        // Instant UI Update
        const updatedItems = cart.items.map(item =>
            item.product._id === id ? { ...item, quantity: qty } : item
        );
        setCart({ ...cart, items: updatedItems });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: id, quantity: qty })
            });
            if (!res.ok) throw new Error();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            fetchCart(); // Rollback if failed
            toast.error("Failed to update");
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (id) => {
        const tId = toast.loading("Removing...");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/remove/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                // Direct UI filter - NO REFRESH NEEDED
                setCart(prev => ({
                    ...prev,
                    items: prev.items.filter(i => i.product._id !== id)
                }));
                toast.success("Removed", { id: tId });
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) { toast.error("Error", { id: tId }); }
    };

    const handleClearCart = async () => {
        if (!confirm("Discard all items?")) return;
        setIsClearing(true);
        const tId = toast.loading("Clearing...");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/clear`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                setCart({ items: [] }); // Instant UI Clear
                toast.success("Bag cleared", { id: tId });
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) { toast.error("Failed", { id: tId }); }
        finally { setIsClearing(false); }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white italic font-bold text-xs tracking-widest text-zinc-400 animate-pulse">
            LOADING ASSETS...
        </div>
    );

    if (!cart || cart.items.length === 0) return (
        <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-300 mb-6 italic">Inventory is void</p>
            <button onClick={() => router.push("/")} className="text-xs font-black border-b-2 border-black pb-1 uppercase tracking-widest hover:text-zinc-500 transition-all">Back to Store</button>
        </div>
    );

    const subtotal = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    return (
        <div className="bg-white min-h-screen text-black pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">

                {/* --- Header --- */}
                <div className="flex justify-between items-end border-b-2 border-black pb-8 mb-16">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Inventory.</h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-2">{cart.items.length} ARCHIVED OBJECTS</p>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="text-[10px] font-black uppercase tracking-widest text-black border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-all"
                    >
                        {isClearing ? "Wiping..." : "Discard All"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* --- Items List --- */}
                    <div className="lg:col-span-7 space-y-12">
                        {cart.items.map((item) => (
                            <div key={item.product._id} className="group flex flex-col sm:flex-row gap-10 pb-12 border-b border-zinc-100 last:border-0 relative">

                                <div className="w-full sm:w-44 h-56 bg-zinc-50 flex-shrink-0 border border-zinc-100 overflow-hidden rounded-sm">
                                    <img
                                        src={item.product.images?.[0]}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={item.product.name}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-lg font-black uppercase tracking-tight leading-tight w-5/6">
                                                {item.product.name}
                                            </h2>
                                            <button onClick={() => removeItem(item.product._id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                                                <X size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">REF ID: {item.product._id.slice(-8).toUpperCase()}</p>
                                    </div>

                                    <div className="flex items-end justify-between mt-8">
                                        <div className="flex items-center border-2 border-black h-10">
                                            <button onClick={() => updateQty(item.product._id, item.quantity - 1)} className="w-10 h-full flex items-center justify-center text-sm font-bold hover:bg-black hover:text-white transition-all disabled:opacity-20" disabled={updatingId === item.product._id}>—</button>
                                            <span className="w-10 text-center text-xs font-black border-x-2 border-black h-full flex items-center justify-center">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.product._id, item.quantity + 1)} className="w-10 h-full flex items-center justify-center text-sm font-bold hover:bg-black hover:text-white transition-all disabled:opacity-20" disabled={updatingId === item.product._id}>+</button>
                                        </div>
                                        <p className="text-2xl font-black italic tracking-tighter leading-none">₹{item.product.price * item.quantity}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- Order Summary (Grey Version) --- */}
                    <div className="lg:col-span-5 h-fit sticky top-32">
                        <div className="bg-zinc-100 p-10 rounded-sm border border-zinc-200">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-black opacity-40 italic border-b border-zinc-200 pb-4">Manifest Summary</h3>

                            <div className="space-y-6 mb-12">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                                    <span>Subtotal</span>
                                    <span className="text-black">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="text-zinc-500">Shipping</span>
                                    <span className="text-green-600 italic">FREE</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-12 pt-10 border-t-2 border-zinc-200">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-40">Final Value</span>
                                <span className="text-4xl font-black tracking-tighter italic leading-none">₹{subtotal}</span>
                            </div>

                            <button
                                onClick={() => router.push("/checkout")}
                                className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.6em] hover:bg-zinc-800 transition-all active:scale-[0.98] rounded-sm shadow-xl"
                            >
                                Secure Checkout
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}