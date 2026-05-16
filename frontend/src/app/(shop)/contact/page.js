"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    MoveLeft, Send, HelpCircle, Package, CreditCard, Terminal,
    Activity, Fingerprint, ShieldCheck, MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";

const inquiryOptions = [
    { id: "General", label: "General", icon: <HelpCircle size={14} /> },
    { id: "Order", label: "Orders", icon: <Package size={14} /> },
    { id: "Payment", label: "Payment", icon: <CreditCard size={14} /> },
    { id: "Technical", label: "Tech", icon: <Terminal size={14} /> },
];

export default function ContactPage() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [inquiryType, setInquiryType] = useState("General");
    const [isAuth, setIsAuth] = useState(null);
    const [myTickets, setMyTickets] = useState([]);

    // Tickets fetch karvanu function (With cache busting)
    const fetchUserTickets = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/my-tickets`, {
                method: "GET",
                credentials: "include", // Cookie authorization mate
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            if (data.success) {
                // Latest ticket upar aave e rite sort karyu
                setMyTickets(data.data.reverse());
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    }, []);

    // Authentication check & Initial Data Load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { credentials: "include" });
                if (res.ok) {
                    setIsAuth(true);
                    fetchUserTickets(); // Auth confirm thay etle tickets load karo
                } else {
                    setIsAuth(false);
                    router.push("/login?redirect=/contact");
                }
            } catch (err) {
                setIsAuth(false);
                router.push("/login");
            }
        };
        checkAuth();
    }, [fetchUserTickets, router]);

    // Ticket Submit handle
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return toast.error("Please enter a message");

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/create`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, subject: inquiryType })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Ticket raised successfully!");
                setMessage("");
                // Navi ticket submit thaya pachi turant list refresh karo
                setTimeout(() => fetchUserTickets(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Server error, try again later");
        } finally {
            setLoading(false);
        }
    };

    if (isAuth === null) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Fingerprint size={32} className="text-zinc-200 animate-pulse" />
        </div>
    );

    return (
        <div className="bg-[#fcfcfc] min-h-screen text-zinc-900 pb-10 pt-24 font-sans">
            <main className="max-w-7xl mx-auto px-6">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-end mb-10 border-b border-zinc-100 pb-8">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-black mb-3 transition-all group">
                            <MoveLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest italic">Return</span>
                        </button>
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                            Cartify <span className="text-zinc-300">Support</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-zinc-200 px-5 py-2.5 rounded-full shadow-sm">
                        <Activity size={14} className="text-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Online</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* --- LEFT: FORM --- */}
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm sticky top-28">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] mb-6 text-zinc-400 italic">Initiate Inquiry</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {inquiryOptions.map((opt) => (
                                        <button
                                            key={opt.id} type="button"
                                            onClick={() => setInquiryType(opt.id)}
                                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${inquiryType === opt.id ? "bg-black text-white border-black" : "bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-300"}`}
                                        >
                                            {opt.icon} {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue..."
                                    rows={5}
                                    className="w-full bg-zinc-50 border border-zinc-100 p-6 rounded-[2rem] text-[13px] font-medium outline-none focus:bg-white focus:border-zinc-400 transition-all resize-none shadow-inner"
                                />
                                <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-2xl py-5 flex justify-center items-center gap-4 hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50">
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{loading ? "Sending..." : "Submit Ticket"}</span>
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- RIGHT: TICKETS --- */}
                    <div className="lg:col-span-7">
                        <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col h-[750px]">
                            <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Your Conversations</span>
                                <span className="text-[10px] font-bold bg-black text-white px-4 py-1.5 rounded-full italic">{myTickets.length} Tickets</span>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 space-y-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed custom-scrollbar">
                                {myTickets.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                        <MessageCircle size={48} className="mb-4" />
                                        <p className="italic text-[11px] uppercase tracking-[0.5em]">No History Found</p>
                                    </div>
                                ) : (
                                    myTickets.map((ticket) => (
                                        <div key={ticket._id} className="space-y-4">
                                            {/* User Message */}
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[9px] font-black text-zinc-300 uppercase">{new Date(ticket.createdAt).toLocaleString()}</span>
                                                    <span className="text-[10px] font-black uppercase bg-zinc-100 px-2 py-0.5 rounded text-zinc-500 italic">#{ticket.subject}</span>
                                                </div>
                                                <div className="max-w-[85%] bg-zinc-900 text-white p-5 rounded-[1.8rem] rounded-tr-none shadow-lg">
                                                    <p className="text-[13px] font-medium leading-relaxed">{ticket.message}</p>
                                                </div>
                                            </div>

                                            {/* Admin Reply */}
                                            <div className="flex flex-col items-start gap-2 mt-4">
                                                <div className="flex items-center gap-2 ml-4">
                                                    <div className={`w-2 h-2 rounded-full ${ticket.status === 'REPLIED' ? 'bg-green-500' : 'bg-amber-400 animate-pulse'} `}></div>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter italic text-zinc-400">
                                                        {ticket.status === 'REPLIED' ? 'Official Response' : 'Awaiting Admin Response'}
                                                    </span>
                                                </div>

                                                {ticket.adminReply ? (
                                                    <div className="max-w-[85%] bg-white border-2 border-zinc-100 p-5 rounded-[1.8rem] rounded-tl-none shadow-md flex gap-4">
                                                        <div className="mt-1 flex-shrink-0">
                                                            <ShieldCheck size={18} className="text-black" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black italic text-black leading-snug">
                                                                {ticket.adminReply}
                                                            </p>
                                                            <div className="mt-2 pt-2 border-t border-zinc-50">
                                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Verified Support Team</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="ml-14 p-4 border border-dashed border-zinc-200 rounded-2xl">
                                                        <p className="text-[11px] italic text-zinc-300 font-medium italic">Our team is reviewing your request...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}