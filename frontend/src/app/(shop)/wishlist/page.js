"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const WishlistPage = () => {
    const router = useRouter();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. Wishlist data fetch function ---
    const fetchWishlistData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/get`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (res.status === 401) {
                toast.error("Please login to see your wishlist");
                return router.push("/login");
            }

            const data = await res.json();
            if (data.success) {
                // product null nathi check
                setWishlistProducts(data.wishlist?.product || []);
            }
        } catch (err) {
            console.error("Wishlist error:", err);
            toast.error("Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. page load thay tayre data reload thay e check kro ---
    useEffect(() => {
        fetchWishlistData();

        const handleUpdate = () => fetchWishlistData();
        window.addEventListener("wishlistUpdated", handleUpdate);

        return () => window.removeEventListener("wishlistUpdated", handleUpdate);
    }, []);

    // --- 3. Item Remove  (Optimistic Update) ---
    const handleRemove = async (id, name) => {
        const previousItems = [...wishlistProducts];
        // UI mathi hatavo
        setWishlistProducts(prev => prev.filter(item => item._id !== id));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: id })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`${name} removed from wishlist`, {
                    icon: '🗑️',
                    style: { borderRadius: '12px', background: '#1a1a1a', color: '#fff', fontSize: '12px' }
                });
                window.dispatchEvent(new Event("wishlistUpdated"));
            } else {
                setWishlistProducts(previousItems);
                toast.error("Failed to remove item");
            }
        } catch (error) {
            setWishlistProducts(previousItems);
            toast.error("Network error. Try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Cartify...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans">

            {/* --- Premium Header --- */}
            <div className="bg-white border-b border-gray-100 pt-24 pb-10">
                <div className="max-w-[1300px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">My Wishlist</h1>
                        <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">
                            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'} saved in Cartify
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/shop')}
                        className="text-[10px] font-extrabold uppercase tracking-widest bg-black text-white px-7 py-3.5 rounded-full hover:bg-white hover:text-black border-2 border-black transition-all duration-300 shadow-lg shadow-black/5 active:scale-95"
                    >
                        Explore More
                    </button>
                </div>
            </div>

            {/* --- Wishlist Grid --- */}
            <div className="max-w-[1300px] mx-auto px-6 mt-10">
                {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {wishlistProducts.map((item) => (
                            <div key={item._id} className="group bg-white rounded-[32px] p-4 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 border border-gray-50 flex flex-col relative h-full">

                                {/* Image Container */}
                                <div
                                    className="relative aspect-square bg-[#f9f9f9] rounded-[24px] overflow-hidden cursor-pointer"
                                    onClick={() => router.push(`/product/${item._id}`)}
                                >
                                    <img
                                        src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder.png"}
                                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                                        alt={item.name}
                                    />
                                    {/* Remove Heart Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(item._id, item.name);
                                        }}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all duration-300 group/btn"
                                    >
                                        <svg className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content Details */}
                                <div className="mt-5 px-1 flex-grow flex flex-col justify-between">
                                    <div>
                                        <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">{item.category}</span>
                                        <h3 className="text-[15px] font-bold text-gray-800 line-clamp-1 mt-0.5 group-hover:text-black transition-colors">{item.name}</h3>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                        <p className="text-[18px] font-black text-gray-900 tracking-tight">₹{item.price?.toLocaleString()}</p>
                                        <button
                                            onClick={() => router.push(`/product/${item._id}`)}
                                            className="h-10 px-5 bg-gray-950 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-black transition-all active:scale-90"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- Empty State --- */
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[50px] border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-3xl">
                            🖤
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Your wishlist is empty</h2>
                        <p className="text-gray-400 mt-2 mb-10 text-xs font-medium">Save your favorite items to see them here.</p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="bg-black text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
                        >
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;