export type ToolCategoryStatus = "draft" | "published" | "archived";

export type ToolCategory = {
    category_slug: string;
    page_title: string;
    page_description: string;
    page_intro?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    canonical_url?: string | null;
    noindex: boolean;
    status: ToolCategoryStatus;
    created_at: string;
    updated_at: string;
    tool_count?: number; // From join with tools table
};

export type ToolCategoryFormData = {
    category_slug: string;
    page_title: string;
    page_description: string;
    page_intro?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    noindex?: boolean;
    status?: ToolCategoryStatus;
};

export type ToolCategoryListParams = {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export type ToolCategoryListResponse = {
    success: boolean;
    message: string;
    data: ToolCategory[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
};

export type ToolCategoryResponse = {
    success: boolean;
    message: string;
    data: ToolCategory;
};

export type ToolCategoryCreateRequest = {
    category_slug: string;
    page_title: string;
    page_description: string;
    page_intro?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    noindex?: boolean;
    status?: ToolCategoryStatus;
};