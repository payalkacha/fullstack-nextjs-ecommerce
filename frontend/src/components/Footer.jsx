"use client";
import { useRouter } from "next/navigation";

const Footer = () => {
    const router = useRouter();

    return (
        <footer className="bg-zinc-50 dark:bg-zinc-900 border-t pt-16 pb-8 text-zinc-600 dark:text-zinc-400">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* BRAND & SOCIAL ICONS */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter cursor-pointer">Cartify</h2>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Elevating your lifestyle with premium products. We bring the best of e-commerce to your doorstep.
                        </p>

                        {/* SOCIAL ICONS ONLY */}
                        <div className="flex gap-3">
                            <SocialIconLink href="https://instagram.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </SocialIconLink>

                            <SocialIconLink href="https://twitter.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                            </SocialIconLink>

                            <SocialIconLink href="https://facebook.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                            </SocialIconLink>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[3px] text-zinc-900 dark:text-white mb-6">Explore</h4>
                        <ul className="text-sm space-y-3">
                            <li onClick={() => router.push("/")} className="hover:text-blue-600 cursor-pointer transition-colors w-fit">Home</li>
                            <li onClick={() => router.push("/shop")} className="hover:text-blue-600 cursor-pointer transition-colors w-fit">Shop All</li>
                            <li className="hover:text-blue-600 cursor-pointer transition-colors w-fit">Trending</li>
                        </ul>
                    </div>

                    {/* SUPPORT */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[3px] text-zinc-900 dark:text-white mb-6">Support</h4>
                        <ul className="text-sm space-y-3">
                            <li onClick={() => router.push("/order")} className="hover:text-blue-600 cursor-pointer transition-colors w-fit">Order Tracking</li>
                            <li className="hover:text-blue-600 cursor-pointer transition-colors w-fit">Privacy Policy</li>
                            <li onClick={() => router.push("/contact")} className="hover:text-blue-600 cursor-pointer transition-colors w-fit">Contact Us</li>
                        </ul>
                    </div>

                    {/* CONTACT INFO */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[3px] text-zinc-900 dark:text-white mb-6">Connect</h4>
                        <p className="text-sm mb-2 font-medium">📧 support@cartify.com</p>
                        <p className="text-sm">📍 Surat, Gujarat, India</p>
                        <div className="mt-5 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 bg-blue-700 dark:bg-blue-400 rounded-full animate-pulse"></span>
                            LIVE SHOPPING OPEN
                        </div>
                    </div>
                </div>

                {/* COPYRIGHT AREA */}
                <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-bold tracking-[2px] uppercase text-zinc-400">
                        © {new Date().getFullYear()} Cartify. Built for Style & Comfort.
                    </p>
                </div>
            </div>
        </footer>
    );
};

// Simple Social Icon Wrapper for consistent styling
const SocialIconLink = ({ children, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-500 transition-all duration-300 active:scale-90"
    >
        {children}
    </a>
);

export default Footer;