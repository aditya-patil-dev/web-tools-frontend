import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/admin.css";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { defaultMetadata } from "@/config/seo.config";
import { CookieConsentProvider } from "@/context/CookieConsent";
import CookieConsentBanner from "@/components/common/CookieBanner";
import { getSiteSettings } from "@/services/settings.public.service";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();

    return {
        // Keep all existing defaults (title template, OG image, twitter, etc.)
        ...defaultMetadata,

        // Override only favicon + metadataBase from live settings
        ...(settings?.favicon_url && {
            icons: {
                icon: settings.favicon_url,
                shortcut: settings.favicon_url,
                apple: settings.favicon_url,
            },
        }),

        ...(settings?.site_url && {
            metadataBase: new URL(
                `https://${settings.site_url.replace(/^https?:\/\//, "")}`
            ),
        }),

        // Inject search console verification tags without touching title/description
        verification: {
            ...(settings?.google_search_console && {
                google: settings.google_search_console,
            }),
            ...(settings?.bing_webmaster && {
                other: { "msvalidate.01": [settings.bing_webmaster] },
            }),
        },
    };
}

// ── Root Layout ────────────────────────────────────────────────────────────────
export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetched once, cached 1 hour (see getSiteSettings).
    // Passed into context so Navbar can read logo_url without a second fetch.
    const settings = await getSiteSettings();

    return (
        <html lang="en">
            <body>
                <SiteSettingsProvider settings={settings}>
                    <CookieConsentProvider>
                        <ToastProvider>
                            <LoadingProvider>
                                {children}
                            </LoadingProvider>
                        </ToastProvider>
                        <CookieConsentBanner />
                    </CookieConsentProvider>
                </SiteSettingsProvider>
            </body>
        </html>
    );
}