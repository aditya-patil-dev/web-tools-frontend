// ==================== Enums ====================
export type ToolBadge = "new" | "popular" | "pro" | null;
export type ToolStatus = "active" | "draft" | "disabled" | "deprecated";
export type PageStatus = "active" | "draft" | "disabled";
export type AccessLevel = "free" | "premium" | "pro" | "enterprise";
export type SortField = "created_at" | "updated_at" | "title" | "sort_order";
export type SortOrder = "asc" | "desc";

// ==================== Feature & FAQ ====================
export interface Feature {
    title: string;
    description: string;
}

export interface FAQ {
    question: string;
    answer: string;
}

// ==================== Category ====================
export interface Category {
    category_slug: string;
    page_title: string;
    page_description: string;
    page_intro?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    canonical_url?: string | null;
    noindex: boolean;
    status: PageStatus;
}

export interface CategoryWithStats extends Category {
    tool_count: number;
    created_at: string;
    updated_at: string;
}

// ==================== Tool ====================
export interface Tool {
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    tool_type: string;
    tags: string[];
    short_description: string;
    badge: ToolBadge;
    rating: number;
    sort_order: number;
    is_featured: boolean;
    views: number;
    users_count: number;
    access_level: AccessLevel;
    daily_limit?: number | null;
    monthly_limit?: number | null;
    tool_url: string;
    status: ToolStatus;
    created_at: string;
    updated_at: string;
}

// ==================== Tool Page ====================
export interface ToolPage {
    tool_slug: string;
    page_title: string;
    page_intro?: string | null;
    long_content?: string | null;
    features: Feature[];
    faqs: FAQ[];
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords: string[];
    canonical_url?: string | null;
    noindex: boolean;
    schema_markup?: string | null;
    status: PageStatus;
}

// ==================== Complete Tool Data ====================
export interface CompleteToolData {
    category: Category;
    tool: Omit<Tool, "created_at" | "updated_at">;
    page: ToolPage;
}

// ==================== API Request/Response ====================
export interface ToolListParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: ToolStatus;
    badge?: ToolBadge;
    access_level?: AccessLevel;
    is_featured?: boolean;
    sort_by?: SortField;
    sort_order?: SortOrder;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface ToolListResponse {
    success: boolean;
    message: string;
    data: Tool[];
    meta: PaginationMeta;
}

export interface ToolDetailResponse {
    success: boolean;
    message: string;
    data: CompleteToolData;
}

export interface BulkUpdatePayload {
    ids: number[];
    updates: Partial<Omit<Tool, "id" | "created_at" | "updated_at">>;
}

export interface BulkDeletePayload {
    ids: number[];
    permanent: boolean;
}

export interface DuplicateToolPayload {
    new_slug: string;
    new_title?: string;
}

export interface SlugCheckResponse {
    success: boolean;
    data: {
        slug: string;
        available: boolean;
    };
}

export interface ToolAnalytics {
    total_views: number;
    unique_users: number;
    avg_session_duration: number;
}

export interface ToolAnalyticsResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        title: string;
        slug: string;
        category_slug: string;
        created_at: string;
        analytics: ToolAnalytics;
    };
}

// ==================== Form Types ====================
export interface ToolFormData {
    category: Category;
    tool: Omit<Tool, "id" | "created_at" | "updated_at" | "views" | "users_count" | "rating">;
    page: ToolPage;
}

// ==================== Filter State ====================
export interface ToolFilters {
    search: string;
    category: string;
    status: ToolStatus | "";
    badge: ToolBadge | "";
    access_level: AccessLevel | "";
    is_featured: boolean | "";
    sort_by: SortField;
    sort_order: SortOrder;
}

// ==================== Selection State ====================
export interface SelectionState {
    selectedIds: Set<number>;
    selectAll: boolean;
}