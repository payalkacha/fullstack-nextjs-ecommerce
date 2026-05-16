"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, Box, ShoppingCart, Star, LogOut,
    MessageSquare, Users, ChevronRight
} from "lucide-react";

export default function AdminLayout({ children }) {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success && data.user.role === "admin") {
                    setAdmin(data.user);
                    setLoading(false);
                } else {
                    router.replace("/login");
                }
            } catch (error) {
                router.replace("/login");
            }
        };
        verifyAdmin();
    }, [router]);

    const handleLogout = async () => {
        try {
            // 1. Backend ma request moklo jethi cookie delete thai jay
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setAdmin(null);
                router.push("/login"); // 2. Login page par mokli do
            }
        } catch (error) {
            console.error("Logout error:", error);
            // Jo error ave to pan safety mate login par mokli devu
            router.push("/login");
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#FDFDFD]">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    const menuItems = [
        { name: "Overview", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
        { name: "Inventory", icon: <Box size={18} />, path: "/admin/products" },
        { name: "Shipments", icon: <ShoppingCart size={18} />, path: "/admin/orders" },
        { name: "Customers", icon: <Users size={18} />, path: "/admin/users" },
        { name: "Inquiries", icon: <MessageSquare size={18} />, path: "/admin/contacts" },
        { name: "Reviews", icon: <Star size={18} />, path: "/admin/reviews" },
    ];

    return (
        <div className="flex min-h-screen bg-[#FAFAFB] text-zinc-900 font-sans antialiased">

            {/* --- SIDEBAR (Updated to Zinc-100) --- */}
            <aside className="w-72 bg-zinc-100 fixed h-full z-50 flex flex-col border-r border-zinc-200">
                <div className="h-24 flex items-center px-10">
                    <h2 className="text-2xl font-black tracking-[-0.05em] text-zinc-900 uppercase">
                        CARTIFY<span className="text-emerald-500">.</span>
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.15em] mb-6 px-6">Main Interface</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.name} href={item.path}
                                className={`group flex items-center justify-between px-6 py-3.5 rounded-2xl text-[13px] font-semibold transition-all duration-300 ${isActive
                                    ? "bg-zinc-950 text-white shadow-xl translate-x-1"
                                    : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50 hover:translate-x-1"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-950"}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight size={14} className="opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-4 text-zinc-500 font-bold text-[11px] uppercase tracking-widest hover:text-red-600 transition-all border border-zinc-200 rounded-2xl hover:bg-red-50 hover:border-red-100 group"
                    >
                        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="ml-72 flex-1 flex flex-col">

                {/* --- HEADER (Matching Zinc-100) --- */}
                <header className="h-24 bg-zinc-100 border-b border-zinc-200 sticky top-0 z-40 px-12 flex items-center justify-between">
                    <div>
                        <h1 className="font-black text-2xl tracking-tight text-zinc-900">
                            Admin Dashboard
                        </h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Control Panel • Real-time Stats</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 bg-white/50 py-2 px-5 rounded-2xl border border-zinc-200 shadow-sm">
                            <div className="text-right">
                                <p className="text-[12px] font-black text-zinc-900 leading-none capitalize">{admin?.name}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter italic">Active Now</span>
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-zinc-200 mx-1"></div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-white">
                                {admin?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- MAIN PAGE AREA --- */}
                <main className="p-12 min-h-[calc(100vh-6rem)]">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out text-zinc-900">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}