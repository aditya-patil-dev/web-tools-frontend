import { api } from "@/lib/api/api";
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
  private baseURL = "/admin/tools";

  /**
   * Build query string from params object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return "";

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  // ==================== Tool CRUD ====================

  /**
   * Get paginated list of tools with filters
   */
  async getTools(params?: ToolListParams): Promise<ToolListResponse> {
    const queryString = this.buildQueryString(params);
    return api.get<ToolListResponse>(`${this.baseURL}${queryString}`);
  }

  /**
   * Get single tool by ID with complete data
   */
  async getToolById(id: number): Promise<ToolDetailResponse> {
    return api.get<ToolDetailResponse>(`${this.baseURL}/${id}`);
  }

  /**
   * Create new tool
   */
  async createTool(data: CompleteToolData): Promise<ApiResponse<Tool>> {
    return api.post<ApiResponse<Tool>>(this.baseURL, data);
  }

  /**
   * Update existing tool
   */
  async updateTool(
    id: number,
    data: Partial<CompleteToolData>,
  ): Promise<ApiResponse<CompleteToolData>> {
    return api.put<ApiResponse<CompleteToolData>>(
      `${this.baseURL}/${id}`,
      data,
    );
  }

  /**
   * Soft delete tool (set status to disabled)
   */
  async deleteTool(id: number): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.baseURL}/${id}`);
  }

  /**
   * Permanently delete tool from database
   */
  async permanentDeleteTool(id: number): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.baseURL}/${id}/permanent`);
  }

  // ==================== Bulk Operations ====================

  /**
   * Bulk update multiple tools
   */
  async bulkUpdate(
    payload: BulkUpdatePayload,
  ): Promise<ApiResponse<{ updated_count: number }>> {
    return api.patch<ApiResponse<{ updated_count: number }>>(
      `${this.baseURL}/bulk/update`,
      payload,
    );
  }

  /**
   * Bulk delete multiple tools
   */
  async bulkDelete(
    payload: BulkDeletePayload,
  ): Promise<ApiResponse<{ deleted_count: number }>> {
    return api.post<ApiResponse<{ deleted_count: number }>>(
      `${this.baseURL}/bulk/delete`,
      payload,
    );
  }

  // ==================== Category Operations ====================

  /**
   * Get all categories with tool counts
   */
  async getCategories(): Promise<ApiResponse<CategoryWithStats[]>> {
    return api.get<ApiResponse<CategoryWithStats[]>>(
      `${this.baseURL}/categories/list`,
    );
  }

  /**
   * Get single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return api.get<ApiResponse<Category>>(`${this.baseURL}/categories/${slug}`);
  }

  /**
   * Create or update category
   */
  async upsertCategory(data: Category): Promise<ApiResponse<Category>> {
    return api.post<ApiResponse<Category>>(`${this.baseURL}/categories`, data);
  }

  /**
   * Delete category (only if no tools use it)
   */
  async deleteCategory(slug: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.baseURL}/categories/${slug}`);
  }

  // ==================== Utility Operations ====================

  /**
   * Check if slug is available
   */
  async checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
    return api.get<SlugCheckResponse>(`${this.baseURL}/check/slug/${slug}`);
  }

  /**
   * Get tool analytics
   */
  async getToolAnalytics(id: number): Promise<ToolAnalyticsResponse> {
    return api.get<ToolAnalyticsResponse>(`${this.baseURL}/${id}/analytics`);
  }

  /**
   * Duplicate tool with new slug
   */
  async duplicateTool(
    id: number,
    payload: DuplicateToolPayload,
  ): Promise<ApiResponse<Tool>> {
    return api.post<ApiResponse<Tool>>(
      `${this.baseURL}/${id}/duplicate`,
      payload,
    );
  }

  /**
   * Restore soft-deleted tool
   */
  async restoreTool(id: number): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.baseURL}/${id}/restore`);
  }
}

// Export singleton instance
export const toolsApi = new ToolsApiService();

// Export class for testing or custom instances
export default ToolsApiService;
