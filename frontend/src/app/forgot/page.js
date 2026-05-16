"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, ArrowRight, ShoppingBag, Fingerprint, ChevronLeft } from "lucide-react";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            return toast.error("Please enter your registered email");
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await res.json();

            if (!res.ok || data.success === false) {
                toast.error(data.message || "Email not found");
                return;
            }

            toast.success("OTP sent!");

            router.push(`/reset?email=${encodeURIComponent(email)}`);

        } catch (error) {
            console.log(error);
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
                        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => router.push("/login")}>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                                <ShoppingBag size={20} className="text-black" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white italic uppercase">Cartify</span>
                        </div>
                        <h2 className="text-4xl font-extrabold leading-[1.1] text-white tracking-tight">
                            Forgot <br /> Access <br />
                            <span className="text-zinc-500 underline decoration-zinc-700 underline-offset-8">Terminal.</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Recovery Mode</span>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-zinc-950/30">
                    <div className="max-w-[340px] mx-auto w-full">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group text-[10px] font-black uppercase tracking-widest">
                            <ChevronLeft size={16} /> Return
                        </button>
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                Recovery <Fingerprint size={24} className="text-zinc-600" />
                            </h3>
                            <p className="text-zinc-500 text-xs mt-2 font-medium uppercase tracking-widest">Enter email to receive OTP</p>
                        </div>
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white transition-colors">Identity Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-700"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-3 h-14 rounded-xl transition-all font-black text-[11px] uppercase tracking-[0.2em] ${loading ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"}`}
                            >
                                {loading ? "Processing..." : <>Request OTP <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}