import type { ResourceColumn } from "@/config/import-export.config";

export type ParsedCSV = {
  headers: string[];
  rows: Record<string, any>[];
};

// ─────────────────────────────────────────────────────────────────────────────
// PARSE CSV → JSON
// ─────────────────────────────────────────────────────────────────────────────

export async function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        resolve(csvToJson(text));
      } catch (error) {
        reject(new Error("Failed to parse CSV file"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

function csvToJson(csvText: string): ParsedCSV {
  // Normalise line endings
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length === 0) throw new Error("CSV file is empty");

  const headers = parseCsvLine(lines[0]);

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, any> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

/**
 * RFC 4180-compliant CSV line parser.
 * Handles: quoted fields, escaped quotes (""), commas inside quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON → CSV
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert an array of DB row objects to CSV.
 * JSON / array columns (features, faqs, tags, schema_markup) are serialised
 * as JSON strings so they round-trip correctly on import.
 */
export function jsonToCsv(
  data: Record<string, any>[],
  columns: ResourceColumn[],
): string {
  if (data.length === 0) return "";

  const keys = columns.map((c) => c.key);
  const headerRow = keys.map(escapeCsvValue).join(",");

  const dataRows = data.map((row) =>
    keys
      .map((key) => {
        const col = columns.find((c) => c.key === key);
        let value = row[key];

        // Serialise JSON / array values back to a string
        if (
          value !== null &&
          value !== undefined &&
          typeof value === "object"
        ) {
          value = JSON.stringify(value);
        }

        // PostgreSQL text[] comes back as "{a,b,c}" — convert to "a,b,c" for the array column
        if (
          col?.type === "array" &&
          typeof value === "string" &&
          value.startsWith("{") &&
          value.endsWith("}")
        ) {
          value = value.slice(1, -1).replace(/"/g, "");
        }

        return escapeCsvValue(value);
      })
      .join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // Must quote if: contains comma, double-quote, newline, or leading/trailing space
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str !== str.trim()
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD
// ─────────────────────────────────────────────────────────────────────────────

export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a two-row CSV: header + one example row.
 * JSON columns use their example value directly (it's already a JSON string).
 */
export function generateTemplate(columns: ResourceColumn[]): string {
  const headerRow = columns.map((c) => escapeCsvValue(c.key)).join(",");
  const exampleRow = columns
    .map((c) => escapeCsvValue(c.example ?? ""))
    .join(",");
  return [headerRow, exampleRow].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

export function validateCsvStructure(
  parsedCsv: ParsedCSV,
  expectedColumns: ResourceColumn[],
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Missing required columns → hard error
  const requiredColumns = expectedColumns
    .filter((c) => c.required)
    .map((c) => c.key);
  const missingRequired = requiredColumns.filter(
    (col) => !parsedCsv.headers.includes(col),
  );
  if (missingRequired.length > 0) {
    errors.push(`Missing required columns: ${missingRequired.join(", ")}`);
  }

  // Unknown columns → warning only (backend ignores them)
  const knownKeys = expectedColumns.map((c) => c.key);
  const unknownCols = parsedCsv.headers.filter((h) => !knownKeys.includes(h));
  if (unknownCols.length > 0) {
    warnings.push(`Unknown columns will be ignored: ${unknownCols.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
