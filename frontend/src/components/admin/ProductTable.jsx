"use client";
import { Edit3, Trash2, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function ProductTable({ products, onDelete }) {
    return (
        <div className="w-full overflow-hidden bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Product Details</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Category</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Pricing</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Inventory</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {products.map((product) => (
                        <tr key={product._id} className="hover:bg-zinc-50/40 transition-colors group">
                            <td className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-12 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="max-w-[200px]">
                                        <p className="font-black text-[13px] uppercase tracking-tight text-zinc-900 truncate">{product.name}</p>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter line-clamp-1 italic">{product.description}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className="px-3 py-1 bg-zinc-100 rounded-full text-[9px] font-black uppercase text-zinc-600 tracking-tighter">
                                    {product.category}
                                </span>
                            </td>
                            <td className="p-6">
                                <p className="font-black italic text-sm text-zinc-900">₹{product.price.toLocaleString()}</p>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 5 ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></div>
                                    <span className="font-black text-[11px] uppercase tracking-tighter text-zinc-700">{product.stock} LEFT</span>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/products/edit/${product._id}`}
                                        className="p-2.5 bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition-all"
                                    >
                                        <Edit3 size={15} />
                                    </Link>
                                    <button
                                        onClick={() => onDelete(product)}
                                        className="p-2.5 bg-zinc-50 text-zinc-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}