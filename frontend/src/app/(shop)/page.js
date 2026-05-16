"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Hover cycling state
  const [hoveredId, setHoveredId] = useState(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const heroData = [
    { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600", title: "CORE ARCHIVE", sub: "Curated essentials for your daily lifestyle." },
    { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600", title: "TECH MINIMAL", sub: "Next-gen innovation with sleek aesthetics." },
    { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1600", title: "URBAN STEP", sub: "Premium footwear designed for absolute comfort." }
  ];

  const categories = [
    { name: "Fashion", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80" },
    { name: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80" },
    { name: "Books", img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=80" },
    { name: "Footwear", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80" },
    { name: "Accessories", img: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=300&q=80" }
  ];

  // 1. Wishlist fetching from API
  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/get`, { credentials: "include" });
      const data = await res.json();
      if (data.success && data.wishlist?.product) {
        // IDs ne array ma convert kare
        const ids = data.wishlist.product.map(p => typeof p === 'object' ? p._id.toString() : p.toString());
        setWishlistItems(ids);
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/get?limit=50&sort=new`);
        const data = await res.json();
        if (!isMounted) return;
        if (data.success) {
          const unique = [];
          const seen = new Set();
          for (const prod of data.products) {
            if (!seen.has(prod.category)) {
              unique.push(prod);
              seen.add(prod.category);
            }
            if (unique.length === 5) break;
          }
          setProducts(unique);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchWishlist();

    window.addEventListener("wishlistUpdated", fetchWishlist);

    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % heroData.length), 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
      window.removeEventListener("wishlistUpdated", fetchWishlist);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (hoveredId) {
      interval = setInterval(() => setActiveImgIdx(p => (p + 1) % 3), 1200);
    } else {
      setActiveImgIdx(0);
    }
    return () => clearInterval(interval);
  }, [hoveredId]);

  // 2. Optimized Toggle Function with Dynamic Toast Messages
  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();

    const wasWishlisted = wishlistItems.includes(productId);

    // Optimistic UI Update: તરત જ હાર્ટની સ્ટેટ બદલી નાખો
    setWishlistItems(prev => wasWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]);

    const toastStyle = {
      borderRadius: '12px',
      background: '#1e1e1e',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 20px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId })
      });

      if (res.status === 401) {
        setWishlistItems(prev => wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
        toast.error("Please login first", { style: toastStyle });
        return router.push("/login");
      }

      const data = await res.json();

      if (data.success) {
        // (wasWishlisted: true), remove thyi gyu em
        if (wasWishlisted) {
          toast("Removed from wishlist", {
            icon: '🗑️',
            style: toastStyle,
          });
        } else {
          toast("Added to wishlist", {
            icon: '❤️',
            style: toastStyle,
          });
        }
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {

        setWishlistItems(prev => wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
        toast.error("Failed to update wishlist", { style: toastStyle });
      }
    } catch (error) {
      setWishlistItems(prev => wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
      toast.error("Connection error", { style: toastStyle });
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-slate-900 font-sans overflow-x-hidden">

      {/* HERO SECTION */}
      <section className="relative h-[65vh] lg:h-[90vh] w-full overflow-hidden bg-black">
        {heroData.map((hero, idx) => (
          <div key={idx} className={`absolute inset-0 transition-all duration-[1500ms] ${idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}>
            <img src={hero.url} className="w-full h-full object-cover opacity-60" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-700 ${idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter mb-6 uppercase leading-tight">{hero.title}</h1>
              <p className="text-white/70 text-xs lg:text-sm tracking-[0.3em] uppercase mb-10 font-bold">{hero.sub}</p>
              <button onClick={() => router.push('/shop')} className="px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl">
                Explore Now
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORY BAR */}
      <section className="max-w-7xl mx-auto px-4 -translate-y-1/2 z-40 relative">
        <div className="flex gap-4 lg:gap-12 overflow-x-auto no-scrollbar justify-start md:justify-center items-center py-4">
          {categories.map((cat, i) => (
            <div key={i} onClick={() => router.push(`/shop?category=${cat.name}`)} className="flex-shrink-0 flex flex-col items-center group cursor-pointer">
              <div className="w-24 h-24 lg:w-36 lg:h-36 rounded-full p-1 bg-white shadow-2xl group-hover:scale-110 transition-all duration-500 border border-slate-100 overflow-hidden">
                <img src={cat.img} className="w-full h-full object-cover rounded-full transition-all duration-500 group-hover:opacity-80" alt={cat.name} />
              </div>
              <span className="mt-4 text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT FEED */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.4em]">Elite Picks</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mt-3 leading-none">Essential Collection</h2>
          </div>
          <button onClick={() => router.push('/shop')} className="text-xs font-black text-slate-400 uppercase tracking-widest border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 transition-all">Explore All</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {loading ?
            [1, 2, 3, 4, 5].map(n => <div key={n} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-[3rem]" />) :
            products.map((item) => (
              <div
                key={item._id}
                onMouseEnter={() => setHoveredId(item._id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer relative"
              >
                <button
                  onClick={(e) => toggleWishlist(e, item._id)}
                  className="absolute top-5 right-5 z-30 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm hover:bg-white active:scale-90 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlistItems.includes(item._id) ? "#ef4444" : "none"} stroke={wishlistItems.includes(item._id) ? "#ef4444" : "currentColor"} strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                <div onClick={() => router.push(`/product/${item._id}`)}>
                  <div className="relative aspect-[4/5] m-2 rounded-[2rem] bg-[#f8f9fb] overflow-hidden">
                    <img
                      src={hoveredId === item._id && item.images?.[activeImgIdx] ? item.images[activeImgIdx] : item.images?.[0] || "/fallback.png"}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      alt={item.name}
                    />
                    {hoveredId === item._id && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                        {[0, 1, 2].map((i) => <div key={i} className={`h-1 w-3 rounded-full ${activeImgIdx === i ? 'bg-blue-600' : 'bg-white/40'}`} />)}
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-2">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{item.category}</span>
                    <h3 className="text-sm font-bold text-slate-800 truncate mb-4 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">₹{item.price?.toLocaleString()}</span>
                      <div className="h-10 w-10 bg-slate-900 text-white flex items-center justify-center rounded-xl group-hover:bg-blue-600 transition-all">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="bg-white py-20 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { i: "✨", t: "Supreme Quality", s: "Handpicked for excellence" },
            { i: "🚚", t: "Express Delivery", s: "Fastest shipping across India" },
            { i: "🎧", t: "24/7 Support", s: "Dedicated help anytime" },
            { i: "💳", t: "Secure Checkout", s: "Encrypted & safe payments" }
          ].map((box, i) => (
            <div key={i} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-all text-4xl transform group-hover:rotate-6">
                {box.i}
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{box.t}</h4>
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold italic">{box.s}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}