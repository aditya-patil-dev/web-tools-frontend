import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/admin.css";

import { ToastProvider } from "@/components/toast/ToastProvider";
import { LoadingProvider } from "@/components/loading/LoadingProvider";

import { defaultMetadata } from "@/config/seo.config";

export const metadata = defaultMetadata;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    <LoadingProvider>
                        {children}
                    </LoadingProvider>
                </ToastProvider>
            </body>
        </html>
    );
}