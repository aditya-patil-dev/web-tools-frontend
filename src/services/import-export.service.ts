import { api } from "@/lib/api/api";

export type ImportMode = "append" | "update" | "replace";

export type ExportResponse = {
    success: boolean;
    message: string;
    data: Record<string, any>[];
    meta?: {
        total: number;
        exported_at: string;
    };
};

export type ImportResponse = {
    success: boolean;
    message: string;
    data: {
        imported: number;
        updated: number;
        failed: number;
        errors?: Array<{
            row: number;
            error: string;
        }>;
    };
};

/**
 * Import/Export API Service
 */
export const importExportApi = {
    /**
     * Export data from a resource
     */
    async export(endpoint: string): Promise<ExportResponse> {
        return api.get<ExportResponse>(endpoint);
    },

    /**
     * Import data to a resource
     */
    async import(
        endpoint: string,
        data: Record<string, any>[],
        mode: ImportMode = "append"
    ): Promise<ImportResponse> {
        return api.post<ImportResponse>(endpoint, {
            data,
            mode,
        });
    },

    /**
     * Get import template
     */
    async getTemplate(endpoint: string): Promise<ExportResponse> {
        return api.get<ExportResponse>(endpoint);
    },
};