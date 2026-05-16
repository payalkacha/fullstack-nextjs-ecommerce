"use client";
import { useCart } from "@/context/Cartcontext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Navbar = () => {
    const { cartCount, fetchCart } = useCart();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {

        const checkLogin = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 401) {
                    setIsLoggedIn(false);
                    return;
                }

                const data = await res.json();

                if (data.success) {
                    setIsLoggedIn(true);
                    await fetchCart();
                } else {
                    setIsLoggedIn(false);
                }

            } catch {
                setIsLoggedIn(false);
            }
        };

        const handleCartUpdate = () => {
            fetchCart();
        };

        checkLogin();

        const handleScroll = () => setScrolled(window.scrollY > 20);

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("authChanged", checkLogin);
        window.addEventListener("cartUpdated", handleCartUpdate);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("authChanged", checkLogin);
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };

    }, [fetchCart]);

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            window.dispatchEvent(new Event("authChanged"));
            setIsLoggedIn(false);
            toast.success("Logged out successfully");
            router.replace("/login");
            router.refresh();
        } catch {
            toast.error("Logout failed");
        }
        setMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        router.push(`/shop?search=${search.trim()}`);
        setSearch("");
    };

    const handleProtectedNavigation = (path) => {
        if (!isLoggedIn) {
            toast.error("Please login first!");
            router.push("/login");
        } else {
            router.push(path);
        }
        setMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-sm py-2" : "bg-zinc-50 dark:bg-zinc-900 py-4"}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                {/* LOGO */}
                <div className="group flex items-center gap-1 cursor-pointer" onClick={() => router.push("/")}>
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">Cartify</h1>
                </div>

                {/* SEARCH - Desktop */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-10 relative group">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-white dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-zinc-800 rounded-full py-2 px-10 text-sm transition-all outline-none text-zinc-900 dark:text-zinc-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <SearchIcon className="absolute left-3 top-2.5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                </form>

                {/* LINKS & ACTIONS */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-8 text-[12px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        <NavLink onClick={() => router.push("/")} label="Home" />
                        <NavLink onClick={() => router.push("/shop")} label="Shop" />
                        <NavLink onClick={() => handleProtectedNavigation("/orders")} label="Orders" />
                        <NavLink onClick={() => router.push("/contact")} label="Contact" />
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 border-l pl-6 border-zinc-200 dark:border-zinc-700">

                        {/* Wishlist Icon - No Count Badge */}
                        <NavIconButton onClick={() => handleProtectedNavigation("/wishlist")}>
                            <HeartIcon />
                        </NavIconButton>

                        {/* Cart Icon - With Count Badge */}
                        <NavIconButton onClick={() => handleProtectedNavigation("/cart")} className="relative">
                            <CartIcon />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-zinc-50 dark:border-zinc-900">
                                    {cartCount}
                                </span>
                            )}
                        </NavIconButton>

                        {/* AUTH SECTION */}
                        <div className="hidden sm:flex items-center gap-2 ml-2">
                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => router.push("/profile")} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-900 dark:text-zinc-100">
                                        <ProfileIcon />
                                    </button>
                                    <button onClick={handleLogout} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-5 py-2 rounded-full text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => router.push("/login")} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-md">
                                    Login
                                </button>
                            )}
                        </div>

                        <button className="lg:hidden p-2 ml-2 text-zinc-900 dark:text-zinc-100" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE OVERLAY */}
            <div className={`fixed inset-0 bg-zinc-50 dark:bg-zinc-900 z-[-1] flex flex-col items-center justify-center gap-8 text-2xl font-black transition-all duration-500 ease-in-out ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
                <button className="hover:text-blue-600 text-zinc-900 dark:text-zinc-100 transition-colors" onClick={() => { router.push("/"); setMenuOpen(false) }}>HOME</button>
                <button className="hover:text-blue-600 text-zinc-900 dark:text-zinc-100 transition-colors" onClick={() => { router.push("/shop"); setMenuOpen(false) }}>SHOP</button>
                <button className="hover:text-blue-600 text-zinc-900 dark:text-zinc-100 transition-colors" onClick={() => { handleProtectedNavigation("/wishlist") }}>WISHLIST</button>
                <button className="hover:text-blue-600 text-zinc-900 dark:text-zinc-100 transition-colors" onClick={() => handleProtectedNavigation("/orders")}>ORDERS</button>

                <div className="h-[1px] w-20 bg-zinc-200 dark:bg-zinc-700 my-2"></div>

                {isLoggedIn ? (
                    <>
                        <button className="hover:text-blue-600 text-zinc-900 dark:text-zinc-100 transition-colors" onClick={() => { router.push("/profile"); setMenuOpen(false) }}>PROFILE</button>
                        <button className="text-red-500" onClick={handleLogout}>LOGOUT</button>
                    </>
                ) : (
                    <button onClick={() => { router.push("/login"); setMenuOpen(false) }} className="bg-blue-600 text-white px-10 py-3 rounded-2xl">LOGIN</button>
                )}
            </div>
        </nav>
    );
};

// Internal Components (Keep these at the bottom)
const NavLink = ({ label, onClick }) => (
    <button onClick={onClick} className="hover:text-blue-600 transition-colors relative group">
        {label}
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-600 transition-all group-hover:w-full rounded-full"></span>
    </button>
);

const NavIconButton = ({ children, onClick, className = "" }) => (
    <button onClick={onClick} className={`p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-90 text-zinc-900 dark:text-zinc-100 ${className}`}>{children}</button>
);

// ICONS
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
const SearchIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h2l1 10h11l1-8H6.5" /><circle cx="9" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></svg>
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M4 16h16" /></svg>
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>

export default Navbar;