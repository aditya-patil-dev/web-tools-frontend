import { api } from "@/lib/api/api";
import { ApiResponse, PageComponent, ReorderItem } from "../registry/types";

export const pageComponentsApi = {
  /**
   * GET /page-components/admin?page_key=home
   * Load all components for a page (admin view — all statuses)
   */
  getAll(pageKey: string) {
    return api.get<ApiResponse<PageComponent[]>>(
      `/page-components/admin?page_key=${pageKey}`,
    );
  },

  /**
   * PUT /page-components/admin/:id
   * Partial update — pass only what changed
   */
  update(
    id: number,
    body: Partial<
      Pick<
        PageComponent,
        | "component_data"
        | "is_active"
        | "status"
        | "component_name"
        | "component_order"
      >
    >,
  ) {
    return api.put<ApiResponse<PageComponent>>(
      `/page-components/admin/${id}`,
      body,
    );
  },

  /**
   * POST /page-components/admin/:id/duplicate
   */
  duplicate(id: number) {
    return api.post<ApiResponse<PageComponent>>(
      `/page-components/admin/${id}/duplicate`,
    );
  },

  /**
   * DELETE /page-components/admin/:id
   */
  remove(id: number) {
    return api.delete<ApiResponse<null>>(`/page-components/admin/${id}`);
  },

  /**
   * POST /page-components/admin/reorder
   * Body: { page_key, orders: [{ id, component_order }] }
   *
   * FIXED: was sending { items } — backend expects { page_key, orders }
   */
  reorder(pageKey: string, orders: ReorderItem[]) {
    return api.post<ApiResponse<null>>(
      `/page-components/admin/reorder`,
      { page_key: pageKey, orders }, // ← matches backend exactly
    );
  },
};
