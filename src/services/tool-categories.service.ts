import { api } from "@/lib/api/api";
import type {
    ToolCategoryFormData,
    ToolCategoryListParams,
    ToolCategoryListResponse,
    ToolCategoryResponse,
} from "@/types/tool-category.types";

/**
 * Tool Categories API Service
 * All API calls for tool categories CRUD operations
 */
export const toolCategoriesApi = {
    /**
     * Fetch all tool categories with pagination and filters
     */
    async list(params?: ToolCategoryListParams): Promise<ToolCategoryListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.search) queryParams.set("search", params.search);
        if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
        if (params?.sort_order) queryParams.set("sort_order", params.sort_order);

        return api.get<ToolCategoryListResponse>(
            `/admin/tools/categories/list?${queryParams.toString()}`
        );
    },

    /**
     * Fetch single category by slug
     */
    async getBySlug(slug: string): Promise<ToolCategoryResponse> {
        return api.get<ToolCategoryResponse>(`/admin/tools/categories/${slug}`);
    },

    /**
     * Create new category
     */
    async create(data: ToolCategoryFormData): Promise<ToolCategoryResponse> {
        return api.post<ToolCategoryResponse>("/admin/tools/categories", data);
    },

    /**
     * Update existing category
     */
    async update(slug: string, data: ToolCategoryFormData): Promise<ToolCategoryResponse> {
        return api.post<ToolCategoryResponse>(`/admin/tools/categories`, {
            ...data,
            category_slug: slug,
        });
    },

    /**
     * Delete category
     */
    async delete(slug: string): Promise<{ success: boolean; message: string }> {
        return api.delete<{ success: boolean; message: string }>(
            `/admin/tools/categories/${slug}`
        );
    },

    /**
     * Check if category slug is available
     */
    async checkSlug(slug: string): Promise<{ success: boolean; data: { slug: string; available: boolean } }> {
        return api.get<{ success: boolean; data: { slug: string; available: boolean } }>(
            `/admin/tools/check/slug/${slug}`
        );
    },
};