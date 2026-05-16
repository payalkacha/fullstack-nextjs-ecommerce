"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast"; // અહીંથી { Toaster } કાઢી નાખ્યું છે
import { Mail, Lock, ArrowRight, ShoppingBag, Fingerprint, LayoutGrid, ShieldCheck } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return toast.error("Please fill all fields");

        setLoading(true);
        const toastId = toast.loading("Verifying credentials...");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setLoading(false);
                return toast.error(data.message || "Invalid credentials", { id: toastId });
            }

            const firstName = data.user.name.split(" ")[0];

            toast.success(`Access Granted. Welcome back, ${firstName}!`, {
                id: toastId
            });

            setTimeout(() => {
                window.dispatchEvent(new Event("authChanged"));

                data.user.role === "admin"
                    ? router.replace("/admin/dashboard")
                    : router.replace("/");

                router.refresh();
            }, 300);

        } catch (error) {
            setLoading(false);
            toast.error("Connection failed. Check terminal.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-5 font-sans relative overflow-hidden text-zinc-200">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>

            <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row bg-[#121214] rounded-[2rem] overflow-hidden border border-zinc-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">

                {/* LEFT SIDE: DESIGN */}
                <div className="w-full md:w-[40%] bg-zinc-900 p-10 flex flex-col justify-between border-r border-zinc-800">
                    <div>
                        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => router.push("/")}>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                                <ShoppingBag size={20} className="text-black" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white italic uppercase">Cartify</span>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-extrabold leading-[1.1] text-white tracking-tight">
                                Unified <br /> Commerce <br />
                                <span className="text-zinc-500 underline decoration-zinc-700 underline-offset-8">Interface.</span>
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-zinc-400 group cursor-default">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                                        <LayoutGrid size={16} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Inventory Control</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-400 group cursor-default">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Global Security</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">All Systems Operational</span>
                    </div>
                </div>

                {/* RIGHT SIDE: LOGIN FORM */}
                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-zinc-950/30">
                    <div className="max-w-[340px] mx-auto w-full">
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                Secure Terminal <Fingerprint size={24} className="text-zinc-600" />
                            </h3>
                            <p className="text-zinc-500 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">Identify to continue</p>
                        </div>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white transition-colors">Credential ID</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder="user@cartify.app"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-center ml-1 mb-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block group-focus-within:text-white transition-colors">Access Code</label>
                                    <button onClick={() => router.push("/forgot")} className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-700"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-3 h-14 rounded-xl transition-all font-black text-[11px] uppercase tracking-[0.2em] mt-8 ${loading
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : "bg-white text-black hover:bg-zinc-200 active:scale-[0.98] shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                                    }`}
                            >
                                {loading ? "Verifying..." : <>Establish Connection <ArrowRight size={16} /></>}
                            </button>
                        </div>

                        <div className="mt-12 text-center border-t border-zinc-900 pt-8">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                Need Authorization?
                                <button onClick={() => router.push("/signup")} className="ml-2 text-white hover:underline underline-offset-4 font-bold">Create System Profile</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}