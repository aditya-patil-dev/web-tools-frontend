import axios, { AxiosInstance, AxiosError } from "axios";
import type {
    ToolListParams,
    ToolListResponse,
    ToolDetailResponse,
    ApiResponse,
    CompleteToolData,
    BulkUpdatePayload,
    BulkDeletePayload,
    DuplicateToolPayload,
    SlugCheckResponse,
    ToolAnalyticsResponse,
    CategoryWithStats,
    Category,
    Tool,
} from "@/types/tool.types";

class ToolsApiService {
    private client: AxiosInstance;
    private baseURL = "/admin/tools";

    constructor() {
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Request interceptor for auth token
        this.client.interceptors.request.use(
            (config) => {
                // Get token from localStorage or your auth state management
                const token = localStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    private handleError(error: AxiosError) {
        if (error.response) {
            // Server responded with error status
            console.error("API Error:", error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error("Network Error:", error.request);
        } else {
            // Something else happened
            console.error("Error:", error.message);
        }
    }

    // ==================== Tool CRUD ====================

    /**
     * Get paginated list of tools with filters
     */
    async getTools(params?: ToolListParams): Promise<ToolListResponse> {
        const response = await this.client.get<ToolListResponse>("", { params });
        return response.data;
    }

    /**
     * Get single tool by ID with complete data
     */
    async getToolById(id: number): Promise<ToolDetailResponse> {
        const response = await this.client.get<ToolDetailResponse>(`/${id}`);
        return response.data;
    }

    /**
     * Create new tool
     */
    async createTool(data: CompleteToolData): Promise<ApiResponse<Tool>> {
        const response = await this.client.post<ApiResponse<Tool>>("", data);
        return response.data;
    }

    /**
     * Update existing tool
     */
    async updateTool(
        id: number,
        data: Partial<CompleteToolData>
    ): Promise<ApiResponse<CompleteToolData>> {
        const response = await this.client.put<ApiResponse<CompleteToolData>>(`/${id}`, data);
        return response.data;
    }

    /**
     * Soft delete tool (set status to disabled)
     */
    async deleteTool(id: number): Promise<ApiResponse<void>> {
        const response = await this.client.delete<ApiResponse<void>>(`/${id}`);
        return response.data;
    }

    /**
     * Permanently delete tool from database
     */
    async permanentDeleteTool(id: number): Promise<ApiResponse<void>> {
        const response = await this.client.delete<ApiResponse<void>>(`/${id}/permanent`);
        return response.data;
    }

    // ==================== Bulk Operations ====================

    /**
     * Bulk update multiple tools
     */
    async bulkUpdate(payload: BulkUpdatePayload): Promise<ApiResponse<{ updated_count: number }>> {
        const response = await this.client.patch<ApiResponse<{ updated_count: number }>>(
            "/bulk/update",
            payload
        );
        return response.data;
    }

    /**
     * Bulk delete multiple tools
     */
    async bulkDelete(payload: BulkDeletePayload): Promise<ApiResponse<{ deleted_count: number }>> {
        const response = await this.client.post<ApiResponse<{ deleted_count: number }>>(
            "/bulk/delete",
            payload
        );
        return response.data;
    }

    // ==================== Category Operations ====================

    /**
     * Get all categories with tool counts
     */
    async getCategories(): Promise<ApiResponse<CategoryWithStats[]>> {
        const response = await this.client.get<ApiResponse<CategoryWithStats[]>>(
            "/categories/list"
        );
        return response.data;
    }

    /**
     * Get single category by slug
     */
    async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
        const response = await this.client.get<ApiResponse<Category>>(`/categories/${slug}`);
        return response.data;
    }

    /**
     * Create or update category
     */
    async upsertCategory(data: Category): Promise<ApiResponse<Category>> {
        const response = await this.client.post<ApiResponse<Category>>("/categories", data);
        return response.data;
    }

    /**
     * Delete category (only if no tools use it)
     */
    async deleteCategory(slug: string): Promise<ApiResponse<void>> {
        const response = await this.client.delete<ApiResponse<void>>(`/categories/${slug}`);
        return response.data;
    }

    // ==================== Utility Operations ====================

    /**
     * Check if slug is available
     */
    async checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
        const response = await this.client.get<SlugCheckResponse>(`/check/slug/${slug}`);
        return response.data;
    }

    /**
     * Get tool analytics
     */
    async getToolAnalytics(id: number): Promise<ToolAnalyticsResponse> {
        const response = await this.client.get<ToolAnalyticsResponse>(`/${id}/analytics`);
        return response.data;
    }

    /**
     * Duplicate tool with new slug
     */
    async duplicateTool(id: number, payload: DuplicateToolPayload): Promise<ApiResponse<Tool>> {
        const response = await this.client.post<ApiResponse<Tool>>(`/${id}/duplicate`, payload);
        return response.data;
    }

    /**
     * Restore soft-deleted tool
     */
    async restoreTool(id: number): Promise<ApiResponse<void>> {
        const response = await this.client.post<ApiResponse<void>>(`/${id}/restore`);
        return response.data;
    }
}

// Export singleton instance
export const toolsApi = new ToolsApiService();

// Export class for testing or custom instances
export default ToolsApiService;