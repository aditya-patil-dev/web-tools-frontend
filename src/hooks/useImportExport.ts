import { useState } from "react";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";
import { 
    type ResourceConfig, 
    type ValidationResult, 
    getResourceConfig 
} from "@/config/import-export.config";
import { parseCSV, jsonToCsv, downloadCsv, generateTemplate, validateCsvStructure } from "@/services/csv-parser.service";
import { importExportApi, type ImportMode } from "@/services/import-export.service";

export type ImportPreview = {
    row: number;
    data: Record<string, any>;
    validation: ValidationResult;
};

export type UseImportExportReturn = {
    // State
    selectedResource: string | null;
    resourceConfig: ResourceConfig | null;
    importPreview: ImportPreview[] | null;
    isProcessing: boolean;

    // Actions
    selectResource: (resourceId: string) => void;
    handleExport: () => Promise<void>;
    handleImport: (file: File, mode?: ImportMode) => Promise<void>;
    downloadTemplate: () => void;
    clearPreview: () => void;
};

export function useImportExport(): UseImportExportReturn {
    const [selectedResource, setSelectedResource] = useState<string | null>(null);
    const [resourceConfig, setResourceConfig] = useState<ResourceConfig | null>(null);
    const [importPreview, setImportPreview] = useState<ImportPreview[] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // ============================================================================
    // SELECT RESOURCE
    // ============================================================================

    const selectResource = (resourceId: string) => {
        const config = getResourceConfig(resourceId);
        setSelectedResource(resourceId);
        setResourceConfig(config);
        setImportPreview(null);
    };

    // ============================================================================
    // EXPORT
    // ============================================================================

    const handleExport = async () => {
        if (!resourceConfig) {
            toast.error("Please select a resource first");
            return;
        }

        setIsProcessing(true);
        loading.show({ message: `Exporting ${resourceConfig.label}...` });

        try {
            console.log(`📤 Exporting from: ${resourceConfig.exportEndpoint}`);

            // Fetch data from API
            const response = await importExportApi.export(resourceConfig.exportEndpoint);

            console.log(`✅ Received ${response.data.length} records`);

            if (response.data.length === 0) {
                toast.warning("No data to export");
                return;
            }

            // Convert to CSV
            const csv = jsonToCsv(response.data, resourceConfig.columns);

            // Download
            const timestamp = new Date().toISOString().split("T")[0];
            const filename = `${resourceConfig.id}_${timestamp}.csv`;
            downloadCsv(csv, filename);

            toast.success(`Exported ${response.data.length} ${resourceConfig.label.toLowerCase()}`);
        } catch (error: any) {
            console.error("❌ Export error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Export failed";
            toast.error(`Export failed: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
            loading.hide();
        }
    };

    // ============================================================================
    // IMPORT
    // ============================================================================

    const handleImport = async (file: File, mode: ImportMode = "append") => {
        if (!resourceConfig) {
            toast.error("Please select a resource first");
            return;
        }

        setIsProcessing(true);
        loading.show({ message: "Parsing CSV..." });

        try {
            console.log(`📥 Importing to: ${resourceConfig.importEndpoint}`);

            // Step 1: Parse CSV
            const parsed = await parseCSV(file);
            console.log(`✅ Parsed ${parsed.rows.length} rows`);

            // Step 2: Validate CSV structure
            const structureValidation = validateCsvStructure(parsed, resourceConfig.columns);

            if (!structureValidation.valid) {
                toast.error(structureValidation.errors[0]);
                setIsProcessing(false);
                loading.hide();
                return;
            }

            if (structureValidation.errors.length > 0) {
                // Show warnings for unknown columns
                toast.warning(structureValidation.errors.join(". "));
            }

            // Step 3: Validate each row
            loading.show({ message: "Validating data..." });

            const preview: ImportPreview[] = parsed.rows.map((row, index) => {
                const validation = resourceConfig.validator(row, index);
                return {
                    row: index + 2, // +2 because row 1 is headers, array is 0-indexed
                    data: row,
                    validation,
                };
            });

            setImportPreview(preview);

            const validRows = preview.filter((p) => p.validation.valid);
            const invalidRows = preview.filter((p) => !p.validation.valid);

            console.log(`✅ Valid: ${validRows.length}, ❌ Invalid: ${invalidRows.length}`);

            if (invalidRows.length > 0) {
                toast.warning(`${invalidRows.length} row(s) have errors. Review and fix before importing.`);
                setIsProcessing(false);
                loading.hide();
                return;
            }

            // Step 4: Transform data
            loading.show({ message: "Processing data..." });

            const transformedData = validRows.map((p) => {
                if (resourceConfig.transformer) {
                    return resourceConfig.transformer(p.data);
                }
                return p.data;
            });

            // Step 5: Send to API
            loading.show({ message: `Importing ${transformedData.length} records...` });

            const response = await importExportApi.import(
                resourceConfig.importEndpoint,
                transformedData,
                mode
            );

            console.log("✅ Import response:", response);

            // Success!
            toast.success(
                `Successfully imported ${response.data.imported} ${resourceConfig.label.toLowerCase()}`
            );

            setImportPreview(null);
        } catch (error: any) {
            console.error("❌ Import error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Import failed";
            toast.error(`Import failed: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
            loading.hide();
        }
    };

    // ============================================================================
    // DOWNLOAD TEMPLATE
    // ============================================================================

    const downloadTemplate = () => {
        if (!resourceConfig) {
            toast.error("Please select a resource first");
            return;
        }

        const template = generateTemplate(resourceConfig.columns);
        const filename = `${resourceConfig.id}_template.csv`;
        downloadCsv(template, filename);

        toast.success("Template downloaded");
    };

    // ============================================================================
    // CLEAR PREVIEW
    // ============================================================================

    const clearPreview = () => {
        setImportPreview(null);
    };

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