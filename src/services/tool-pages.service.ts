import { api } from "@/lib/api/api";
import type {
    ToolPageFormData,
    ToolPageListParams,
    ToolPageListResponse,
    ToolPageResponse,
} from "@/types/tool-page.types";

/**
 * Tool Pages API Service
 * All API calls for tool pages CRUD operations
 */
export const toolPagesApi = {
    /**
     * GET /admin/tool-pages - Fetch all tool pages with pagination and filters
     */
    async list(params?: ToolPageListParams): Promise<ToolPageListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.search) queryParams.set("search", params.search);
        if (params?.status) queryParams.set("status", params.status);
        if (params?.tool_slug) queryParams.set("tool_slug", params.tool_slug);
        if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
        if (params?.sort_order) queryParams.set("sort_order", params.sort_order);

        return api.get<ToolPageListResponse>(`/admin/tool-pages?${queryParams.toString()}`);
    },

    /**
     * GET /admin/tool-pages/:slug - Fetch single tool page by slug
     */
    async getBySlug(slug: string): Promise<ToolPageResponse> {
        return api.get<ToolPageResponse>(`/admin/tool-pages/${slug}`);
    },

    /**
     * POST /admin/tool-pages - Create new tool page
     */
    async create(data: ToolPageFormData): Promise<ToolPageResponse> {
        return api.post<ToolPageResponse>("/admin/tool-pages", data);
    },

    /**
     * PUT /admin/tool-pages/:slug - Update existing tool page
     */
    async update(slug: string, data: ToolPageFormData): Promise<ToolPageResponse> {
        return api.put<ToolPageResponse>(`/admin/tool-pages/${slug}`, data);
    },

    /**
     * DELETE /admin/tool-pages/:slug - Delete tool page
     */
    async delete(slug: string): Promise<{ success: boolean; message: string }> {
        return api.delete<{ success: boolean; message: string }>(`/admin/tool-pages/${slug}`);
    },
};