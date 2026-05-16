"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Star,
    ShoppingBag,
    ShieldCheck,
    Truck,
    RefreshCcw,
    CheckCircle2,
    ChevronRight
} from "lucide-react";
import { useCart } from "@/context/Cartcontext";

export default function ProductDetails() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [product, setProduct] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

    const { setCart } = useCart();

    // ADDTOCART
    const handleAddToCart = async (product) => {
        if (!product) return;
        setIsAdding(true);
        const tId = toast.loading("Adding to bag...");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/addtocart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1,
                }),
            });

            // html response mokle to khbar padi jase
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server Error:", errorText);
                throw new Error("Invalid Server Response");
            }

            const data = await res.json();

            if (res.status === 401) {
                toast.error("Please login first!", { id: tId });
                router.push("/login");
                return;
            }

            if (data.success) {
                setCart(data.data);
                toast.success(`${product.name} added to bag!`, { id: tId });
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                toast.error(data.message || "Failed to add", { id: tId });
            }
        } catch (err) {
            console.error("Cart API Error:", err);
            toast.error("Something went wrong with the server", { id: tId });
        } finally {
            setIsAdding(false);
        }
    };

    // review fetch kre
    const fetchReviews = async (productId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review/get/${productId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                setReviews(data.data.reviews || []);
                setAvgRating(data.data.averageRating || 0);
            }
        } catch (err) {
            console.error("Review Fetch Error:", err);
        }
    };

    // prduction data load 
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/fetch/${id}`);
                if (!res.ok) throw new Error("Product not found");

                const data = await res.json();
                if (data.success) {
                    setProduct(data.data);
                    fetchReviews(id);

                    // Related Products
                    const relRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/get?category=${data.data.category}&limit=6`);
                    if (relRes.ok) {
                        const relData = await relRes.json();
                        setRelatedItems(relData.products?.filter(p => p._id !== id).slice(0, 5) || []);
                    }
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                toast.error("Error loading product");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return (
        <div className="text-center pt-40 font-medium text-zinc-400 uppercase tracking-widest">
            Product Not Found
        </div>
    );

    return (
        <div className="bg-[#FCFCFC] min-h-screen pb-10 text-zinc-900 selection:bg-black selection:text-white font-sans">
            <div className="max-w-[1300px] mx-auto px-4 md:px-10 pt-12 md:pt-20">

                {/* BREADCRUMB */}
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.5px] text-zinc-400 mb-6 border-b border-zinc-100 pb-4">
                    <span className="hover:text-black cursor-pointer transition-colors" onClick={() => router.push('/')}>Shop</span>
                    <ChevronRight size={10} className="text-zinc-300" />
                    <span>{product.category}</span>
                    <ChevronRight size={10} className="text-zinc-300" />
                    <span className="text-black">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* LEFT: IMAGE GALLERY */}
                    <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:sticky lg:top-24">
                        <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images?.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`relative w-16 h-20 flex-shrink-0 rounded-xl overflow-hidden border transition-all duration-300 ${activeImg === i ? "border-black ring-2 ring-zinc-100 scale-95" : "border-transparent opacity-40 hover:opacity-100"}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                                </button>
                            ))}
                        </div>
                        <div className="order-1 md:order-2 flex-1 max-w-[550px] mx-auto w-full aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm relative group">
                            <img
                                src={product.images?.[activeImg]}
                                className="w-full h-full object-contain p-6 md:p-10 transition-transform duration-1000 group-hover:scale-110"
                                alt={product.name}
                            />
                        </div>
                    </div>

                    {/* RIGHT: PRODUCT INFO PANEL */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-zinc-400 mb-2 block">{product.category}</span>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-4 leading-tight">{product.name}</h1>

                            <div className="flex items-center gap-4 mb-6 flex-wrap">
                                <span className="text-3xl font-black tracking-tighter text-black">₹{product.price.toLocaleString()}</span>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${product.stock > 0 ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                                    <CheckCircle2 size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-wider">{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-full">
                                    <Star size={12} className="fill-white" />
                                    <span className="text-xs font-bold">{avgRating.toFixed(1)}</span>
                                </div>
                            </div>

                            <div className="mb-6 border-t border-zinc-50 pt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[2px] text-zinc-400 mb-2">The Story</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                                    {product.description || "Crafted for excellence and designed with precision."}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 0 || isAdding}
                                    className="w-full bg-zinc-900 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[2px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:bg-zinc-200"
                                >
                                    <ShoppingBag size={18} /> {product.stock > 0 ? (isAdding ? "Adding..." : "Add to Bag") : "Out of Stock"}
                                </button>
                                <button
                                    onClick={() => router.push(`/checkout?productId=${product._id}`)}
                                    disabled={product.stock <= 0}
                                    className="w-full border-2 border-zinc-100 text-zinc-900 py-4 rounded-xl text-[11px] font-black uppercase tracking-[2px] hover:bg-zinc-50 transition-all active:scale-[0.98]"
                                >
                                    Instant Checkout
                                </button>
                            </div>
                        </div>

                        {/* SERVICE HIGHLIGHTS */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { icon: ShieldCheck, label: "Warranty" },
                                { icon: Truck, label: "Shipping" },
                                { icon: RefreshCcw, label: "Returns" }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
                                    <item.icon size={18} className="text-zinc-900" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="mt-16 pt-12 border-t border-zinc-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tighter uppercase mb-1">Customer Experiences</h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[3px]">Honest feedback from owners</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-zinc-100">
                            <div className="text-3xl font-black">{avgRating.toFixed(1)}</div>
                            <div className="h-8 w-[1px] bg-zinc-100"></div>
                            <div>
                                <div className="flex gap-0.5 mb-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < Math.round(avgRating) ? "fill-black text-black" : "text-zinc-200"} />
                                    ))}
                                </div>
                                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{reviews.length} Reviews</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.length > 0 ? (
                            reviews.map((rev) => (
                                <div key={rev._id} className="bg-white p-6 rounded-3xl border border-zinc-50 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-[10px] uppercase">
                                            {rev.user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-black uppercase tracking-tight">{rev.user?.name || "User"}</h4>
                                            <p className="text-[9px] font-bold text-zinc-300 uppercase">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 text-md font-medium leading-relaxed italic mb-3">"{rev.comment}"</p>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < rev.rating ? "fill-black text-black" : "text-zinc-100"} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[4px]">No reviews yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RELATED PRODUCTS */}
                <div className="mt-16 pt-12 border-t border-zinc-100">
                    <h2 className="text-[11px] font-black uppercase tracking-[4px] mb-8">You May Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {relatedItems.map((item) => (
                            <div key={item._id} onClick={() => router.push(`/product/${item._id}`)} className="group cursor-pointer">
                                <div className="aspect-[4/5] bg-white rounded-[1.5rem] overflow-hidden mb-3 border border-zinc-100 shadow-sm relative">
                                    <img src={item.images?.[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />
                                </div>
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 truncate tracking-[1px] mb-2">{item.name}</h3>
                                <p className="text-sm font-black text-black">₹{item.price.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}