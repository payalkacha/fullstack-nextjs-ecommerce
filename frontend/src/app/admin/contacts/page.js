"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
    Inbox, Trash2, Reply, X, Send,
    MessageSquare, Edit3, CheckCircle2, History
} from "lucide-react";

export default function ContactsPage() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const REPLY_LIMIT = 500;

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/all`, { credentials: "include" });
            const data = await res.json();
            if (data.success) setInquiries(data.data || []);
        } catch (error) {
            toast.error("Network sync failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInquiries(); }, []);

    const handleAdminAction = async (id, newStatus, reply = "") => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, adminReply: reply }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                toast.success(newStatus === "REPLIED" ? "Response Updated" : "Status Changed");
                fetchInquiries(); // Refresh list to show new data
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Permanently delete this inquiry?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/delete/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if ((await res.json()).success) {
                toast.success("Inquiry Removed");
                setInquiries(prev => prev.filter(item => item._id !== id));
            }
        } catch (err) { toast.error("Error deleting"); }
    };

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(item => filterStatus === "ALL" || item.status === filterStatus);
    }, [inquiries, filterStatus]);

    return (
        <div className="bg-[#fcfcfd] min-h-screen p-6 md:p-10 text-slate-900 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
                            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                <Inbox size={24} />
                            </div>
                            Support Center
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Manage and respond to customer inquiries.</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        {['ALL', 'NEW', 'REPLIED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black tracking-widest transition-all ${filterStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center py-20 opacity-40">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-bold tracking-widest text-xs uppercase">Loading Messages...</p>
                        </div>
                    ) : filteredInquiries.length > 0 ? (
                        filteredInquiries.map((item) => (
                            <div key={item._id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 flex flex-col relative overflow-hidden group">

                                {/* Status Badge */}
                                <div className="absolute top-8 right-8">
                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${item.status === 'NEW' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                        {item.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-black text-lg">
                                        {item.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                                    </div>
                                </div>

                                {/* Message Flow */}
                                <div className="space-y-4 flex-1">
                                    {/* User Message */}
                                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                            <MessageSquare size={14} className="text-indigo-400" /> Customer Inquiry
                                        </div>
                                        <p className="text-[14px] leading-relaxed text-slate-700 font-medium italic">"{item.message}"</p>
                                    </div>

                                    {/* Admin Response (Visibility of what you replied) */}
                                    {item.adminReply && (
                                        <div className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100/50 relative">
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em]">
                                                <CheckCircle2 size={14} /> Your Official Response
                                            </div>
                                            <p className="text-[14px] leading-relaxed text-slate-700 font-semibold">
                                                {item.adminReply}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setReplyingTo(item);
                                            setReplyText(item.adminReply || "");
                                        }}
                                        className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${item.status === 'REPLIED' ? 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-indigo-50' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'}`}
                                    >
                                        {item.status === 'REPLIED' ? <><Edit3 size={16} /> Update Response</> : <><Reply size={16} /> Send Reply</>}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <div className="text-slate-200 mb-4 flex justify-center"><Inbox size={60} strokeWidth={1} /></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No inquiries found in this category</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reponse & Edit Modal */}
            {replyingTo && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <History size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Support Logs</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {replyingTo.adminReply ? "Edit Response" : "New Response"}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">To: {replyingTo.name} ({replyingTo.email})</p>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Summary of User Message */}
                        <div className="mb-6 p-5 bg-slate-50 rounded-2xl border-l-4 border-indigo-500">
                            <p className="text-[13px] text-slate-500 font-medium italic">"{replyingTo.message}"</p>
                        </div>

                        <div className="relative">
                            <textarea
                                rows={6}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your professional response here..."
                                className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] p-6 text-sm font-medium outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none shadow-inner"
                            />

                            <div className="flex justify-between items-center mt-4 px-2">
                                <div className={`text-[10px] font-black uppercase tracking-widest ${replyText.length > REPLY_LIMIT ? 'text-red-500' : 'text-slate-400'}`}>
                                    {replyText.length} / {REPLY_LIMIT} Characters
                                </div>

                                <button
                                    onClick={() => {
                                        handleAdminAction(replyingTo._id, "REPLIED", replyText);
                                        setReplyingTo(null);
                                    }}
                                    disabled={!replyText.trim() || replyText.length > REPLY_LIMIT}
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center gap-3"
                                >
                                    {replyingTo.adminReply ? "Save Changes" : "Dispatch Reply"} <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}