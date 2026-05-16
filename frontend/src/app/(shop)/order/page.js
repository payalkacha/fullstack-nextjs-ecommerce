"use client";

import { useEffect, useState, useCallback, Suspense } from "react"; // 👈 Suspense import karyu
import { useSearchParams, useRouter } from "next/navigation";
import {
    MoveLeft,
    MapPin,
    CreditCard,
    Phone,
    XCircle,
    Star,
    MessageSquarePlus,
    CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

// 1. Tamara main code nu nam badli ne 'OrderDetailsContent' kari didhu
function OrderDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("id");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Review States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewedProducts, setReviewedProducts] = useState([]);
    const API = process.env.NEXT_PUBLIC_API_URL;

    // ---------------- CHECK REVIEWS FUNCTION ----------------
    const checkReviews = useCallback(async (items, userId) => {
        const reviewedArray = [];
        try {
            await Promise.all(items.map(async (item) => {
                const productId = item.product?._id || item.product;
                if (!productId) return;

                try {
                    const reviewRes = await fetch(`${API}/api/review/get/${productId}`);
                    const reviewData = await reviewRes.json();

                    if (reviewData.success && reviewData.data.reviews) {
                        const alreadyReviewed = reviewData.data.reviews.find(
                            (r) => (r.user?._id || r.user) === userId
                        );
                        if (alreadyReviewed) {
                            reviewedArray.push(productId);
                        }
                    }
                } catch (err) {
                    console.error("Single review fetch error:", err);
                }
            }));
            setReviewedProducts(reviewedArray);
        } catch (err) {
            console.error("Check reviews error:", err);
        }
    }, [API]);

    // ---------------- FETCH ORDER ----------------
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                setLoading(true);
                const res = await fetch(`${API}/api/order/${orderId}`, {
                    credentials: "include"
                });
                const data = await res.json();

                if (!data.success) throw new Error(data.message);

                setOrder(data.data);

                // jo order deilver thyi gyo hoy to rivew section aapvu 
                if (data.data.status === "Delivered") {
                    const userId = data.data.user?._id || data.data.user;
                    checkReviews(data.data.items, userId);
                }

            } catch (err) {
                toast.error(err.message);
                if (err.message.includes("401")) router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router, checkReviews, API]);

    // ---------------- SUBMIT REVIEW ----------------
    const handleReviewSubmit = async () => {
        if (!comment.trim()) return toast.error("Please enter a comment");
        if (!selectedProduct?._id) return toast.error("Product ID missing");

        try {
            setIsSubmitting(true);
            const res = await fetch(`${API}/api/review/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    product: selectedProduct._id,
                    rating,
                    comment
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success("Review added successfully!");

            // UI ma chnage lava 
            setReviewedProducts((prev) => [...prev, selectedProduct._id]);

            // RESET & CLOSE
            setComment("");
            setRating(5);
            setIsModalOpen(false);
            setSelectedProduct(null);

        } catch (err) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white text-zinc-400 text-[10px] uppercase tracking-[0.5em] animate-pulse">Loading Order...</div>;
    if (!order) return <div className="h-screen flex items-center justify-center bg-white text-zinc-300 font-black uppercase">Order Not Found</div>;

    const steps = ["Pending", "Confirmed", "Paid", "Shipped", "Delivered"];
    const isCancelled = order.status === "Cancelled";
    const current = steps.indexOf(order.status);

    return (
        <div className="bg-white min-h-screen text-black pt-32 pb-24 px-6 md:px-12 lg:px-20">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => router.push("/orders")} className="flex items-center gap-2 text-zinc-500 hover:text-black mb-12 transition-colors">
                    <MoveLeft size={16} />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black">Back to Orders</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Side: Tracking & Items */}
                    <div className="lg:col-span-7">
                        <h1 className="text-5xl font-black italic uppercase mb-10 text-zinc-900 tracking-tighter">Order Tracking</h1>

                        <div className="mb-12">
                            {!isCancelled ? (
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                    {steps.map((step, i) => (
                                        <div key={step} className="flex flex-col items-center flex-1">
                                            <div className={`w-3 h-3 rounded-full mb-3 transition-colors duration-500 ${i <= current ? "bg-black" : "bg-zinc-200"}`} />
                                            <span className={i <= current ? "text-black" : "text-zinc-400"}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-red-500 text-sm font-black uppercase text-center tracking-widest border-2 border-red-50/50 py-6 rounded-2xl bg-red-50/30">
                                    Order Cancelled ❌
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-50/50 border border-zinc-100 rounded-[2rem] p-6 space-y-4">
                            {order?.items?.map((item, index) => {
                                const pId = item.product?._id || item.product;
                                const isAlreadyReviewed = reviewedProducts.includes(pId);

                                return (
                                    <div key={pId || index} className="bg-white border border-zinc-100 p-5 flex gap-6 rounded-2xl hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 group">
                                        <div className="w-24 h-28 bg-zinc-100 overflow-hidden rounded-xl">
                                            <img
                                                src={item.product?.images?.[0] || "/placeholder.png"}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-widest">{item.product?.name}</h4>
                                                <p className="text-[10px] text-zinc-400 mt-1 font-bold">QTY: {item.quantity}</p>
                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                <p className="text-xl font-black italic">₹{(item.product?.price || 0) * item.quantity}</p>

                                                {order.status === "Delivered" && (
                                                    isAlreadyReviewed ? (
                                                        <div className="bg-green-50 text-green-600 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100">
                                                            <CheckCircle2 size={12} /> Reviewed
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(item.product);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 active:scale-95"
                                                        >
                                                            <MessageSquarePlus size={12} /> Leave Review
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Summary Card */}
                    <div className="lg:col-span-5">
                        <div className="bg-zinc-100 border border-zinc-200 rounded-[2.5rem] p-8 sticky top-32">
                            <div className="flex justify-between mb-8 border-b border-zinc-200 pb-6">
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Order Status</span>
                                <span className="text-[10px] font-black uppercase bg-black text-white px-5 py-2 rounded-full tracking-widest">{order?.status}</span>
                            </div>

                            <div className="space-y-8 mb-10">
                                <div>
                                    <h3 className="text-[9px] text-zinc-400 flex gap-2 mb-3 uppercase font-black tracking-tighter"><MapPin size={12} /> Shipping Address</h3>
                                    <p className="text-sm font-black text-zinc-800">{order?.name}</p>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium mt-1">{order?.address}, {order?.city} - {order?.pincode}</p>
                                </div>
                                <div>
                                    <h3 className="text-[9px] text-zinc-400 flex gap-2 mb-3 uppercase font-black tracking-tighter"><Phone size={12} /> Contact Info</h3>
                                    <p className="text-[10px] font-black">+91 {order?.phone}</p>
                                </div>
                                <div>
                                    <h3 className="text-[9px] text-zinc-400 flex gap-2 mb-3 uppercase font-black tracking-tighter"><CreditCard size={12} /> Payment</h3>
                                    <p className="text-[10px] font-black uppercase">{order?.paymentMethod} • <span className={order?.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}>{order?.paymentStatus}</span></p>
                                </div>
                            </div>

                            <div className="border-t border-zinc-300 pt-8 flex justify-between items-end">
                                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Grand Total</span>
                                <span className="text-4xl font-black italic tracking-tighter">₹{order?.totalPrice || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- REVIEW MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-zinc-100">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-300 hover:text-black transition-colors"><XCircle size={28} /></button>

                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Review Product</h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">{selectedProduct?.name}</p>

                        <div className="space-y-10">
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] block mb-5">Rating</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setRating(star)} className="transform active:scale-75 transition-transform duration-200">
                                            <Star size={36} className={`transition-all duration-300 ${star <= rating ? "fill-black text-black scale-110" : "fill-zinc-100 text-zinc-100"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] block mb-3">Your Experience</label>
                                <textarea
                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-6 text-sm font-bold focus:border-black focus:bg-white outline-none transition-all h-36 resize-none placeholder:text-zinc-300 italic"
                                    placeholder="Tell others about this product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleReviewSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:bg-zinc-200 shadow-2xl shadow-zinc-200 active:scale-95"
                            >
                                {isSubmitting ? "Posting..." : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 2. Aa main export default function banayu jema tame Suspense boundary muki di
export default function OrderDetails() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white text-zinc-400 text-[10px] uppercase tracking-[0.5em] animate-pulse">Loading Order...</div>}>
            <OrderDetailsContent />
        </Suspense>
    );
}