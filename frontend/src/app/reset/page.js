"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, ShieldCheck, ArrowRight, ShoppingBag, Hash, Fingerprint, LayoutGrid } from "lucide-react";

function ResetContent() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email") || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!otp || otp.length < 4) {
            return toast.error("Valid OTP required");
        }

        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        otp,
                        newPassword,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.message || "Reset failed");
                return;
            }

            toast.success("Password reset successful!");

            router.push("/login");

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
                        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => router.push("/")}>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                                <ShoppingBag size={20} className="text-black" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white italic uppercase">Cartify</span>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-extrabold leading-[1.1] text-white tracking-tight">
                                Final <br /> Identity <br />
                                <span className="text-zinc-500 underline decoration-zinc-700 underline-offset-8">Update.</span>
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-zinc-400 group cursor-default">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Verification Node</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for override</span>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-zinc-950/30">
                    <div className="max-w-[340px] mx-auto w-full">
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                Reset Password <Fingerprint size={24} className="text-zinc-600" />
                            </h3>
                            <p className="text-zinc-500 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">Email: {email}</p>
                        </div>
                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white">OTP Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white" size={18} />
                                    <input
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none text-white font-bold"
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-white">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-white rounded-xl py-4 pl-12 pr-4 outline-none text-white font-bold"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-3 h-14 rounded-xl transition-all font-black text-[11px] uppercase tracking-[0.2em] mt-6 ${loading ? "bg-zinc-800 text-zinc-600" : "bg-white text-black hover:bg-zinc-200"}`}
                            >
                                {loading ? "Updating..." : <>Authorize Change <ArrowRight size={16} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Reset() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white font-black uppercase">Initializing Recovery...</div>}>
            <ResetContent />
        </Suspense>
    );
}