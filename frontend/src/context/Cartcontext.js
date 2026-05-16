"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // only count ny all observe kro 
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);

    const fetchCart = useCallback(async () => {
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/get`, {
                credentials: "include",
                cache: "no-store",
            });

            if (res.status === 401) {
                setCart({ items: [] });
                return;
            }

            const data = await res.json();
            if (data.success && data.data) {
                setCart(data.data);
            } else {
                setCart({ items: [] });
            }
        } catch (error) {
            console.error("Cart Fetch Error:", error);
            setCart({ items: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();

        const handleCartUpdate = () => fetchCart();

        const handleAuthChange = () => {
            setCart({ items: [] });
            fetchCart();
        };

        window.addEventListener("cartUpdated", handleCartUpdate);
        window.addEventListener("authChanged", handleAuthChange);

        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdate);
            window.removeEventListener("authChanged", handleAuthChange);
        };
    }, [fetchCart]);

    // cartCount 
    const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, setCart, cartCount, fetchCart, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }

    return context;
};