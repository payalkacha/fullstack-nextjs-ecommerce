"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    User, Camera, Loader2, Trash2,
    Briefcase, Mail, Package,
    MapPin, Smartphone, Map, LifeBuoy
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const router = useRouter();

    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [user, setUser] = useState({
        name: "", email: "", phone: "", address: "",
        gender: "", occupation: "", city: "", state: "", profilePic: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const fileInputRef = useRef(null);

    // Cleanup memory for temporary preview URLs
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // FETCH PROFILE 
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                });

                const data = await res.json();

                if (res.ok && data.user) {
                    const u = data.user;
                    setUser({
                        name: u.name || "",
                        email: u.email || "",
                        phone: u.phone || "",
                        address: u.address || "",
                        gender: u.gender || "",
                        occupation: u.occupation || "",
                        city: u.city || "",
                        state: u.state || "",
                        profilePic: u.profilePic || ""
                    });

                    if (u.profilePic) {
                        setPreviewUrl(`${u.profilePic}?t=${Date.now()}`);
                    }
                } else {
                    router.push("/login");
                }
            } catch (err) {
                console.error("Fetch Profile Error:", err);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, [router]);

    // DELETE IMAGE
    const handleDeleteImage = async () => {
        if (!confirm("Remove profile photo?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/delete-profile-pic`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Could not delete image");

            setUser(prev => ({ ...prev, profilePic: "" }));
            setPreviewUrl("");
            setSelectedFile(null);
            toast.success("Image removed successfully");
        } catch (err) {
            toast.error(err.message);
        }
    };

    // UPDATE PROFILE 
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            const allowedFields = ["name", "phone", "address", "gender", "occupation", "city", "state"];

            allowedFields.forEach(key => {
                // માત્ર એવી વેલ્યુ મોકલવી જે ખાલી ન હોય
                if (user[key]) {
                    formData.append(key, user[key].trim());
                }
            });

            if (selectedFile) {
                formData.append("image", selectedFile);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const updatedUser = data.user;
                setUser(prev => ({ ...prev, ...updatedUser }));

                if (updatedUser.profilePic) {
                    setPreviewUrl(`${updatedUser.profilePic}?t=${Date.now()}`);
                }

                setIsEdit(false);
                setSelectedFile(null);
                toast.success("Identity Updated!");
            } else {
                throw new Error(data.message || "Update failed");
            }
        } catch (err) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#F0F2F5]">
            <Loader2 className="animate-spin text-black" size={40} strokeWidth={1} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F0F2F5] text-black pb-24 font-sans pt-24 selection:bg-black selection:text-white">
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] italic shadow-lg">
                        Cartify Elite
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Profile Portal</h2>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => router.push("/orders")} className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-black transition-all group">
                        <Package size={16} className="text-gray-400 group-hover:text-black" />
                        <span className="text-[10px] font-black uppercase tracking-widest">My Orders</span>
                    </button>
                    <button onClick={() => router.push("/contact")} className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-black transition-all group">
                        <LifeBuoy size={16} className="text-gray-400 group-hover:text-black" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Help Support</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Identity Card */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center sticky top-24">
                        <div className="relative mb-10">
                            <div className="w-48 h-48 rounded-full border-[8px] border-[#F0F2F5] overflow-hidden bg-gray-50 ring-1 ring-gray-100 shadow-inner">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="User"
                                        className="w-full h-full object-cover transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <User size={80} strokeWidth={1} />
                                    </div>
                                )}
                            </div>

                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-black text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                >
                                    <Camera size={16} />
                                </button>
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteImage}
                                        className="bg-white text-red-500 p-3.5 rounded-full shadow-xl border border-red-50 hover:bg-red-50 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <input type="file" ref={fileInputRef} hidden onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedFile(file);
                                    setPreviewUrl(URL.createObjectURL(file));
                                    setIsEdit(true); // ઈમેજ સિલેક્ટ કરે તો એડિટ મોડ ઓન કરી દેવો
                                }
                            }} accept="image/*" />
                        </div>

                        <h3 className="text-2xl font-black tracking-tighter uppercase text-center leading-tight">
                            {user.name || "Accessing Member"}
                        </h3>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3 bg-gray-50 px-4 py-1 rounded-full">
                            {user.occupation || "Member"}
                        </p>

                        <div className="mt-10 pt-8 border-t border-gray-50 w-full flex items-center justify-center gap-3 text-green-500 font-black text-[9px] uppercase tracking-widest">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Verified Identity
                        </div>
                    </div>
                </div>

                {/* Form Data Section */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-black italic">Core Profile</h4>
                                <div className="h-1 w-8 bg-black rounded-full"></div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEdit(!isEdit)}
                                className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEdit ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-100 text-black hover:bg-black hover:text-white'}`}
                            >
                                {isEdit ? "Discard" : "Modify Details"}
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                {[
                                    { label: "Full Identity Name", key: "name", icon: <User size={16} /> },
                                    { label: "Current Occupation", key: "occupation", icon: <Briefcase size={16} /> },
                                    { label: "Contact Frequency", key: "phone", icon: <Smartphone size={16} /> },
                                    { label: "Email Node", key: "email", icon: <Mail size={16} />, disabled: true },
                                    { label: "City Zone", key: "city", icon: <MapPin size={16} /> },
                                    { label: "State Region", key: "state", icon: <Map size={16} /> },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                                        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border ${isEdit && !field.disabled ? 'bg-[#FAFAFA] border-gray-200 focus-within:border-black focus-within:bg-white shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                                            <div className={`${isEdit && !field.disabled ? 'text-black' : 'text-gray-300'}`}>{field.icon}</div>
                                            <input
                                                disabled={field.disabled || !isEdit}
                                                value={user[field.key] || ""}
                                                onChange={(e) => setUser({ ...user, [field.key]: e.target.value })}
                                                className="bg-transparent w-full font-bold text-sm outline-none placeholder:text-gray-300"
                                                placeholder={`Update ${field.key}...`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        disabled={!isEdit}
                                        value={user.gender || ""}
                                        onChange={(e) => setUser({ ...user, gender: e.target.value })}
                                        className="w-full bg-[#FAFAFA] px-6 py-4 rounded-2xl font-bold text-sm outline-none border border-gray-200 focus:border-black focus:bg-white transition-all appearance-none disabled:opacity-50"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Delivery Address</label>
                                    <input
                                        disabled={!isEdit}
                                        value={user.address || ""}
                                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                                        className="w-full bg-[#FAFAFA] px-6 py-4 rounded-2xl font-bold text-sm outline-none border border-gray-200 focus:border-black focus:bg-white transition-all disabled:opacity-50"
                                        placeholder="Flat No, Building, Street, Area..."
                                    />
                                </div>
                            </div>

                            {isEdit && (
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-300 mt-4"
                                >
                                    {loading ? "Synchronizing..." : "Update Identity"}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}