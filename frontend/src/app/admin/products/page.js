"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import ProductTable from "@/components/admin/ProductTable";
import ProductPagination from "@/components/admin/ProductPagination";
import DeleteModal from "@/components/admin/DeleteModal";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [deleteItem, setDeleteItem] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/get?page=${page}&search=${search}`, {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, search]);

    const confirmDelete = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/delete/${deleteItem._id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                setDeleteItem(null);
                fetchProducts();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">Products</h2>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">Total {products.length} Items in Inventory</p>
                </div>
                <Link href="/admin/products/add" className="flex items-center gap-2 px-8 py-4 bg-zinc-950 text-white rounded-2xl text-[11px] font-black uppercase hover:bg-black transition-all shadow-xl shadow-zinc-200">
                    <Plus size={16} /> New Product
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY NAME OR CATEGORY..."
                        className="w-full bg-zinc-50 border-none rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-zinc-900 transition-all"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-8 py-4 bg-zinc-50 text-zinc-900 rounded-2xl text-[10px] font-black uppercase hover:bg-zinc-100 transition-all">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {/* Table Area */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-zinc-50">
                    <Loader2 className="animate-spin text-zinc-200" size={40} />
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-300">Loading Catalog...</p>
                </div>
            ) : (
                <>
                    <ProductTable products={products} onDelete={(p) => setDeleteItem(p)} />
                    <ProductPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}

            <DeleteModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={confirmDelete}
                itemName={deleteItem?.name}
            />
        </div>
    );
}