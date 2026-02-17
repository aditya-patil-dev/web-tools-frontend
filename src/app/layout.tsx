import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/admin.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { LoadingProvider } from "@/components/loading/LoadingProvider";

export const metadata: Metadata = {
    title: "My App",
    description: "Public + Admin App",
};

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
