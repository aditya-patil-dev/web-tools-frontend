/**
 * Import/Export Resource Registry
 * 
 * This is the SINGLE SOURCE OF TRUTH for all importable/exportable resources.
 * Adding a new resource? Just add one configuration object here!
 */

export type ResourceColumn = {
    key: string;
    label: string;
    required?: boolean;
    type?: "text" | "number" | "boolean" | "date" | "select";
    options?: { value: string; label: string }[]; // For select type
    example?: string;
    description?: string;
};

export type ValidationError = {
    row: number;
    column: string;
    value: any;
    error: string;
};

export type ValidationResult = {
    valid: boolean;
    errors: ValidationError[];
    data: any;
};

export type ResourceConfig = {
    id: string;
    label: string;
    description: string;
    icon?: string;

    // API endpoints
    exportEndpoint: string;
    importEndpoint: string;
    templateEndpoint?: string; // Optional: GET template with sample data

    // Column definitions
    columns: ResourceColumn[];

    // Validation function
    validator: (row: any, rowIndex: number) => ValidationResult;

    // Transform before sending to API
    transformer?: (row: any) => any;

    // Import modes supported
    importModes?: ("append" | "update" | "replace")[];

    // Batch size for large imports
    batchSize?: number;
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const validateRequired = (value: any, columnLabel: string): string | null => {
    if (value === null || value === undefined || String(value).trim() === "") {
        return `${columnLabel} is required`;
    }
    return null;
};

const validateSlug = (value: string): string | null => {
    if (!/^[a-z0-9-]+$/.test(value)) {
        return "Slug must contain only lowercase letters, numbers, and hyphens";
    }
    return null;
};

const validateUrl = (value: string): string | null => {
    try {
        new URL(value);
        return null;
    } catch {
        return "Invalid URL format";
    }
};

const validateEnum = (value: string, options: string[], label: string): string | null => {
    if (!options.includes(value)) {
        return `${label} must be one of: ${options.join(", ")}`;
    }
    return null;
};

// ============================================================================
// RESOURCE CONFIGURATIONS
// ============================================================================

export const IMPORT_EXPORT_RESOURCES: Record<string, ResourceConfig> = {

    // ── TOOLS ─────────────────────────────────────────────────────────────────
    tools: {
        id: "tools",
        label: "Tools",
        description: "Import/export tools with their metadata",
        icon: "🛠️",

        exportEndpoint: "/admin/tools/export",
        importEndpoint: "/admin/tools/import",

        columns: [
            { key: "title", label: "Title", required: true, example: "ChatGPT" },
            { key: "slug", label: "Slug", required: true, example: "chatgpt" },
            { key: "category_slug", label: "Category Slug", required: true, example: "ai-tools" },
            { key: "tool_type", label: "Tool Type", required: true, example: "AI Chat" },
            { key: "short_description", label: "Short Description", example: "AI chatbot by OpenAI" },
            { key: "tool_url", label: "Tool URL", required: true, example: "https://chat.openai.com" },
            {
                key: "tags",
                label: "Tags",
                example: "ai,chatbot,productivity",
                description: "Comma-separated list"
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                options: [
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                    { value: "archived", label: "Archived" },
                ],
                example: "active"
            },
            {
                key: "badge",
                label: "Badge",
                type: "select",
                options: [
                    { value: "", label: "None" },
                    { value: "new", label: "New" },
                    { value: "popular", label: "Popular" },
                    { value: "pro", label: "Pro" },
                ],
                example: "new"
            },
            {
                key: "access_level",
                label: "Access Level",
                type: "select",
                options: [
                    { value: "free", label: "Free" },
                    { value: "pro", label: "Pro" },
                    { value: "premium", label: "Premium" },
                ],
                example: "free"
            },
            { key: "is_featured", label: "Featured", type: "boolean", example: "false" },
            { key: "sort_order", label: "Sort Order", type: "number", example: "0" },
        ],

        validator: (row, rowIndex) => {
            const errors: ValidationError[] = [];
            const rowNum = rowIndex + 2; // +2 because CSV row 1 is headers, array is 0-indexed

            // Required fields
            const requiredError = validateRequired(row.title, "Title");
            if (requiredError) errors.push({ row: rowNum, column: "title", value: row.title, error: requiredError });

            const slugError = validateRequired(row.slug, "Slug");
            if (slugError) {
                errors.push({ row: rowNum, column: "slug", value: row.slug, error: slugError });
            } else {
                const slugFormatError = validateSlug(row.slug);
                if (slugFormatError) errors.push({ row: rowNum, column: "slug", value: row.slug, error: slugFormatError });
            }

            const categoryError = validateRequired(row.category_slug, "Category Slug");
            if (categoryError) errors.push({ row: rowNum, column: "category_slug", value: row.category_slug, error: categoryError });

            const typeError = validateRequired(row.tool_type, "Tool Type");
            if (typeError) errors.push({ row: rowNum, column: "tool_type", value: row.tool_type, error: typeError });

            const urlError = validateRequired(row.tool_url, "Tool URL");
            if (urlError) {
                errors.push({ row: rowNum, column: "tool_url", value: row.tool_url, error: urlError });
            } else if (row.tool_url) {
                const urlFormatError = validateUrl(row.tool_url);
                if (urlFormatError) errors.push({ row: rowNum, column: "tool_url", value: row.tool_url, error: urlFormatError });
            }

            // Enum validations
            if (row.status) {
                const statusError = validateEnum(row.status, ["draft", "active", "archived"], "Status");
                if (statusError) errors.push({ row: rowNum, column: "status", value: row.status, error: statusError });
            }

            if (row.access_level) {
                const accessError = validateEnum(row.access_level, ["free", "pro", "premium"], "Access Level");
                if (accessError) errors.push({ row: rowNum, column: "access_level", value: row.access_level, error: accessError });
            }

            return {
                valid: errors.length === 0,
                errors,
                data: row,
            };
        },

        transformer: (row) => ({
            ...row,
            tags: row.tags ? row.tags.split(",").map((t: string) => t.trim()) : [],
            is_featured: row.is_featured === "true" || row.is_featured === true,
            sort_order: row.sort_order ? parseInt(row.sort_order) : 0,
        }),

        importModes: ["append", "update"],
        batchSize: 100,
    },

    // ── TOOL CATEGORIES ───────────────────────────────────────────────────────
    "tool-categories": {
        id: "tool-categories",
        label: "Tool Categories",
        description: "Import/export tool categories",
        icon: "📂",

        exportEndpoint: "/admin/tools/categories/export",
        importEndpoint: "/admin/tools/categories/import",

        columns: [
            { key: "category_slug", label: "Category Slug", required: true, example: "ai-tools" },
            { key: "page_title", label: "Page Title", required: true, example: "AI Tools" },
            { key: "page_description", label: "Page Description", example: "Best AI tools..." },
            { key: "icon", label: "Icon", example: "🤖" },
            { key: "color", label: "Color", example: "#ff6b35" },
            { key: "sort_order", label: "Sort Order", type: "number", example: "0" },
            { key: "is_featured", label: "Featured", type: "boolean", example: "false" },
        ],

        validator: (row, rowIndex) => {
            const errors: ValidationError[] = [];
            const rowNum = rowIndex + 2;

            const slugError = validateRequired(row.category_slug, "Category Slug");
            if (slugError) {
                errors.push({ row: rowNum, column: "category_slug", value: row.category_slug, error: slugError });
            } else {
                const slugFormatError = validateSlug(row.category_slug);
                if (slugFormatError) errors.push({ row: rowNum, column: "category_slug", value: row.category_slug, error: slugFormatError });
            }

            const titleError = validateRequired(row.page_title, "Page Title");
            if (titleError) errors.push({ row: rowNum, column: "page_title", value: row.page_title, error: titleError });

            return { valid: errors.length === 0, errors, data: row };
        },

        transformer: (row) => ({
            ...row,
            is_featured: row.is_featured === "true" || row.is_featured === true,
            sort_order: row.sort_order ? parseInt(row.sort_order) : 0,
        }),

        importModes: ["append", "update"],
        batchSize: 50,
    },

    // ── TOOL PAGES ────────────────────────────────────────────────────────────
    "tool-pages": {
        id: "tool-pages",
        label: "Tool Pages",
        description: "Import/export SEO content for tool pages",
        icon: "📄",

        exportEndpoint: "/admin/tool-pages/export",
        importEndpoint: "/admin/tool-pages/import",

        columns: [
            { key: "tool_slug", label: "Tool Slug", required: true, example: "chatgpt" },
            { key: "page_title", label: "Page Title", required: true, example: "ChatGPT - AI Tool" },
            { key: "page_intro", label: "Page Intro", example: "Introduction text..." },
            { key: "long_content", label: "Long Content", example: "Detailed content..." },
            { key: "meta_title", label: "Meta Title", example: "ChatGPT | ToolsHub" },
            { key: "meta_description", label: "Meta Description", example: "Discover ChatGPT..." },
            { key: "meta_keywords", label: "Meta Keywords", example: "chatgpt,ai,openai" },
            {
                key: "status",
                label: "Status",
                type: "select",
                options: [
                    { value: "draft", label: "Draft" },
                    { value: "published", label: "Published" },
                    { value: "archived", label: "Archived" },
                ],
                example: "published"
            },
            { key: "noindex", label: "No Index", type: "boolean", example: "false" },
        ],

        validator: (row, rowIndex) => {
            const errors: ValidationError[] = [];
            const rowNum = rowIndex + 2;

            const slugError = validateRequired(row.tool_slug, "Tool Slug");
            if (slugError) errors.push({ row: rowNum, column: "tool_slug", value: row.tool_slug, error: slugError });

            const titleError = validateRequired(row.page_title, "Page Title");
            if (titleError) errors.push({ row: rowNum, column: "page_title", value: row.page_title, error: titleError });

            if (row.status) {
                const statusError = validateEnum(row.status, ["draft", "published", "archived"], "Status");
                if (statusError) errors.push({ row: rowNum, column: "status", value: row.status, error: statusError });
            }

            return { valid: errors.length === 0, errors, data: row };
        },

        transformer: (row) => ({
            ...row,
            noindex: row.noindex === "true" || row.noindex === true,
        }),

        importModes: ["append", "update"],
        batchSize: 100,
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available resources
 */
export function getAvailableResources(): ResourceConfig[] {
    return Object.values(IMPORT_EXPORT_RESOURCES);
}

/**
 * Get resource config by ID
 */
export function getResourceConfig(resourceId: string): ResourceConfig | null {
    return IMPORT_EXPORT_RESOURCES[resourceId] || null;
}

/**
 * Get resource options for dropdown
 */
export function getResourceOptions() {
    return getAvailableResources().map((resource) => ({
        value: resource.id,
        label: `${resource.icon || ""} ${resource.label}`,
    }));
}