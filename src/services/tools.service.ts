import { api } from "@/lib/api/api";
import type {
    ToolListParams,
    ToolListResponse,
    ToolDetailResponse,
    CompleteToolData,
    BulkUpdatePayload,
    BulkDeletePayload,
    ApiResponse,
    CategoryWithStats,
} from "@/types/tool.types";

/**
 * Tools API Service - Single source of truth
 * Consolidates all tool-related API calls
 */
export const toolsApi = {
    // ==================== TOOLS CRUD ====================

    /**
     * GET /admin/tools - Fetch all tools with pagination and filters
     */
    async getTools(params?: ToolListParams): Promise<ToolListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.search) queryParams.set("search", params.search);
        if (params?.category) queryParams.set("category", params.category);
        if (params?.status) queryParams.set("status", params.status);
        if (params?.badge) queryParams.set("badge", params.badge);
        if (params?.access_level) queryParams.set("access_level", params.access_level);
        if (params?.is_featured !== undefined)
            queryParams.set("is_featured", String(params.is_featured));
        if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
        if (params?.sort_order) queryParams.set("sort_order", params.sort_order);

        return api.get<ToolListResponse>(`/admin/tools?${queryParams.toString()}`);
    },

    /**
     * GET /admin/tools/:id - Fetch single tool by ID
     */
    async getToolById(id: number): Promise<ToolDetailResponse> {
        return api.get<ToolDetailResponse>(`/admin/tools/${id}`);
    },

    /**
     * POST /admin/tools - Create new tool
     */
    async createTool(data: CompleteToolData): Promise<ToolDetailResponse> {
        return api.post<ToolDetailResponse>("/admin/tools", data);
    },

    /**
     * PUT /admin/tools/:id - Update existing tool
     */
    async updateTool(id: number, data: Partial<CompleteToolData>): Promise<ToolDetailResponse> {
        return api.put<ToolDetailResponse>(`/admin/tools/${id}`, data);
    },

    /**
     * DELETE /admin/tools/:id - Soft delete tool
     */
    async deleteTool(id: number): Promise<{ success: boolean; message: string }> {
        return api.delete<{ success: boolean; message: string }>(`/admin/tools/${id}`);
    },

    /**
     * DELETE /admin/tools/:id/permanent - Hard delete tool
     */
    async permanentDeleteTool(id: number): Promise<{ success: boolean; message: string }> {
        return api.delete<{ success: boolean; message: string }>(
            `/admin/tools/${id}/permanent`
        );
    },

    /**
     * POST /admin/tools/:id/restore - Restore soft deleted tool
     */
    async restoreTool(id: number): Promise<{ success: boolean; message: string }> {
        return api.post<{ success: boolean; message: string }>(`/admin/tools/${id}/restore`);
    },

    /**
     * POST /admin/tools/:id/duplicate - Duplicate tool
     */
    async duplicateTool(
        id: number,
        data: { new_slug: string; new_title?: string }
    ): Promise<ToolDetailResponse> {
        return api.post<ToolDetailResponse>(`/admin/tools/${id}/duplicate`, data);
    },

    /**
     * GET /admin/tools/:id/analytics - Get tool analytics
     */
    async getToolAnalytics(id: number): Promise<unknown> {
        return api.get<unknown>(`/admin/tools/${id}/analytics`);
    },

    // ==================== BULK OPERATIONS ====================

    /**
     * PATCH /admin/tools/bulk/update - Bulk update tools
     */
    async bulkUpdate(payload: BulkUpdatePayload): Promise<ApiResponse<{ updated_count: number }>> {
        return api.patch<ApiResponse<{ updated_count: number }>>("/admin/tools/bulk/update", payload);
    },

    /**
     * POST /admin/tools/bulk/delete - Bulk delete tools
     */
    async bulkDelete(payload: BulkDeletePayload): Promise<ApiResponse<{ deleted_count: number }>> {
        return api.post<ApiResponse<{ deleted_count: number }>>("/admin/tools/bulk/delete", payload);
    },

    // ==================== CATEGORIES (from /admin/tools/categories/*) ====================

    /**
     * GET /admin/tools/categories/list - Get all categories with tool counts
     */
    async getCategories(): Promise<{
        success: boolean;
        message: string;
        data: CategoryWithStats[];
    }> {
        return api.get<{
            success: boolean;
            message: string;
            data: CategoryWithStats[];
        }>("/admin/tools/categories/list");
    },

    // ==================== UTILITIES ====================

    /**
     * GET /admin/tools/check/slug/:slug - Check if slug is available
     */
    async checkSlugAvailability(
        slug: string
    ): Promise<{ success: boolean; data: { slug: string; available: boolean } }> {
        return api.get<{ success: boolean; data: { slug: string; available: boolean } }>(
            `/admin/tools/check/slug/${slug}`
        );
    },
};