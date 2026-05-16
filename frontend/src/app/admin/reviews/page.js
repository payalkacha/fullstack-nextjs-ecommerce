"use client";

import { useEffect, useState } from "react";
import { Trash2, Star, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/admin/all`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) setReviews(data.data || []);
        } catch (err) {
            toast.error("Backend connection failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will remove the feedback permanently.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/admin/delete/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Review successfully removed");
                setReviews(prev => prev.filter(r => r._id !== id));
            }
        } catch (err) { toast.error("Delete operation failed"); }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-black" size={35} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] text-slate-900 p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <ShieldCheck size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Cartify Authority</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase italic">
                            Feedback <span className="text-slate-300 not-italic">Logs</span>
                        </h1>
                    </div>

                    {/* TOTAL COMMENT COUNTER - BLACK THEME */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-slate-200 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-white border border-slate-200 pl-6 pr-2 py-2 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Total Records</span>
                                <span className="text-[10px] font-bold text-slate-900 opacity-60 italic">Live Feed</span>
                            </div>
                            <div className="bg-slate-950 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                <span className="text-xl font-black">{reviews.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- REVIEWS GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review._id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">

                                <div className="p-8 space-y-6">
                                    {/* USER HEADER */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                {review.user?.profilePic ? (
                                                    <img src={review.user.profilePic} className="w-full h-full object-cover" alt="User" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-lg">
                                                        {review.user?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-bold text-slate-900 leading-none mb-1">{review.user?.name || "Verified User"}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-100"} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* OFFICIAL RESPONSE BOX */}
                                    <div className="bg-[#F0F4FF] rounded-2xl p-6 relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 size={14} className="text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Official Feedback</span>
                                        </div>
                                        <p className="text-[15px] text-slate-700 font-medium leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    {/* LINKED PRODUCT REFERENCE */}
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 p-0.5 bg-white shadow-sm">
                                            <img src={review.product?.images?.[0]} className="w-full h-full object-cover rounded" alt="product" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Reference Product</p>
                                            <h5 className="text-[11px] font-bold text-slate-700 truncate uppercase">{review.product?.name || "Product Info"}</h5>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION FOOTER */}
                                <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-50 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors py-1 px-3 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Remove Review</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center">
                            <AlertCircle size={48} className="text-slate-200 mb-4" />
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300">Clean Slate: No Reviews Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}