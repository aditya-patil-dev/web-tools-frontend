import { useState } from "react";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";
import {
  type ResourceConfig,
  type ValidationResult,
  getResourceConfig,
} from "@/config/import-export.config";
import {
  parseCSV,
  jsonToCsv,
  downloadCsv,
  generateTemplate,
  validateCsvStructure,
} from "@/services/csv-parser.service";
import {
  importExportApi,
  type ImportMode,
} from "@/services/import-export.service";

export type ImportPreview = {
  row: number;
  data: Record<string, any>;
  validation: ValidationResult;
};

export type UseImportExportReturn = {
  selectedResource: string | null;
  resourceConfig: ResourceConfig | null;
  importPreview: ImportPreview[] | null;
  isProcessing: boolean;

  selectResource: (resourceId: string) => void;
  handleExport: () => Promise<void>;
  handleImport: (file: File, mode?: ImportMode) => Promise<void>;
  downloadTemplate: () => void;
  clearPreview: () => void;
};

export function useImportExport(): UseImportExportReturn {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resourceConfig, setResourceConfig] = useState<ResourceConfig | null>(
    null,
  );
  const [importPreview, setImportPreview] = useState<ImportPreview[] | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // ── SELECT RESOURCE ────────────────────────────────────────────────────────

  const selectResource = (resourceId: string) => {
    const config = getResourceConfig(resourceId);
    setSelectedResource(resourceId);
    setResourceConfig(config);
    setImportPreview(null);
  };

  // ── EXPORT ─────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    if (!resourceConfig) {
      toast.error("Please select a resource first");
      return;
    }

    setIsProcessing(true);
    loading.show({ message: `Exporting ${resourceConfig.label}...` });

    try {
      // Use resourceKey (e.g. "tools") — the backend expects { resource: "tools" }
      const response = await importExportApi.export(resourceConfig.resourceKey);

      if (!response.data || response.data.length === 0) {
        toast.warning("No data to export");
        return;
      }

      // Convert to CSV using column definitions
      const csv = jsonToCsv(response.data, resourceConfig.columns);

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${resourceConfig.id}_${timestamp}.csv`;
      downloadCsv(csv, filename);

      toast.success(
        `Exported ${response.data.length} ${resourceConfig.label.toLowerCase()}`,
      );
    } catch (error: any) {
      console.error("Export error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Export failed";
      toast.error(`Export failed: ${message}`);
    } finally {
      setIsProcessing(false);
      loading.hide();
    }
  };

  // ── IMPORT ─────────────────────────────────────────────────────────────────

  const handleImport = async (file: File, mode: ImportMode = "append") => {
    if (!resourceConfig) {
      toast.error("Please select a resource first");
      return;
    }

    setIsProcessing(true);
    loading.show({ message: "Parsing CSV..." });

    try {
      // Step 1: Parse CSV
      const parsed = await parseCSV(file);

      // Step 2: Validate CSV structure (required columns present)
      const structureValidation = validateCsvStructure(
        parsed,
        resourceConfig.columns,
      );
      if (!structureValidation.valid) {
        toast.error(structureValidation.errors[0]);
        return;
      }
      if (structureValidation.warnings) {
        toast.warning(structureValidation.errors.join(". "));
      }

      // Step 3: Validate each row (client-side pre-flight)
      loading.show({ message: "Validating rows..." });

      const preview: ImportPreview[] = parsed.rows.map((row, index) => {
        const validation = resourceConfig.validator(row, index);
        return { row: index + 2, data: row, validation };
      });

      setImportPreview(preview);

      const validRows = preview.filter((p) => p.validation.valid);
      const invalidRows = preview.filter((p) => !p.validation.valid);

      if (invalidRows.length > 0) {
        toast.warning(
          `${invalidRows.length} row(s) have validation errors. Fix them before importing.`,
        );
        return;
      }

      // Step 4: Transform rows (if transformer defined)
      loading.show({ message: "Processing..." });

      const transformedData = validRows.map((p) =>
        resourceConfig.transformer
          ? resourceConfig.transformer(p.data)
          : p.data,
      );

      // Step 5: Send to backend
      loading.show({
        message: `Importing ${transformedData.length} records...`,
      });

      const response = await importExportApi.import(
        resourceConfig.resourceKey, // ← correct: "tools" / "tool_categories" / "tool_pages"
        transformedData,
        mode,
      );

      const { imported, updated, failed, errors } = response.data;

      if (failed > 0 && errors && errors.length > 0) {
        toast.warning(
          `Import done — ${imported} added, ${updated} updated, ${failed} failed. Check errors below.`,
        );
      } else {
        toast.success(
          `Import complete — ${imported} added${updated > 0 ? `, ${updated} updated` : ""}`,
        );
        setImportPreview(null);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Import failed";
      toast.error(`Import failed: ${message}`);
    } finally {
      setIsProcessing(false);
      loading.hide();
    }
  };

  // ── DOWNLOAD TEMPLATE ──────────────────────────────────────────────────────

  const downloadTemplate = () => {
    if (!resourceConfig) {
      toast.error("Please select a resource first");
      return;
    }
    const template = generateTemplate(resourceConfig.columns);
    downloadCsv(template, `${resourceConfig.id}_template.csv`);
    toast.success("Template downloaded");
  };

  // ── CLEAR PREVIEW ──────────────────────────────────────────────────────────

  const clearPreview = () => setImportPreview(null);

  return {
    selectedResource,
    resourceConfig,
    importPreview,
    isProcessing,
    selectResource,
    handleExport,
    handleImport,
    downloadTemplate,
    clearPreview,
  };
}
