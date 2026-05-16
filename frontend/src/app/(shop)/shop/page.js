"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// --- 1. Product Card Component ---
const ProductCard = ({ item, onClick, isWishlisted, onWishlistToggle }) => {
    const [imgIndex, setImgIndex] = useState(0);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        let timer;
        if (hover && item.images?.length > 1) {
            timer = setInterval(() => {
                setImgIndex((prev) => (prev + 1) % item.images.length);
            }, 1200);
        } else {
            setImgIndex(0);
        }
        return () => clearInterval(timer);
    }, [hover, item.images]);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="group bg-white rounded-[24px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-100 flex flex-col h-full relative"
        >
            <div className="relative aspect-[4/5] bg-[#f9f9f9] rounded-[20px] overflow-hidden cursor-pointer" onClick={onClick}>
                <img
                    src={item.images?.[imgIndex] || item.images?.[0] || "/fallback.png"}
                    className="w-full h-full object-contain p-6 transition-all duration-700 group-hover:scale-110"
                    alt={item.name}
                />

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onWishlistToggle(item);
                    }}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm hover:bg-white transition-all active:scale-90"
                >
                    <svg
                        className={`w-5 h-5 transition-all duration-300 ${isWishlisted ? "fill-red-500 stroke-red-500 scale-110" : "fill-none stroke-black hover:stroke-red-500"}`}
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            <div className="mt-4 px-2 pb-2 flex-grow flex flex-col justify-between">
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{item.category}</span>
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mt-1 group-hover:text-black transition-colors">{item.name}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                    <p className="text-lg font-black text-gray-900 tracking-tight">₹{item.price?.toLocaleString()}</p>
                    <div className="h-9 w-9 bg-black rounded-xl flex items-center justify-center text-white md:opacity-0 md:group-hover:opacity-100 transition-all transform md:translate-x-2 md:group-hover:translate-x-0 cursor-pointer shadow-lg shadow-black/20" onClick={onClick}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. Main Shop Content ---
function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isMounted, setIsMounted] = useState(false); // Hydration Fix
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
    const [sortBy, setSortBy] = useState("newest");
    const [wishlist, setWishlist] = useState([]);

    const searchQuery = searchParams.get("search") || "";

    // Hydration fix: Only run after component mounts
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/get`, { credentials: "include" });
            const data = await res.json();
            if (data.success && data.wishlist?.product) {
                const ids = data.wishlist.product.map(p =>
                    typeof p === 'object' ? p._id.toString() : p.toString()
                );
                setWishlist(ids);
            }
        } catch (err) {
            console.error("Wishlist Fetch Error:", err);
        }
    };

    useEffect(() => {
        if (!isMounted) return;

        let active = true;
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/get?limit=100`);
                const prodData = await res.json();
                if (active && prodData.success) setProducts(prodData.products);
                await fetchWishlist();
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchData();

        window.addEventListener("wishlistUpdated", fetchWishlist);
        return () => {
            active = false;
            window.removeEventListener("wishlistUpdated", fetchWishlist);
        };
    }, [isMounted]);

    const handleWishlistToggle = async (item) => {
        const productId = item._id.toString();
        const wasWishlisted = wishlist.includes(productId);

        setWishlist(prev => wasWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]);

        const toastStyle = { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px', fontWeight: '500' };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId })
            });

            if (res.status === 401) {
                setWishlist(prev => wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
                toast.error("Please login first", { style: toastStyle });
                return router.push("/login");
            }

            const data = await res.json();
            if (data.success) {
                wasWishlisted ? toast("Removed from wishlist", { icon: '🗑️', style: toastStyle }) : toast("Added to wishlist", { icon: '❤️', style: toastStyle });
                window.dispatchEvent(new Event("wishlistUpdated"));
            } else {
                setWishlist(prev => wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
            }
        } catch (error) {
            setWishlist(prev => wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
        }
    };

    useEffect(() => {
        let temp = [...products];
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            temp = temp.filter((p) => p.name?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query));
        }
        if (activeCategory !== "All") {
            temp = temp.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
        }
        if (sortBy === "low") temp.sort((a, b) => a.price - b.price);
        else if (sortBy === "high") temp.sort((a, b) => b.price - a.price);
        else temp.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setFilteredProducts(temp);
    }, [activeCategory, sortBy, products, searchQuery]);

    const categories = ["All", "Fashion", "Electronics", "Books", "Footwear", "Accessories"];

    // Hydration mismatch rokava mate
    if (!isMounted) return null;

    return (
        <div className="bg-[#fcfcfc] min-h-screen font-sans overflow-x-hidden" suppressHydrationWarning>

            <div className="sticky top-[70px] z-[40] bg-white/90 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-6 py-5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-3 overflow-x-auto md:overflow-visible w-full md:w-auto pb-1 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-7 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat
                                        ? "bg-black text-white border-black shadow-xl shadow-black/10 scale-105"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-black appearance-none outline-none cursor-pointer shadow-sm"
                            >
                                <option value="newest">Sort By: Newest</option>
                                <option value="low">Price: Low to High</option>
                                <option value="high">Price: High to Low</option>
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-10 md:mt-20 pb-20">
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <div key={n} className="aspect-[4/5] bg-gray-100 rounded-[30px]" />)}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                        {filteredProducts.map((item) => (
                            <ProductCard
                                key={item._id}
                                item={item}
                                isWishlisted={wishlist.includes(item._id.toString())}
                                onWishlistToggle={handleWishlistToggle}
                                onClick={() => router.push(`/product/${item._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-[40vh] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">🔍</div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">No Products Found</h3>
                        <p className="text-gray-400 text-sm mt-2 font-medium">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Cartify Loading...</p></div></div>}>
            <ShopContent />
        </Suspense>
    );
}