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

export type ToolPageFormData = {
    tool_slug: string;
    page_title: string;
    page_intro?: string;
    long_content?: string;
    features?: any; // Array of {title, description}
    faqs?: any; // Array of {question, answer}
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    noindex?: boolean;
    schema_markup?: any;
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