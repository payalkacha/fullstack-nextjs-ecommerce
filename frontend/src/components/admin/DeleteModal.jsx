import { X } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, itemName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl scale-in-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <X size={40} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Remove Product?</h3>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                    You are about to delete <span className="text-black">"{itemName}"</span>. This action cannot be undone.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                    >
                        Delete Now
                    </button>
                </div>
            </div>
        </div>
    );
}