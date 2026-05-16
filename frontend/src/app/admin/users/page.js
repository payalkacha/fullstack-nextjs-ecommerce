"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
    Search, Mail, Eye, Users, UserCircle,
    RefreshCcw, FilterX, ShieldCheck, ShieldAlert
} from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
            } else {
                toast.error(data.message || "Access Denied");
            }
        } catch (error) {
            toast.error("Connection lost. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Filter Logic using useMemo for better performance
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    return (
        <div className="bg-[#f8f9fa] min-h-screen p-4 md:p-10 text-zinc-900 selection:bg-zinc-900 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-black rounded-xl">
                                <Users size={28} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Directory</h1>
                        </div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
                            Managing {users.length} Registered Members
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="SEARCH BY NAME OR EMAIL..."
                                className="pl-12 pr-6 py-3.5 bg-white border border-zinc-200 rounded-2xl w-full md:w-80 focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-[10px] tracking-widest"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="p-3.5 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 active:scale-95 transition-all shadow-sm"
                        >
                            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Security</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Joined Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {loading ? (
                                    <SkeletonLoader />
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200">
                                                            {user.profilePic ? (
                                                                <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                                    <UserCircle size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {user.isVerified && (
                                                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                                                                <ShieldCheck size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 text-sm">{user.name}</p>
                                                        <p className="text-[11px] font-medium text-zinc-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${user.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {user.isVerified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-bold text-zinc-500">
                                                {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all active:scale-95"
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <FilterX size={48} strokeWidth={1} />
                                                <p className="font-black uppercase tracking-[0.3em] text-sm italic">No Matching Results</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MODAL --- */}
                {selectedUser && (
                    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all">
                        <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <h3 className="font-black uppercase italic tracking-tighter text-xl">Profile Snapshot</h3>
                                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors font-bold">×</button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[24px] bg-zinc-100 border-2 border-white shadow-md overflow-hidden">
                                        {selectedUser.profilePic ? <img src={selectedUser.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><UserCircle size={40} /></div>}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">{selectedUser.name}</h2>
                                        <p className="text-zinc-500 font-medium">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <DetailCard label="Role" value={selectedUser.role || "Standard"} />
                                    <DetailCard label="Status" value={selectedUser.isVerified ? "Verified" : "Pending"} color={selectedUser.isVerified ? "text-green-600" : "text-amber-600"} />
                                </div>

                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-black/10 active:scale-[0.98] transition-transform"
                                >
                                    Dismiss View
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-components for better organization
function DetailCard({ label, value, color = "text-zinc-900" }) {
    return (
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-bold uppercase italic ${color}`}>{value}</p>
        </div>
    );
}

function SkeletonLoader() {
    return [1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-8 py-5"><div className="flex gap-4 items-center"><div className="w-12 h-12 bg-zinc-100 rounded-2xl" /><div className="space-y-2"><div className="h-3 w-24 bg-zinc-100 rounded" /><div className="h-2 w-32 bg-zinc-50 rounded" /></div></div></td>
            <td className="px-8 py-5"><div className="h-6 w-20 bg-zinc-100 rounded-lg" /></td>
            <td className="px-8 py-5"><div className="h-3 w-24 bg-zinc-100 rounded" /></td>
            <td className="px-8 py-5"><div className="h-10 w-24 bg-zinc-100 rounded-xl ml-auto" /></td>
        </tr>
    ));
} 