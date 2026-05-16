"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/Cartcontext";
import toast from "react-hot-toast";
import { MoveLeft } from "lucide-react";

// મુખ્ય કમ્પોનન્ટ જેની અંદર searchParams નો ઉપયોગ થાય છે
function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState(null);

    useEffect(() => {
        setProductId(searchParams.get("productId"));
    }, [searchParams]);

    // GLOBAL CART CONTEXT
    const { cart, setCart, fetchCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [razorpayReady, setRazorpayReady] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        pincode: "",
        phone: "",
        paymentMethod: "ONLINE"
    });

    // BUY NOW PRODUCT
    const [singleProductCart, setSingleProductCart] = useState(null);

    // FINAL CART
    const finalCart = productId ? singleProductCart : cart || { items: [] };

    // LOAD RAZORPAY
    useEffect(() => {
        if (window.Razorpay) {
            setRazorpayReady(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => setRazorpayReady(true);
        script.onerror = () => toast.error("Razorpay failed to load");

        document.body.appendChild(script);
    }, []);

    // FETCH BUY NOW PRODUCT
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/product/fetch/${productId}`,
                    { cache: "no-store" }
                );

                const data = await res.json();

                if (data?.success) {
                    setSingleProductCart({
                        items: [
                            {
                                product: data.data,
                                quantity: 1,
                            },
                        ],
                    });
                }
            } catch {
                toast.error("Server error");
            }
        };

        fetchProduct();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone" && value.length > 10) return;
        if (name === "pincode" && value.length > 6) return;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const blockInvalidChar = (e) =>
        ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault();

    // PLACE ORDER
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!finalCart?.items?.length) {
            return toast.error("Cart is empty");
        }

        if (formData.phone.length !== 10) {
            return toast.error("Phone must be 10 digits");
        }

        if (formData.pincode.length !== 6) {
            return toast.error("Pincode must be 6 digits");
        }

        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/order/checkout`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        ...formData,
                        productId: productId || null,
                    }),
                }
            );

            const data = await res.json();

            if (!data?.success) {
                throw new Error(data.message);
            }

            const orderId = data.data._id;

            // COD
            if (formData.paymentMethod === "COD") {
                toast.success("Order Placed");

                if (!productId) {
                    setCart({ items: [] });
                    window.dispatchEvent(new Event("cartUpdated"));
                    await fetchCart();
                }
                router.replace("/orders");
            }
            // ONLINE
            else {
                await handleRazorpay(orderId);
            }
        } catch (err) {
            toast.error(err.message || "Order failed");
        } finally {
            setLoading(false);
        }
    };

    // RAZORPAY HANDLER
    const handleRazorpay = async (orderId) => {
        try {
            if (!razorpayReady) {
                return toast.error("Payment system loading...");
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/order/razorpay`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId }),
                    credentials: "include",
                }
            );

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            const data = result.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxx",
                amount: data.amount,
                currency: data.currency,
                name: "CARTIFY STORE",
                order_id: data.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/order/verify`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    orderId,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            }
                        );

                        const verifyData = await verifyRes.json();
                        if (!verifyData.success) throw new Error("Verification failed");

                        toast.success("Payment Successful");

                        if (!productId) {
                            setCart({ items: [] });
                            window.dispatchEvent(new Event("cartUpdated"));
                            await fetchCart();
                        }
                        router.replace("/orders");
                    } catch (err) {
                        toast.error(err.message);
                        router.replace("/orders");
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.error("Payment Cancelled");
                    },
                },
                theme: { color: "#000" },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function () {
                toast.error("Payment Failed ❌");
                router.replace("/orders");
            });
            rzp.open();
        } catch (err) {
            toast.error(err.message || "Razorpay error");
        }
    };

    // SUBTOTAL
    const subtotal = finalCart?.items?.reduce(
        (acc, item) => acc + Number(item.product.price) * Number(item.quantity),
        0
    ) || 0;

    // LOADING STATE
    if (!finalCart) {
        return <div className="text-center pt-40">Loading...</div>;
    }

    // EMPTY STATE
    if (finalCart?.items?.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center text-zinc-400 uppercase text-xs tracking-widest">
                Cart is empty
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen text-black pt-32 pb-24 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                {/* LEFT */}
                <div className="lg:col-span-7">
                    <div className="mb-14">
                        <button
                            onClick={() => router.push("/cart")}
                            className="flex items-center gap-2 text-zinc-400 hover:text-black transition-all mb-8 group"
                        >
                            <MoveLeft
                                size={16}
                                className="group-hover:-translate-x-1 transition-transform"
                            />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                                Return to Cart
                            </span>
                        </button>
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                            Shipping.
                        </h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] mt-3 italic">
                            Identify Dispatch Credentials
                        </p>
                    </div>

                    <form onSubmit={handlePlaceOrder} className="space-y-12">
                        <div className="space-y-10">
                            <div className="relative group">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
                                    Recipient Identity
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="ENTER FULL NAME"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border-b-[1px] border-zinc-200 py-3 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-[0.1em] bg-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="relative group">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
                                        Target City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="CITY NAME"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full border-b-[1px] border-zinc-200 py-3 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-[0.1em] bg-transparent"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
                                        Area Pincode
                                    </label>
                                    <input
                                        onKeyDown={blockInvalidChar}
                                        type="number"
                                        name="pincode"
                                        placeholder="6 DIGIT CODE"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="no-spinner w-full border-b-[1px] border-zinc-200 py-3 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-[0.1em] bg-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
                                    Full Dispatch Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="STREET, BUILDING, LANDMARK"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border-b-[1px] border-zinc-200 py-3 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-[0.1em] bg-transparent"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">
                                    Contact Terminal
                                </label>
                                <input
                                    onKeyDown={blockInvalidChar}
                                    type="number"
                                    name="phone"
                                    placeholder="+91 XXXXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="no-spinner w-full border-b-[1px] border-zinc-200 py-3 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-[0.1em] bg-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 mb-6 block italic">
                                Settlement Mode
                            </span>
                            <div className="flex gap-3">
                                {["ONLINE", "COD"].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                paymentMethod: method,
                                            })
                                        }
                                        className={`px-10 py-4 text-[10px] font-black tracking-[0.3em] transition-all border rounded-sm ${formData.paymentMethod === method
                                            ? "bg-black text-white border-black shadow-lg"
                                            : "bg-white text-zinc-400 border-zinc-100 hover:border-black"
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.6em] hover:bg-zinc-800 transition-all active:scale-[0.98] rounded-sm shadow-2xl mt-10"
                        >
                            {loading
                                ? "PROCESSING..."
                                : formData.paymentMethod === "COD"
                                    ? "CONFIRM DISPATCH"
                                    : `PAY ₹${subtotal}`
                            }
                        </button>
                    </form>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-5">
                    <div className="bg-zinc-100 p-10 rounded-sm border-[1px] border-zinc-200 sticky top-32 shadow-sm">
                        <div className="flex justify-between items-center mb-10 border-b border-zinc-200 pb-5">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] italic text-black opacity-40">
                                Order Manifest
                            </h3>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest italic">
                                {finalCart?.items?.length || 0} ITEMS
                            </span>
                        </div>

                        <div className="space-y-8 max-h-[350px] overflow-y-auto pr-2 scroll-slim">
                            {finalCart?.items.map((item) => (
                                <div
                                    key={item.product._id}
                                    className="flex gap-6 items-center border-b border-zinc-200 pb-6 last:border-0 hover:bg-zinc-50 transition-colors rounded-sm px-2 -mx-2"
                                >
                                    <div className="w-20 h-24 bg-white flex-shrink-0 overflow-hidden border-[1px] border-zinc-200 rounded-sm p-1">
                                        <img
                                            src={item.product.images?.[0] || "/placeholder.png"}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-800 leading-snug">
                                            {item.product.name}
                                        </h4>
                                        <div className="flex justify-between mt-3">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm font-black italic tracking-tighter">
                                                ₹{(item.product?.price || 0) * item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t-2 border-zinc-200 space-y-5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                <span>Shipping Fee</span>
                                <span className="text-black font-black italic tracking-widest uppercase">
                                    FREE
                                </span>
                            </div>

                            <div className="flex justify-between items-end pt-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.5em] italic opacity-30">
                                    Total Value
                                </span>
                                <span className="text-4xl font-black italic tracking-tighter leading-none">
                                    ₹{subtotal}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scroll-slim::-webkit-scrollbar { width: 2px; }
                .scroll-slim::-webkit-scrollbar-track { background: transparent; }
                .scroll-slim::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
                .no-spinner::-webkit-inner-spin-button,
                .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                .no-spinner { -moz-appearance: textfield; }
            `}</style>
        </div>
    );
}

// મુખ પેજ જે આપણે export કરીએ છીએ તેને <Suspense> માં લપેટ્યું છે
export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="text-center pt-40">Loading Checkout...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}