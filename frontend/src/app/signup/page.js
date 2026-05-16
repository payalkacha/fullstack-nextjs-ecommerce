"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, ShoppingBag, User, Fingerprint, LayoutGrid, ShieldCheck } from "lucide-react";

export default function Signup() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSignup = async () => {
        if (!form.name || !form.email || !form.password) {
            return toast.error("Please fill all fields");
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(form),
                }
            );

            console.log("Status:", res.status);        
            const data = await res.json();
            console.log("Response:", data);           

            if (!res.ok || !data.success) {
                toast.error(data.message || "Signup failed");
                return;
            }

            toast.success("OTP sent successfully!");

            router.push(`/verify?email=${encodeURIComponent(form.email)}`);

        } catch (err) {
            console.log("Error:", err);               
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-5 font-sans relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
            <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row bg-[#121214] rounded-[2rem] overflow-hidden border border-zinc-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                {/* LEFT SIDE */}
                <div className="w-full md:w-[40%] bg-zinc-900 p-10 flex flex-col justify-between border-r border-zinc-800">
                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                                <ShoppingBag size={20} className="text-black" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white italic uppercase">Cartify</span>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-extrabold leading-[1.1] text-white tracking-tight">
                                Join the <br /> Digital <br />
                                <span className="text-zinc-500 underline decoration-zinc-700 underline-offset-8">Ecosystem.</span>
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-zinc-400 group cursor-default">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                                        <LayoutGrid size={16} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Global Network</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-400 group cursor-default">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">End-to-End Security</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Registration Node Active</span>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-zinc-950/30">
                    <div className="max-w-[340px] mx-auto w-full">
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                New Profile <Fingerprint size={24} className="text-zinc-600" />
                            </h3>
                            <p className="text-zinc-500 text-xs mt-2 font-medium uppercase tracking-widest">Register your credentials</p>
                        </div>
                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white transition-colors">Full Identity</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
                                    <input name="name" type="text" placeholder="Enter your name" onChange={handleChange} className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-700" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white transition-colors">System Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
                                    <input name="email" type="email" placeholder="name@company.com" onChange={handleChange} className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-700" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white transition-colors">Access Code</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
                                    <input name="password" type="password" placeholder="••••••••" onChange={handleChange} className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-700" />
                                </div>
                            </div>
                            <button onClick={handleSignup} disabled={loading} className={`w-full flex items-center justify-center gap-3 h-14 rounded-xl transition-all font-black text-[11px] uppercase tracking-[0.2em] mt-6 ${loading ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"}`}>
                                {loading ? "Registering..." : <>Initialize Account <ArrowRight size={16} /></>}
                            </button>
                        </div>
                        <div className="mt-10 text-center border-t border-zinc-900 pt-8">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                Already Registered?
                                <button onClick={() => router.push("/login")} className="ml-2 text-white hover:underline underline-offset-4 font-bold">Access Terminal</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}