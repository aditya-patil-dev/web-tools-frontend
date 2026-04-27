export type ToolPageStatus = "draft" | "published" | "archived";

export type ToolPage = {
  id: number;
  tool_slug: string;
  page_title: string;
  page_intro: string | null;
  long_content: string | null;
  features: any | null; // JSONB - [{title, description}]
  faqs: any | null; // JSONB - [{question, answer}]
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  noindex: boolean;
  schema_markup: any | null; // JSONB
  status: ToolPageStatus;
  created_at: string;
  updated_at: string;
};

export type ToolPageWithTool = ToolPage & {
  tool?: {
    id: number;
    title: string;
    slug: string;
    category_slug: string;
  };
};

// src/types/tool-page.types.ts
export type ToolPageFormData = {
  tool_slug: string;
  page_title: string;
  page_intro?: string | null; // ← add null
  long_content?: string | null; // ← add null
  features?: string | null; // ← string (JSON.stringify'd) or null
  faqs?: string | null; // ← string (JSON.stringify'd) or null
  meta_title?: string | null; // ← add null
  meta_description?: string | null; // ← add null
  meta_keywords?: string | null; // ← add null
  canonical_url?: string | null; // ← add null
  noindex?: boolean;
  schema_markup?: string | null; // ← string or null
  status?: ToolPageStatus;
};

export type ToolPageListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ToolPageStatus;
  tool_slug?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type ToolPageListResponse = {
  success: boolean;
  message: string;
  data: ToolPageWithTool[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

export type ToolPageResponse = {
  success: boolean;
  message: string;
  data: ToolPageWithTool;
};
