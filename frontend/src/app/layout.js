import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/Cartcontext";
import Script from "next/script";

export const metadata = {
  title: "Cartify | Shop Smart",
  description: "Cartify - Your ultimate shopping destination. Fast, secure and modern online store.",
  keywords: "cartify, shop smart, ecommerce, shopping, online store",
  openGraph: {
    title: "Cartify | Shop Smart",
    description: "Cartify - Your ultimate shopping destination. Fast, secure and modern online store.",
    images: ["https://fullstack-nextjs-ecommerce-zeta.vercel.app/cartify.jpeg"],
    type: "website",
    url: "https://fullstack-nextjs-ecommerce-zeta.vercel.app",

  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-800">
        <CartProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: "#121214",
                color: "#fff",
                border: "1px solid #27272a",
                fontSize: "14px",
              },
            }}
          />
          {children}
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />
        </CartProvider>
      </body>
    </html>
  );
}