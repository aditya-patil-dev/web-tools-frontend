import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { getSiteSettings } from "@/services/settings.public.service";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || "FusionTools";
  
  return {
    title: `Under Maintenance • ${siteName}`,
    description: `${siteName} is currently undergoing scheduled maintenance to upgrade servers and tools. We'll be back online shortly!`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MaintenancePageRoute() {
  const settings = await getSiteSettings();
  
  return (
    <MaintenancePage 
      siteName={settings?.site_name || "FusionTools"} 
    />
  );
}
