"use client";

import PageHeader from "@/components/page-header/PageHeader";
import ImportExportPanel from "@/components/admin/ImportExportPanel";

export default function ImportExportPage() {
    return (
        <div className="adminPage">
            <PageHeader
                title="Import / Export"
                subtitle="Bulk data management for all resources"
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Import / Export" },
                ]}
                variant="flat"
            />

            <div style={{ padding: "var(--space-6)" }}>
                <ImportExportPanel />
            </div>
        </div>
    );
}