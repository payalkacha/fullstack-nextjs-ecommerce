"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false); // Update button 
    const [fetching, setFetching] = useState(true); // Initial load mate
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchSingleProduct = async () => {
            setFetching(true);
            setError(null);
            try {

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/fetch/${id}`, {
                    credentials: "include"
                });

                const data = await res.json();
                console.log("Fetched Data:", data); // Debugging 

                if (data.success && data.product) {
                    setProduct(data.product);
                } else {

                    if (data.data) {
                        setProduct(data.data);
                    } else {
                        setError(data.message || "Product not found");
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to connect to server. Check if backend is running.");
            } finally {
                setFetching(false);
            }
        };

        fetchSingleProduct();
    }, [id]);

    const handleUpdate = async (formData) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/update/${id}`, {
                method: "PUT",
                body: formData,
                credentials: "include"
            });
            const data = await res.json();

            if (data.success || res.ok) {
                router.push("/admin/products");
                router.refresh();
            } else {
                alert(data.message || "Update failed");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong while updating.");
        } finally {
            setLoading(false);
        }
    };

    // 1. લોડિંગ સ્ટેટ
    if (fetching) return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-zinc-900" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Product details...</p>
        </div>
    );

    // 2. એરર સ્ટેટ
    if (error || !product) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={30} />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-800">
                {error || "Product Not Found"}
            </h2>
            <p className="text-zinc-400 text-xs mt-2 max-w-xs">The product you are trying to edit might have been deleted or the ID is invalid.</p>
            <button onClick={() => router.back()} className="mt-8 px-10 py-3 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
                Go Back
            </button>
        </div>
    );

    // 3. મેઈન એડિટ ફોર્મ
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-0">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="group flex items-center gap-3 text-zinc-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
            >
                <div className="p-2 bg-zinc-100 rounded-xl group-hover:bg-zinc-200 transition-colors">
                    <ChevronLeft size={14} />
                </div>
                Cancel & Return
            </button>

            {/* Header */}
            <div className="border-b border-zinc-100 pb-8">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-zinc-900">
                    Edit Product
                </h2>
                <div className="flex items-center gap-3 mt-4">
                    <div className="px-2 py-1 bg-zinc-900 text-white text-[8px] font-bold uppercase tracking-tighter rounded">
                        ID: {id.slice(-6)}
                    </div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        Editing: <span className="text-zinc-600">{product.name}</span>
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-[2.5rem]">
                <ProductForm
                    initialData={product}
                    onSubmit={handleUpdate}
                    loading={loading}
                />
            </div>
        </div>
    );
}