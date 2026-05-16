import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ShopLayout({ children }) {
    return (
        <div>

            <Navbar />

            <main className="min-h-screen px-4 py-6">
                {children}
            </main>

            <Footer />
        </div>
    );
}