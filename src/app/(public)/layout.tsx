import Navbar from "@/components/public/Navbar/Navbar";
import Footer from "@/components/public/Footer/Footer";
import BuyMeCoffee from '@/components/public/FinalCTA/BuyMeCoffee';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />

            {/* Buy Me a Coffee widget - fixed to viewport */}
            <BuyMeCoffee username="techfusion" />
        </>
    );
}