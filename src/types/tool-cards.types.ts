export type ToolStatus = "active" | "draft" | "archived";
export type ToolBadge = "new" | "popular" | "pro" | null;
export type AccessLevel = "free" | "pro" | "premium";

export type Tool = {
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    tool_type: string;
    tags: string[] | null;
    short_description: string | null;
    badge: ToolBadge;
    rating: number;
    sort_order: number;
    is_featured: boolean;
    views: number;
    users_count: number;
    last_used_at: string | null;
    access_level: AccessLevel;
    daily_limit: number | null;
    monthly_limit: number | null;
    tool_url: string;
    status: ToolStatus;
    created_at: string;
    updated_at: string;
};

export type ToolPage = {
    id?: number;
    tool_slug: string;
    page_title: string;
    page_description?: string;
    page_intro?: string;
    how_to_use?: string;
    features?: string;
    pros?: string;
    cons?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    noindex?: boolean;
    schema_markup?: string;
    faq_schema?: string;
};

export type Category = {
    category_slug: string;
    page_title: string;
    page_description: string;
};

export type CategoryWithStats = {
    category_slug: string;
    page_title: string;
    page_description: string;
    tool_count: number;
};

export type CompleteToolData = {
    tool: Partial<Tool>;
    page?: Partial<ToolPage>;
    category?: Partial<Category>;
};

export type ToolFormData = {
    title: string;
    slug: string;
    category_slug: string;
    tool_type: string;
    tags?: string[];
    short_description?: string;
    badge?: ToolBadge;
    rating?: number;
    sort_order?: number;
    is_featured?: boolean;
    access_level?: AccessLevel;
    daily_limit?: number;
    monthly_limit?: number;
    tool_url: string;
    status?: ToolStatus;
};

export type ToolListParams = {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: ToolStatus;
    badge?: string;
    access_level?: AccessLevel;
    is_featured?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export type ToolListResponse = {
    success: boolean;
    message: string;
    data: Tool[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
};

export type ToolResponse = {
    success: boolean;
    message: string;
    data: CompleteToolData;
};

export type BulkUpdatePayload = {
    ids: number[];
    updates: Partial<Tool>;
};

export type BulkDeletePayload = {
    ids: number[];
    permanent?: boolean;
};

export type BulkOperationResponse = {
    success: boolean;
    message: string;
    data: {
        updated_count?: number;
        deleted_count?: number;
    };
};