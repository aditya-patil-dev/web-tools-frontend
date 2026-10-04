import Navbar from "@/components/public/Navbar/Navbar";
import Footer from "@/components/public/Footer/Footer";
import BuyMeCoffee from '@/components/public/FinalCTA/BuyMeCoffee';
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { fetchLayoutData } from "@/lib/page-data/layout.data";
import { getSiteSettings } from "@/services/settings.public.service";
import { cookies } from "next/headers";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSiteSettings();
    const cookieStore = await cookies();
    const isBypassed = cookieStore.get("maintenance_bypass")?.value === "true";

    const isEnvMaintenance =
        process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
        process.env.MAINTENANCE_MODE === "true";
    const isSettingsMaintenance = Boolean(settings?.maintenance_mode);
    const isMaintenanceMode = (isEnvMaintenance || isSettingsMaintenance) && !isBypassed;

    if (isMaintenanceMode) {
        return <MaintenancePage siteName={settings?.site_name || "FusionTools"} />;
    }

    const layout = await fetchLayoutData();

    return (
        <>
            <Navbar config={layout.navbar} />
            <main>{children}</main>
            <Footer config={layout.footer} />

            {/* Buy Me a Coffee widget - fixed to viewport */}
            <BuyMeCoffee username="fusiontools" />
        </>
    );
}