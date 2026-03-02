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

export const metadata = defaultMetadata;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <CookieConsentProvider>
                    <ToastProvider>
                        <LoadingProvider>
                            {children}
                        </LoadingProvider>
                    </ToastProvider>
                    <CookieConsentBanner />
                </CookieConsentProvider>
            </body>
        </html>
    );
}