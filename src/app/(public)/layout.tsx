import Navbar from "@/components/public/Navbar/Navbar";
import Footer from "@/components/public/Footer/Footer";
import BuyMeCoffee from '@/components/public/FinalCTA/BuyMeCoffee';
import { fetchLayoutData } from "@/lib/page-data/layout.data";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const layout = await fetchLayoutData();

    return (
        <>
            <Navbar config={layout.navbar} />
            <main>{children}</main>
            <Footer config={layout.footer} />

            {/* Buy Me a Coffee widget - fixed to viewport */}
            <BuyMeCoffee username="techfusion" />
        </>
    );
}