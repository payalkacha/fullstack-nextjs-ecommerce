"use client";
import { useState, useEffect } from "react";
import { Upload, X, Loader2, IndianRupee, Package, Tag, AlignLeft } from "lucide-react";

export default function ProductForm({ initialData = null, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
    });

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                price: initialData.price || "",
                category: initialData.category || "", // અહીં ડેટાબેઝની કેટેગરી આવશે
                stock: initialData.stock || "",
            });
            setPreviews(initialData.images || []);
        }
    }, [initialData]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (previews.length + selectedFiles.length > 5) {
            alert("તમે વધુમાં વધુ 5 ફોટા અપલોડ કરી શકો છો.");
            return;
        }
        setFiles([...files, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        // નવા સિલેક્ટ કરેલા ફાઇલ્સમાંથી પણ દૂર કરવું પડશે
        const initialImagesCount = initialData?.images?.length || 0;
        if (index >= initialImagesCount) {
            const fileIndex = index - initialImagesCount;
            const newFiles = files.filter((_, i) => i !== fileIndex);
            setFiles(newFiles);
        }
        setPreviews(newPreviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("category", formData.category);
        data.append("stock", formData.stock);

        // જો તમે ઈમેજમાં ફેરફાર ન કર્યો હોય તો જૂની ઈમેજિસ પણ મોકલવી પડશે (જો બેકેન્ડમાં એ રીતે સેટઅપ હોય)
        // હાલમાં ફક્ત નવી ફાઇલ્સ મોકલી રહ્યા છીએ:
        files.forEach(file => {
            data.append("images", file);
        });

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* લેફ્ટ સાઈડ: પ્રોડક્ટ વિગતો */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                            <Tag size={12} /> Product Title
                        </label>
                        <input
                            type="text" required
                            className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                            <AlignLeft size={12} /> Description
                        </label>
                        <textarea
                            required rows={5}
                            className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                <IndianRupee size={12} /> Price
                            </label>
                            <input
                                type="number" required
                                className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-zinc-900"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                <Package size={12} /> Stock Units
                            </label>
                            <input
                                type="number" required
                                className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-zinc-900"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Category</label>
                        <select
                            required
                            className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-zinc-900"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {/* અહીં મેં વેલ્યુ અને નામ બંને સરખા કરી દીધા છે જેથી કન્ફ્યુઝન ન થાય */}
                            <option value="Fashion">FASHION</option>
                            <option value="Electronics">ELECTRONICS</option>
                            <option value="Accessories">ACCESSORIES</option>
                            <option value="Footwear">FOOTWEAR</option>
                            <option value="Books">BOOKS</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* રાઈટ સાઈડ: ઈમેજ મેનેજમેન્ટ */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Product Media</h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {previews.map((src, i) => (
                            <div key={i} className="aspect-square bg-zinc-100 rounded-3xl overflow-hidden relative group border border-zinc-100">
                                <img src={src} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {previews.length < 5 && (
                            <label className="aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 hover:border-zinc-900 transition-all group">
                                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload size={20} className="text-zinc-900" />
                                </div>
                                <span className="text-[9px] font-black uppercase mt-4 text-zinc-400 tracking-tighter">Add Image ({previews.length}/5)</span>
                                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        )}
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-2xl shadow-zinc-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalize Update"}
                    </button>
                </div>
            </div>
        </form>
    );
}