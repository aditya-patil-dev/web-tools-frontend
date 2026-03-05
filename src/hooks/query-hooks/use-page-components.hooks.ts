'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchPageComponents,
    fetchComponentByType,
    fetchAllComponents,
    fetchComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    reorderComponents,
    duplicateComponent,
    ComponentFilters,
    PageComponentDTO,
} from '@/lib/api-calls/page-components.api'

/* =====================================================
   QUERY KEYS — centralized, no typos, easy to invalidate
===================================================== */

export const pageComponentKeys = {
    all: ['page-components'] as const,

    // Public
    byPage: (pageKey: string) =>
        [...pageComponentKeys.all, 'page', pageKey] as const,
    byType: (pageKey: string, componentType: string) =>
        [...pageComponentKeys.all, 'page', pageKey, componentType] as const,

    // Admin
    adminList: (filters?: ComponentFilters) =>
        [...pageComponentKeys.all, 'admin', 'list', filters] as const,
    adminById: (id: number) =>
        [...pageComponentKeys.all, 'admin', id] as const,
}

/* =====================================================
   PUBLIC HOOKS
===================================================== */

/**
 * Fetch all components for a specific page
 * Use in: Home, About, Pricing pages
 *
 * @example
 * const { data, isLoading } = usePageComponents('home')
 */
export function usePageComponents(pageKey: string) {
    return useQuery({
        queryKey: pageComponentKeys.byPage(pageKey),
        queryFn: () => fetchPageComponents(pageKey),
        staleTime: 1000 * 60 * 5,   // 5 minutes — won't hit server again
        enabled: !!pageKey,          // only runs if pageKey exists
    })
}

/**
 * Fetch a single component by type for a specific page
 *
 * @example
 * const { data } = useComponentByType('home', 'hero')
 */
export function useComponentByType(pageKey: string, componentType: string) {
    return useQuery({
        queryKey: pageComponentKeys.byType(pageKey, componentType),
        queryFn: () => fetchComponentByType(pageKey, componentType),
        staleTime: 1000 * 60 * 5,
        enabled: !!pageKey && !!componentType,
    })
}

/* =====================================================
   ADMIN HOOKS — QUERIES
===================================================== */

/**
 * Fetch all components with filters (Admin)
 *
 * @example
 * const { data } = useAllComponents({ page: 1, limit: 10, status: 'active' })
 */
export function useAllComponents(filters?: ComponentFilters) {
    return useQuery({
        queryKey: pageComponentKeys.adminList(filters),
        queryFn: () => fetchAllComponents(filters),
        staleTime: 1000 * 60 * 2,   // 2 minutes for admin (more dynamic)
    })
}

/**
 * Fetch single component by ID (Admin)
 *
 * @example
 * const { data } = useComponentById(42)
 */
export function useComponentById(id: number) {
    return useQuery({
        queryKey: pageComponentKeys.adminById(id),
        queryFn: () => fetchComponentById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    })
}

/* =====================================================
   ADMIN HOOKS — MUTATIONS
===================================================== */

/**
 * Create a new component (Admin)
 *
 * @example
 * const { mutate, isPending } = useCreateComponent()
 * mutate({ page_key: 'home', component_type: 'hero', ... })
 */
export function useCreateComponent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Partial<PageComponentDTO>) => createComponent(data),
        onSuccess: (newComponent) => {
            // Invalidate the page list so it refetches fresh data
            if (newComponent?.page_key) {
                queryClient.invalidateQueries({
                    queryKey: pageComponentKeys.byPage(newComponent.page_key),
                })
            }
            // Invalidate admin list
            queryClient.invalidateQueries({
                queryKey: [...pageComponentKeys.all, 'admin', 'list'],
            })
        },
    })
}

/**
 * Update an existing component (Admin)
 *
 * @example
 * const { mutate, isPending } = useUpdateComponent()
 * mutate({ id: 42, data: { component_name: 'New Name' } })
 */
export function useUpdateComponent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PageComponentDTO> }) =>
            updateComponent(id, data),
        onSuccess: (updatedComponent) => {
            if (!updatedComponent) return

            // Update the single item cache directly (no extra API call)
            queryClient.setQueryData(
                pageComponentKeys.adminById(updatedComponent.id),
                updatedComponent
            )

            // Invalidate related page + admin list
            queryClient.invalidateQueries({
                queryKey: pageComponentKeys.byPage(updatedComponent.page_key),
            })
            queryClient.invalidateQueries({
                queryKey: [...pageComponentKeys.all, 'admin', 'list'],
            })
        },
    })
}

/**
 * Delete a component (Admin)
 *
 * @example
 * const { mutate, isPending } = useDeleteComponent()
 * mutate({ id: 42, pageKey: 'home' })
 */
export function useDeleteComponent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; pageKey: string }) =>
            deleteComponent(id),
        onSuccess: (_, variables) => {
            // Remove from cache immediately
            queryClient.removeQueries({
                queryKey: pageComponentKeys.adminById(variables.id),
            })
            // Invalidate related lists
            queryClient.invalidateQueries({
                queryKey: pageComponentKeys.byPage(variables.pageKey),
            })
            queryClient.invalidateQueries({
                queryKey: [...pageComponentKeys.all, 'admin', 'list'],
            })
        },
    })
}

/**
 * Reorder components (Admin)
 *
 * @example
 * const { mutate } = useReorderComponents()
 * mutate({ pageKey: 'home', orders: [{ id: 1, component_order: 2 }] })
 */
export function useReorderComponents() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            pageKey,
            orders,
        }: {
            pageKey: string
            orders: { id: number; component_order: number }[]
        }) => reorderComponents(pageKey, orders),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: pageComponentKeys.byPage(variables.pageKey),
            })
            queryClient.invalidateQueries({
                queryKey: [...pageComponentKeys.all, 'admin', 'list'],
            })
        },
    })
}

/**
 * Duplicate a component (Admin)
 *
 * @example
 * const { mutate } = useDuplicateComponent()
 * mutate(42)
 */
export function useDuplicateComponent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => duplicateComponent(id),
        onSuccess: (newComponent) => {
            if (newComponent?.page_key) {
                queryClient.invalidateQueries({
                    queryKey: pageComponentKeys.byPage(newComponent.page_key),
                })
            }
            queryClient.invalidateQueries({
                queryKey: [...pageComponentKeys.all, 'admin', 'list'],
            })
        },
    })
}