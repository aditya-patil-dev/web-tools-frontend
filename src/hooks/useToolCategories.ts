import useSWR from "swr";
import { api } from "@/lib/api/api";
import type {
    ToolCategoryListParams,
    ToolCategoryListResponse,
} from "@/types/tool-category.types";

export function useToolCategories(params?: ToolCategoryListParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.search) queryParams.set("search", params.search);
    if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.set("sort_order", params.sort_order);

    const endpoint = `/admin/tools/categories/list?${queryParams.toString()}`;

    const { data, error, isLoading, mutate } = useSWR<ToolCategoryListResponse>(
        endpoint,
        (url: string) => api.get<ToolCategoryListResponse>(url),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return {
        data: data?.data
            ? {
                categories: data.data,
                meta: data.meta,
            }
            : undefined,
        isLoading,
        error,
        refetch: mutate,
    };
}

export function useToolCategory(slug: string | null) {
    const endpoint = slug ? `/admin/tools/categories/${slug}` : null;

    const { data, error, isLoading, mutate } = useSWR(
        endpoint,
        (url: string) => api.get(url),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        category: data?.data,
        isLoading,
        error,
        refetch: mutate,
    };
}