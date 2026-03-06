import type { ResourceColumn } from "@/config/import-export.config";

/**
 * CSV Parser Service
 * Handles parsing CSV files and generating CSV from data
 */

export type ParsedCSV = {
    headers: string[];
    rows: Record<string, any>[];
};

/**
 * Parse CSV file to JSON
 */
export async function parseCSV(file: File): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = csvToJson(text);
                resolve(parsed);
            } catch (error) {
                reject(new Error("Failed to parse CSV file"));
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
}

/**
 * Convert CSV text to JSON
 */
function csvToJson(csvText: string): ParsedCSV {
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
        throw new Error("CSV file is empty");
    }

    // Parse headers
    const headers = parseCsvLine(lines[0]);

    // Parse rows
    const rows = lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row: Record<string, any> = {};

        headers.forEach((header, i) => {
            row[header] = values[i] || "";
        });

        return row;
    });

    return { headers, rows };
}

/**
 * Parse a single CSV line (handles quotes and commas)
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    // Add last field
    result.push(current.trim());

    return result;
}

/**
 * Convert JSON to CSV
 */
export function jsonToCsv(data: Record<string, any>[], columns: ResourceColumn[]): string {
    if (data.length === 0) {
        return "";
    }

    // Generate headers
    const headers = columns.map((col) => col.key);
    const headerRow = headers.map(escapeCsvValue).join(",");

    // Generate rows
    const dataRows = data.map((row) => {
        return headers
            .map((header) => {
                const value = row[header];
                return escapeCsvValue(value);
            })
            .join(",");
    });

    return [headerRow, ...dataRows].join("\n");
}

/**
 * Escape CSV value (handle quotes and commas)
 */
function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
        return "";
    }

    let str = String(value);

    // If value contains comma, quote, or newline, wrap in quotes
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        // Escape existing quotes by doubling them
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    }

    return str;
}

/**
 * Download CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Generate template CSV with example data
 */
export function generateTemplate(columns: ResourceColumn[]): string {
    // Header row
    const headers = columns.map((col) => col.key);
    const headerRow = headers.map(escapeCsvValue).join(",");

    // Example row
    const exampleRow = columns
        .map((col) => escapeCsvValue(col.example || ""))
        .join(",");

    return [headerRow, exampleRow].join("\n");
}

/**
 * Validate CSV structure against expected columns
 */
export function validateCsvStructure(
    parsedCsv: ParsedCSV,
    expectedColumns: ResourceColumn[]
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required columns
    const requiredColumns = expectedColumns
        .filter((col) => col.required)
        .map((col) => col.key);

    const missingColumns = requiredColumns.filter(
        (col) => !parsedCsv.headers.includes(col)
    );

    if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Check for unknown columns
    const knownColumns = expectedColumns.map((col) => col.key);
    const unknownColumns = parsedCsv.headers.filter(
        (header) => !knownColumns.includes(header)
    );

    if (unknownColumns.length > 0) {
        errors.push(`Unknown columns will be ignored: ${unknownColumns.join(", ")}`);
    }

    return {
        valid: errors.length === 0 || unknownColumns.length === errors.length,
        errors,
    };
}