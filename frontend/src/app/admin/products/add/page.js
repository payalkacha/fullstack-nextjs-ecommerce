"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { ChevronLeft } from "lucide-react";

export default function AddProductPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (formData) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/create`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                router.push("/admin/products");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Create error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest">
                <ChevronLeft size={16} /> Back to Catalog
            </button>

            <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Add Product</h2>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">Enter details to list on Cartify</p>
            </div>

            <ProductForm onSubmit={handleCreate} loading={loading} />
        </div>
    );
}