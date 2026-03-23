import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/publicv2.css";

import Script from "next/script";

import { ToastProvider } from "@/components/toast/ToastProvider";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { defaultMetadata } from "@/config/seo.config";
import { CookieConsentProvider } from "@/context/CookieConsent";
import CookieConsentBanner from "@/components/common/CookieBanner";
import { getSiteSettings } from "@/services/settings.public.service";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import NavigationLoader from "@/components/loading/NavigationLoader";
import Providers from "@/app/providers";

import type { Metadata } from "next";

// ── Dynamic Metadata ───────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();

    return {
        ...defaultMetadata,

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
    const settings = await getSiteSettings();

    const GA_ID = settings?.google_analytics_id;

    return (
        <html lang="en">
            <body>
                {/* Google Analytics */}
                {GA_ID && GA_ID.startsWith("G-") && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_ID}', {
                                page_path: window.location.pathname,
                                });
                            `}
                        </Script>
                    </>
                )}

                {/* Umami Analytics */}
                <Script
                    src="https://cloud.umami.is/script.js"
                    data-website-id="f9fa1c59-8638-4939-b776-c47134c301f6"
                    strategy="afterInteractive"
                    defer
                />

                <Providers>
                    <SiteSettingsProvider settings={settings}>
                        <CookieConsentProvider>
                            <ToastProvider>
                                <LoadingProvider>
                                    <NavigationLoader />
                                    {children}
                                </LoadingProvider>
                            </ToastProvider>

                            <CookieConsentBanner />
                        </CookieConsentProvider>
                    </SiteSettingsProvider>
                </Providers>
            </body>
        </html>
    );
}