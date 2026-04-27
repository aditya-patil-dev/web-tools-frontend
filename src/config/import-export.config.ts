export type ResourceColumn = {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "number" | "boolean" | "date" | "select" | "json" | "array";
  options?: { value: string; label: string }[];
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

  /**
   * The "resource" value sent in the POST body to:
   *   POST /admin/import-export/export  { resource }
   *   POST /admin/import-export/import  { resource, data, mode }
   */
  resourceKey: string;

  // Column definitions (drives CSV template + preview)
  columns: ResourceColumn[];

  // Validation function (client-side pre-flight)
  validator: (row: any, rowIndex: number) => ValidationResult;

  // Transform row before sending to API
  transformer?: (row: any) => any;

  importModes?: ("append" | "update")[];
  batchSize?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts various formats of keywords to a PostgreSQL-compatible array.
 * Handles:
 *   - JSON array string:  '["a","b","c"]'       → ['a','b','c'] (JS array, sent as-is)
 *   - Comma-separated:    'a,b,c'                → ['a','b','c']
 *   - Already an array:   ['a','b','c']           → ['a','b','c']
 *   - Empty/null:         '' | null               → null
 */
const toKeywordsArray = (value: any): string[] | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === "") return null;

  // Try JSON array first (exported as ["a","b"])
  if (str.startsWith("[")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      /* fall through to comma split */
    }
  }

  // Fallback: comma-separated plain text
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const toJsonOrNull = (value: any): any => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === "") return null;
  try {
    return JSON.parse(str); // parse so backend receives an object, not a string
  } catch {
    return null; // invalid JSON → null (validator already caught this)
  }
};

const toNullIfEmpty = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
};

const toBooleanOrFalse = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  const str = String(value).toLowerCase().trim();
  return str === "true" || str === "1" || str === "yes";
};

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

const validateEnum = (
  value: string,
  options: string[],
  label: string,
): string | null => {
  if (!options.includes(value)) {
    return `${label} must be one of: ${options.join(", ")}`;
  }
  return null;
};

/**
 * Validate that a string is valid JSON (object or array).
 * Empty / null values are allowed (field is optional).
 */
const validateJson = (value: any, columnLabel: string): string | null => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null; // optional
  }
  try {
    JSON.parse(String(value));
    return null;
  } catch {
    return `${columnLabel} must be valid JSON`;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const IMPORT_EXPORT_RESOURCES: Record<string, ResourceConfig> = {
  // ── TOOLS ──────────────────────────────────────────────────────────────────
  tools: {
    id: "tools",
    label: "Tools",
    description:
      'Import/export tools with all metadata. Use "append" to add new records; use "update" to update existing records matched by ID.',
    icon: "🛠️",
    resourceKey: "tools", // sent as { resource: "tools" } in POST body

    columns: [
      {
        key: "id",
        label: "ID",
        type: "number",
        description: "Leave blank when appending new records",
      },
      { key: "title", label: "Title", required: true, example: "ChatGPT" },
      { key: "slug", label: "Slug", required: true, example: "chatgpt" },
      {
        key: "category_slug",
        label: "Category Slug",
        required: true,
        example: "ai-tools",
      },
      {
        key: "tool_type",
        label: "Tool Type",
        required: true,
        example: "AI Chat",
      },
      {
        key: "short_description",
        label: "Short Description",
        example: "AI chatbot by OpenAI",
      },
      {
        key: "tool_url",
        label: "Tool URL",
        required: true,
        example: "https://chat.openai.com",
      },
      {
        key: "tags",
        label: "Tags",
        type: "array",
        example: "ai,chatbot,productivity",
        description: "Comma-separated list of tags",
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
        example: "active",
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
        example: "new",
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
        example: "free",
      },
      { key: "daily_limit", label: "Daily Limit", type: "number", example: "" },
      {
        key: "monthly_limit",
        label: "Monthly Limit",
        type: "number",
        example: "",
      },
      {
        key: "is_featured",
        label: "Featured",
        type: "boolean",
        example: "false",
      },
      { key: "sort_order", label: "Sort Order", type: "number", example: "0" },
      { key: "rating", label: "Rating", type: "number", example: "4.5" },
      { key: "views", label: "Views", type: "number", example: "0" },
      {
        key: "users_count",
        label: "Users Count",
        type: "number",
        example: "0",
      },
    ],

    validator: (row, rowIndex) => {
      const errors: ValidationError[] = [];
      const rowNum = rowIndex + 2;

      const titleError = validateRequired(row.title, "Title");
      if (titleError)
        errors.push({
          row: rowNum,
          column: "title",
          value: row.title,
          error: titleError,
        });

      if (row.slug) {
        const slugFormatError = validateSlug(row.slug);
        if (slugFormatError)
          errors.push({
            row: rowNum,
            column: "slug",
            value: row.slug,
            error: slugFormatError,
          });
      } else {
        errors.push({
          row: rowNum,
          column: "slug",
          value: row.slug,
          error: "Slug is required",
        });
      }

      const categoryError = validateRequired(
        row.category_slug,
        "Category Slug",
      );
      if (categoryError)
        errors.push({
          row: rowNum,
          column: "category_slug",
          value: row.category_slug,
          error: categoryError,
        });

      const typeError = validateRequired(row.tool_type, "Tool Type");
      if (typeError)
        errors.push({
          row: rowNum,
          column: "tool_type",
          value: row.tool_type,
          error: typeError,
        });

      if (!row.tool_url) {
        errors.push({
          row: rowNum,
          column: "tool_url",
          value: row.tool_url,
          error: "Tool URL is required",
        });
      } else {
        const urlFormatError = validateUrl(row.tool_url);
        if (urlFormatError)
          errors.push({
            row: rowNum,
            column: "tool_url",
            value: row.tool_url,
            error: urlFormatError,
          });
      }

      if (row.status) {
        const statusError = validateEnum(
          row.status,
          ["draft", "active", "archived"],
          "Status",
        );
        if (statusError)
          errors.push({
            row: rowNum,
            column: "status",
            value: row.status,
            error: statusError,
          });
      }

      if (row.access_level) {
        const accessError = validateEnum(
          row.access_level,
          ["free", "pro", "premium"],
          "Access Level",
        );
        if (accessError)
          errors.push({
            row: rowNum,
            column: "access_level",
            value: row.access_level,
            error: accessError,
          });
      }

      return { valid: errors.length === 0, errors, data: row };
    },

    // The backend service handles all type coercions — just pass raw CSV values
    transformer: (row) => ({
      id: row.id ? Number(row.id) : undefined,
      title: toNullIfEmpty(row.title),
      slug: toNullIfEmpty(row.slug),
      category_slug: toNullIfEmpty(row.category_slug),
      tool_type: toNullIfEmpty(row.tool_type),
      short_description: toNullIfEmpty(row.short_description),
      tool_url: toNullIfEmpty(row.tool_url),
      tags: toNullIfEmpty(row.tags),
      status: toNullIfEmpty(row.status) ?? "draft",
      badge: toNullIfEmpty(row.badge),
      access_level: toNullIfEmpty(row.access_level) ?? "free",
      daily_limit: row.daily_limit ? Number(row.daily_limit) : null,
      monthly_limit: row.monthly_limit ? Number(row.monthly_limit) : null,
      is_featured: toBooleanOrFalse(row.is_featured),
      sort_order: row.sort_order ? Number(row.sort_order) : 0,
      rating: row.rating ? Number(row.rating) : null,
      views: row.views ? Number(row.views) : 0,
      users_count: row.users_count ? Number(row.users_count) : 0,
    }),

    importModes: ["append", "update"],
    batchSize: 100,
  },

  // ── TOOL CATEGORIES ────────────────────────────────────────────────────────
  tool_categories: {
    id: "tool_categories",
    label: "Tool Categories",
    description:
      "Import/export tool category SEO pages. Maps to the tools_category_pages table.",
    icon: "📂",
    resourceKey: "tool_categories",

    columns: [
      {
        key: "id",
        label: "ID",
        type: "number",
        description: "Leave blank when appending new records",
      },
      {
        key: "category_slug",
        label: "Category Slug",
        required: true,
        example: "ai-tools",
      },
      {
        key: "page_title",
        label: "Page Title",
        required: true,
        example: "AI Tools",
      },
      {
        key: "page_description",
        label: "Page Description",
        example: "Best AI tools online",
      },
      {
        key: "page_intro",
        label: "Page Intro",
        example: "Discover the best AI tools...",
      },
      {
        key: "meta_title",
        label: "Meta Title",
        example: "AI Tools | ToolsHub",
      },
      {
        key: "meta_description",
        label: "Meta Description",
        example: "Find top AI tools...",
      },
      {
        key: "meta_keywords",
        label: "Meta Keywords",
        example: "ai tools,artificial intelligence",
      },
      {
        key: "canonical_url",
        label: "Canonical URL",
        example: "https://example.com/tools/ai-tools",
      },
      { key: "noindex", label: "No Index", type: "boolean", example: "false" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ],
        example: "published",
      },
    ],

    validator: (row, rowIndex) => {
      const errors: ValidationError[] = [];
      const rowNum = rowIndex + 2;

      if (row.category_slug) {
        const slugFormatError = validateSlug(row.category_slug);
        if (slugFormatError)
          errors.push({
            row: rowNum,
            column: "category_slug",
            value: row.category_slug,
            error: slugFormatError,
          });
      } else {
        errors.push({
          row: rowNum,
          column: "category_slug",
          value: row.category_slug,
          error: "Category Slug is required",
        });
      }

      const titleError = validateRequired(row.page_title, "Page Title");
      if (titleError)
        errors.push({
          row: rowNum,
          column: "page_title",
          value: row.page_title,
          error: titleError,
        });

      if (row.status) {
        const statusError = validateEnum(
          row.status,
          ["draft", "published", "archived"],
          "Status",
        );
        if (statusError)
          errors.push({
            row: rowNum,
            column: "status",
            value: row.status,
            error: statusError,
          });
      }

      return { valid: errors.length === 0, errors, data: row };
    },

    transformer: (row) => ({
      id: row.id ? Number(row.id) : undefined,
      category_slug: toNullIfEmpty(row.category_slug),
      page_title: toNullIfEmpty(row.page_title),
      page_description: toNullIfEmpty(row.page_description),
      page_intro: toNullIfEmpty(row.page_intro),
      meta_title: toNullIfEmpty(row.meta_title),
      meta_description: toNullIfEmpty(row.meta_description),
      meta_keywords: toNullIfEmpty(row.meta_keywords),
      canonical_url: toNullIfEmpty(row.canonical_url),
      noindex: toBooleanOrFalse(row.noindex),
      status: toNullIfEmpty(row.status) ?? "draft",
    }),
    importModes: ["append", "update"],
    batchSize: 50,
  },

  // ── TOOL PAGES ─────────────────────────────────────────────────────────────
  tool_pages: {
    id: "tool_pages",
    label: "Tool Pages",
    description:
      "Import/export SEO content for tool pages. Features and FAQs are stored as JSON arrays — paste valid JSON into those columns.",
    icon: "📄",
    resourceKey: "tool_pages",

    columns: [
      {
        key: "id",
        label: "ID",
        type: "number",
        description: "Leave blank when appending new records",
      },
      {
        key: "tool_slug",
        label: "Tool Slug",
        required: true,
        example: "chatgpt",
      },
      {
        key: "page_title",
        label: "Page Title",
        required: true,
        example: "ChatGPT – AI Tool",
      },
      {
        key: "page_intro",
        label: "Page Intro",
        example: "Introduction text...",
      },
      {
        key: "long_content",
        label: "Long Content",
        example: "Detailed description...",
      },
      {
        key: "features",
        label: "Features (JSON)",
        type: "json",
        example: '[{"title":"Fast","description":"Very fast"}]',
        description: 'JSON array: [{"title":"...","description":"..."}]',
      },
      {
        key: "faqs",
        label: "FAQs (JSON)",
        type: "json",
        example: '[{"question":"How?","answer":"Like this."}]',
        description: 'JSON array: [{"question":"...","answer":"..."}]',
      },
      { key: "meta_title", label: "Meta Title", example: "ChatGPT | ToolsHub" },
      {
        key: "meta_description",
        label: "Meta Description",
        example: "Discover ChatGPT...",
      },
      {
        key: "meta_keywords",
        label: "Meta Keywords",
        example: "chatgpt,ai,openai",
      },
      {
        key: "canonical_url",
        label: "Canonical URL",
        example: "https://example.com/tools/chatgpt",
      },
      {
        key: "schema_markup",
        label: "Schema Markup (JSON)",
        type: "json",
        example:
          '{"@context":"https://schema.org","@type":"SoftwareApplication"}',
        description: "JSON-LD schema object",
      },
      { key: "noindex", label: "No Index", type: "boolean", example: "false" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ],
        example: "published",
      },
    ],

    validator: (row, rowIndex) => {
      const errors: ValidationError[] = [];
      const rowNum = rowIndex + 2;

      const slugError = validateRequired(row.tool_slug, "Tool Slug");
      if (slugError)
        errors.push({
          row: rowNum,
          column: "tool_slug",
          value: row.tool_slug,
          error: slugError,
        });

      const titleError = validateRequired(row.page_title, "Page Title");
      if (titleError)
        errors.push({
          row: rowNum,
          column: "page_title",
          value: row.page_title,
          error: titleError,
        });

      // Validate JSON fields
      const featuresError = validateJson(row.features, "Features");
      if (featuresError)
        errors.push({
          row: rowNum,
          column: "features",
          value: row.features,
          error: featuresError,
        });

      const faqsError = validateJson(row.faqs, "FAQs");
      if (faqsError)
        errors.push({
          row: rowNum,
          column: "faqs",
          value: row.faqs,
          error: faqsError,
        });

      const schemaError = validateJson(row.schema_markup, "Schema Markup");
      if (schemaError)
        errors.push({
          row: rowNum,
          column: "schema_markup",
          value: row.schema_markup,
          error: schemaError,
        });

      if (row.status) {
        const statusError = validateEnum(
          row.status,
          ["draft", "active", "archived"],
          "Status",
        );
        if (statusError)
          errors.push({
            row: rowNum,
            column: "status",
            value: row.status,
            error: statusError,
          });
      }

      return { valid: errors.length === 0, errors, data: row };
    },

    transformer: (row) => ({
      id: row.id ? Number(row.id) : undefined,
      tool_slug: toNullIfEmpty(row.tool_slug),
      page_title: toNullIfEmpty(row.page_title),
      page_intro: toNullIfEmpty(row.page_intro),
      long_content: toNullIfEmpty(row.long_content),
      features: toJsonOrNull(row.features),
      faqs: toJsonOrNull(row.faqs),
      meta_title: toNullIfEmpty(row.meta_title),
      meta_description: toNullIfEmpty(row.meta_description),
      meta_keywords: toKeywordsArray(row.meta_keywords), // ← fix: array, not string
      canonical_url: toNullIfEmpty(row.canonical_url),
      schema_markup: toJsonOrNull(row.schema_markup),
      noindex: toBooleanOrFalse(row.noindex),
      status: toNullIfEmpty(row.status) ?? "draft",
    }),

    importModes: ["append", "update"],
    batchSize: 100,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function getAvailableResources(): ResourceConfig[] {
  return Object.values(IMPORT_EXPORT_RESOURCES);
}

export function getResourceConfig(resourceId: string): ResourceConfig | null {
  return IMPORT_EXPORT_RESOURCES[resourceId] || null;
}

export function getResourceOptions() {
  return getAvailableResources().map((resource) => ({
    value: resource.id,
    label: `${resource.icon || ""} ${resource.label}`,
  }));
}
