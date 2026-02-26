import { api } from "@/lib/api/api";

/* =====================================================
   TYPE DEFINITIONS
===================================================== */

export interface PageComponentDTO {
    id: number;
    page_key: string;
    component_type: string;
    component_order: number;
    component_name?: string;
    component_data: Record<string, any>;
    is_active: boolean;
    status: "active" | "draft" | "archived";
    version: number;
    created_at: string;
    updated_at: string;
}

interface PageComponentsApiResponse {
    success: boolean;
    message: string;
    data: PageComponentDTO[];
}

interface SingleComponentApiResponse {
    success: boolean;
    message: string;
    data: PageComponentDTO;
}

/* =====================================================
   PUBLIC API FUNCTIONS (Frontend Use)
===================================================== */

/**
 * Fetch all components for a specific page
 * Used in: Home, About, Pricing pages
 */
export async function fetchPageComponents(
    pageKey: string
): Promise<PageComponentDTO[]> {
    try {
        const res = await api.get<PageComponentsApiResponse>(
            `/page-components/page/${pageKey}`
        );

        if (!res.success || !res.data) {
            return [];
        }

        return res.data;
    } catch (error) {
        console.error(`Error fetching components for page: ${pageKey}`, error);
        return [];
    }
}

/**
 * Fetch single component by type
 * Used when you need specific component data
 */
export async function fetchComponentByType(
    pageKey: string,
    componentType: string
): Promise<PageComponentDTO | null> {
    try {
        const res = await api.get<SingleComponentApiResponse>(
            `/page-components/page/${pageKey}/${componentType}`
        );

        if (!res.success || !res.data) {
            return null;
        }

        return res.data;
    } catch (error) {
        console.error(
            `Error fetching component: ${componentType} for page: ${pageKey}`,
            error
        );
        return null;
    }
}

/* =====================================================
   ADMIN API FUNCTIONS
===================================================== */

export interface ComponentFilters {
    page?: number;
    limit?: number;
    search?: string;
    page_key?: string;
    component_type?: string;
    status?: string;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: string;
}

interface PaginatedComponentsResponse {
    success: boolean;
    message: string;
    data: PageComponentDTO[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Fetch all components with filters (Admin)
 */
export async function fetchAllComponents(
    filters?: ComponentFilters
): Promise<{
    components: PageComponentDTO[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}> {
    try {
        const queryParams = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const res = await api.get<PaginatedComponentsResponse>(
            `/page-components/admin?${queryParams.toString()}`
        );

        if (!res.success) {
            throw new Error(res.message);
        }

        return {
            components: res.data,
            pagination: res.pagination,
        };
    } catch (error) {
        console.error("Error fetching all components:", error);
        throw error;
    }
}

/**
 * Fetch single component by ID (Admin)
 */
export async function fetchComponentById(
    id: number
): Promise<PageComponentDTO | null> {
    try {
        const res = await api.get<SingleComponentApiResponse>(
            `/page-components/admin/${id}`
        );

        if (!res.success || !res.data) {
            return null;
        }

        return res.data;
    } catch (error) {
        console.error(`Error fetching component by ID: ${id}`, error);
        return null;
    }
}

/**
 * Create new component (Admin)
 */
export async function createComponent(
    data: Partial<PageComponentDTO>
): Promise<PageComponentDTO | null> {
    try {
        const res = await api.post<SingleComponentApiResponse>(
            `/page-components/admin`,
            data
        );

        if (!res.success || !res.data) {
            throw new Error(res.message);
        }

        return res.data;
    } catch (error) {
        console.error("Error creating component:", error);
        throw error;
    }
}

/**
 * Update component (Admin)
 */
export async function updateComponent(
    id: number,
    data: Partial<PageComponentDTO>
): Promise<PageComponentDTO | null> {
    try {
        const res = await api.put<SingleComponentApiResponse>(
            `/page-components/admin/${id}`,
            data
        );

        if (!res.success || !res.data) {
            throw new Error(res.message);
        }

        return res.data;
    } catch (error) {
        console.error(`Error updating component: ${id}`, error);
        throw error;
    }
}

/**
 * Delete component (Admin)
 */
export async function deleteComponent(id: number): Promise<boolean> {
    try {
        const res = await api.delete<{ success: boolean; message: string }>(
            `/page-components/admin/${id}`
        );

        return res.success;
    } catch (error) {
        console.error(`Error deleting component: ${id}`, error);
        throw error;
    }
}

/**
 * Reorder components (Admin)
 */
export async function reorderComponents(
    pageKey: string,
    orders: { id: number; component_order: number }[]
): Promise<boolean> {
    try {
        const res = await api.post<{ success: boolean; message: string }>(
            `/page-components/admin/reorder`,
            {
                page_key: pageKey,
                orders,
            }
        );

        return res.success;
    } catch (error) {
        console.error("Error reordering components:", error);
        throw error;
    }
}

/**
 * Duplicate component (Admin)
 */
export async function duplicateComponent(
    id: number
): Promise<PageComponentDTO | null> {
    try {
        const res = await api.post<SingleComponentApiResponse>(
            `/page-components/admin/${id}/duplicate`,
            {}
        );

        if (!res.success || !res.data) {
            throw new Error(res.message);
        }

        return res.data;
    } catch (error) {
        console.error(`Error duplicating component: ${id}`, error);
        throw error;
    }
}