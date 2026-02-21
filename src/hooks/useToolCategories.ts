import useSWR from "swr";
import { useState, useEffect } from "react";
import { toolCategoriesApi } from "@/services/tool-categories.service";
import type {
    ToolCategoryListParams,
    ToolCategoryListResponse,
    ToolCategoryResponse,
} from "@/types/tool-category.types";

/**
 * Fetch list of categories with pagination
 */
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
        () => toolCategoriesApi.list(params),
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

/**
 * Fetch single category by slug
 */
export function useToolCategory(slug: string | null) {
    const endpoint = slug ? `/admin/tools/categories/${slug}` : null;

    const { data, error, isLoading, mutate } = useSWR<ToolCategoryResponse>(
        endpoint,
        slug ? () => toolCategoriesApi.getBySlug(slug) : null,
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

/**
 * Check if slug is available (with debouncing)
 */
export function useSlugAvailability(slug: string, enabled: boolean = true) {
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !slug || slug.length < 2) {
            setIsAvailable(null);
            return;
        }

        // Debounce
        const timer = setTimeout(async () => {
            setIsChecking(true);
            setError(null);

            try {
                const result = await toolCategoriesApi.checkSlug(slug);
                setIsAvailable(result.data.available);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Check failed");
                setIsAvailable(null);
            } finally {
                setIsChecking(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [slug, enabled]);

    return { isChecking, isAvailable, error };
}