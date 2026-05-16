"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, ArrowRight, RefreshCw, ShoppingBag } from "lucide-react";

function VerifyContent() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            return toast.error("Enter valid OTP");
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.message || "Invalid OTP");
                return;
            }

            toast.success("Account verified!");

            router.push("/login");

        } catch (err) {
            console.log(err);
            toast.error("Verification failed");
        } finally {
            setLoading(false);
        }
    };
    
    const handleResend = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) toast.success("New OTP sent!");
            else toast.error(data.message || "Failed to resend");
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-5 font-sans relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
            <div className="relative z-10 w-full max-w-[450px] bg-[#121214] rounded-[2.5rem] p-10 md:p-12 border border-zinc-800 shadow-2xl text-center">
                <div className="flex flex-col items-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                        <ShoppingBag size={24} className="text-black" />
                    </div>
                    <span className="text-sm font-black tracking-[0.3em] text-zinc-500 uppercase italic">Cartify Security</span>
                </div>
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3 flex items-center justify-center gap-3">
                        Verify Access <ShieldCheck className="text-zinc-600" size={28} />
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">
                        Code sent to: <span className="text-zinc-300 lowercase font-bold text-xs">{email || "your email"}</span>
                    </p>
                </div>
                <div className="space-y-8">
                    <div className="group">
                        <input
                            placeholder="000000"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-2xl py-6 px-4 text-center text-4xl font-black tracking-[10px] outline-none transition-all text-white placeholder:text-zinc-800 placeholder:tracking-normal"
                        />
                    </div>
                    <button onClick={handleVerify} disabled={loading} className={`w-full flex items-center justify-center gap-3 h-16 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.2em] ${loading ? "bg-zinc-800 text-zinc-600" : "bg-white text-black hover:bg-zinc-200"}`}>
                        {loading ? "Decrypting..." : <>Confirm Identity <ArrowRight size={18} /></>}
                    </button>
                    <button onClick={handleResend} className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white">
                        <RefreshCw size={14} /> Request New Token
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Verify() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}