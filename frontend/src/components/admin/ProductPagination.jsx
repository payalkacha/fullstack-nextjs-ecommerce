"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPagination({ currentPage, totalPages, onPageChange }) {
    // પેજ નંબર્સ જનરેટ કરવા માટે
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-between mt-8 px-2">
            <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                    Showing <span className="text-zinc-900">Page {currentPage}</span> of {totalPages}
                </p>
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-xl hover:bg-zinc-50 disabled:opacity-20 text-zinc-900 transition-all"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                    {pages.map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`min-w-[36px] h-[36px] rounded-xl text-[10px] font-black transition-all ${currentPage === p
                                ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200"
                                : "hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-xl hover:bg-zinc-50 disabled:opacity-20 text-zinc-900 transition-all"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}