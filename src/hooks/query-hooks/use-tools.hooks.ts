'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import {
    fetchToolPage,
    checkRedirect,
    toolsApi,
    ToolPageDTO,
    SpeedTestRequest,
    SpeedTestResponse,
} from '@/lib/api-calls/tools.api'

/* =====================================================
   QUERY KEYS
===================================================== */

export const toolKeys = {
    all: ['tools'] as const,

    // Tool page data
    page: (category: string, slug: string) =>
        [...toolKeys.all, 'page', category, slug] as const,
}

/* =====================================================
   QUERIES
===================================================== */

/**
 * Fetch tool page data on the CLIENT side
 * Use this in ToolPageClient and other client components
 *
 * NOTE: Do NOT use this in Server Components —
 *       use fetchToolPageServer() directly there instead
 *
 * @example
 * const { data, isLoading, isError } = useToolPage('seo', 'redirect-checker')
 */
export function useToolPage(category: string, slug: string) {
    return useQuery({
        queryKey: toolKeys.page(category, slug),
        queryFn: () => fetchToolPage(category, slug),
        staleTime: 1000 * 60 * 10,  // 10 minutes — tool page content rarely changes
        enabled: !!category && !!slug,
        retry: 1,                    // only retry once on failure (tool not found = hard error)
    })
}

/* =====================================================
   MUTATIONS
   These are user-triggered actions, NOT background fetches.
   That's why they use useMutation instead of useQuery.
===================================================== */

/**
 * Check redirect chain for a URL
 * Triggered when user submits a URL — not a background fetch
 *
 * @example
 * const { mutate, data, isPending } = useCheckRedirect()
 *
 * // On form submit:
 * mutate('https://example.com')
 */
export function useCheckRedirect() {
    return useMutation({
        mutationFn: (url: string) => checkRedirect(url),
    })
}

/**
 * Run a website speed test
 * Triggered when user submits a URL — not a background fetch
 *
 * @example
 * const { mutate, data, isPending } = useSpeedTest()
 *
 * // On form submit:
 * mutate({ url: 'https://example.com' })
 */
export function useSpeedTest() {
    return useMutation({
        mutationFn: (data: SpeedTestRequest) => toolsApi.testWebsiteSpeed(data),
    })
}