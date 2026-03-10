import { api } from "@/lib/api/api";

export type ImportMode = "append" | "update";

export type ExportResponse = {
  success: boolean;
  message: string;
  data: Record<string, any>[];
  meta?: {
    total: number;
    resource: string;
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
      column?: string;
      value?: any;
      error: string;
    }>;
  };
  meta?: {
    resource: string;
    mode: ImportMode;
    total_rows: number;
    imported_at: string;
  };
};

/**
 * Import/Export API Service
 *
 * Both export and import hit a SINGLE backend route base:
 *   POST /admin/import-export/export  { resource }
 *   POST /admin/import-export/import  { resource, data, mode }
 */
export const importExportApi = {
  /**
   * Export all records for a resource.
   * @param resource  The resourceKey from ResourceConfig (e.g. "tools")
   */
  async export(resource: string): Promise<ExportResponse> {
    return api.post<ExportResponse>("/admin/import-export/export", {
      resource,
    });
  },

  /**
   * Import rows for a resource.
   * @param resource  The resourceKey from ResourceConfig (e.g. "tools")
   * @param data      Array of row objects
   * @param mode      "append" | "update"
   */
  async import(
    resource: string,
    data: Record<string, any>[],
    mode: ImportMode = "append",
  ): Promise<ImportResponse> {
    return api.post<ImportResponse>("/admin/import-export/import", {
      resource,
      data,
      mode,
    });
  },
};
