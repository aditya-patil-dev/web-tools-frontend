/**
 * src/services/seo.service.ts
 * ─────────────────────────────────────────────────────────
 * Typed API wrappers for:
 *   • Static SEO  — /seo/static/:page_key  (public)
 *                   /seo/admin/static       (admin CRUD)
 *   • Robots      — /seo/robots             (public text)
 *                   /seo/admin/robots        (admin CRUD)
 *
 * Uses the project-wide `api` helper from src/lib/api/api.ts.
 *
 * ─── Scalability contract ────────────────────────────────
 *  • Add a new SEO page → add its key to SEO_PAGE_KEYS only.
 *    No new service methods needed; existing methods cover it.
 *  • All types are exported so hooks/components stay in sync
 *    automatically — change a type here, TypeScript flags everywhere.
 */

import { api } from "@/lib/api/api";

// ─────────────────────────────────────────────────────────
// 1.  PAGE KEYS — add new static pages here only
// ─────────────────────────────────────────────────────────
export const SEO_PAGE_KEYS = {
    HOME: "home",
    ABOUT: "about",
    PRICING: "pricing",
    // Add more keys here when new pages are created, e.g.:
    // CONTACT: "contact",
    // BLOG:    "blog",
} as const;

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[keyof typeof SEO_PAGE_KEYS];

// ─────────────────────────────────────────────────────────
// 2.  SHARED RESPONSE WRAPPER
// ─────────────────────────────────────────────────────────
export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

// ─────────────────────────────────────────────────────────
// 3.  STATIC SEO TYPES  (matches API contract exactly)
// ─────────────────────────────────────────────────────────
export type StaticSeoRecord = {
    id: number;
    page_key: string;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string[] | null;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_type: string | null;
    og_site_name: string | null;
    twitter_card: string | null;
    noindex: boolean;
    nofollow: boolean;
    priority: number;
    changefreq: string;
    schema_markup: string | null;
    status: "active" | "inactive";
    updated_at: string;
};

/** Payload sent on POST / PUT — everything except server-set fields */
export type StaticSeoPayload = Omit<StaticSeoRecord, "id" | "updated_at">;

export type SitemapEntry = {
    page_key: string;
    canonical_url: string;
    priority: number;
    changefreq: string;
    updated_at: string;
};

// ─────────────────────────────────────────────────────────
// 4.  ROBOTS TYPES  (matches API contract exactly)
// ─────────────────────────────────────────────────────────
export type RobotsRuleType = "allow" | "disallow" | "sitemap" | "crawl-delay";
export type RobotsEnv = "production" | "staging" | "all";
export type RobotsStatus = "active" | "inactive";

export type RobotsRule = {
    id: number;
    user_agent: string;
    rule_type: RobotsRuleType;
    path: string | null;
    crawl_delay: number | null;
    status: RobotsStatus;
    environment: RobotsEnv;
    created_at: string;
    updated_at: string;
};

export type RobotsRulePayload = Omit<RobotsRule, "id" | "created_at" | "updated_at">;

// ─────────────────────────────────────────────────────────
// 5.  STATIC SEO — service methods
// ─────────────────────────────────────────────────────────
export const staticSeoService = {

    /** Public: GET /seo/static/:page_key */
    getByPageKey(pageKey: string): Promise<ApiResponse<StaticSeoRecord>> {
        return api.get(`/seo/static/${pageKey}`);
    },

    /** Public: GET /seo/static/sitemap */
    getSitemap(): Promise<ApiResponse<SitemapEntry[]>> {
        return api.get("/seo/static/sitemap");
    },

    /** Admin: GET /seo/admin/static — all records */
    getAll(): Promise<ApiResponse<StaticSeoRecord[]>> {
        return api.get("/seo/admin/static");
    },

    /** Admin: GET /seo/admin/static/:id */
    getById(id: number): Promise<ApiResponse<StaticSeoRecord>> {
        return api.get(`/seo/admin/static/${id}`);
    },

    /** Admin: POST /seo/admin/static */
    create(payload: StaticSeoPayload): Promise<ApiResponse<StaticSeoRecord>> {
        return api.post("/seo/admin/static", payload);
    },

    /** Admin: PUT /seo/admin/static/:id */
    update(
        id: number,
        payload: Partial<StaticSeoPayload>
    ): Promise<ApiResponse<StaticSeoRecord>> {
        return api.put(`/seo/admin/static/${id}`, payload);
    },

    /** Admin: DELETE /seo/admin/static/:id */
    delete(id: number): Promise<ApiResponse<null>> {
        return api.delete(`/seo/admin/static/${id}`);
    },
};

// ─────────────────────────────────────────────────────────
// 6.  ROBOTS — service methods
// ─────────────────────────────────────────────────────────
export const robotsService = {

    /** Public: GET /seo/robots → plain text (used for preview) */
    getPublicText(): Promise<string> {
        return api.get("/seo/robots");
    },

    /** Admin: GET /seo/admin/robots — all rules */
    getAll(): Promise<ApiResponse<RobotsRule[]>> {
        return api.get("/seo/admin/robots");
    },

    /** Admin: GET /seo/admin/robots/:id */
    getById(id: number): Promise<ApiResponse<RobotsRule>> {
        return api.get(`/seo/admin/robots/${id}`);
    },

    /** Admin: POST /seo/admin/robots */
    create(payload: RobotsRulePayload): Promise<ApiResponse<RobotsRule>> {
        return api.post("/seo/admin/robots", payload);
    },

    /** Admin: PUT /seo/admin/robots/:id */
    update(
        id: number,
        payload: Partial<RobotsRulePayload>
    ): Promise<ApiResponse<RobotsRule>> {
        return api.put(`/seo/admin/robots/${id}`, payload);
    },

    /** Admin: DELETE /seo/admin/robots/:id */
    delete(id: number): Promise<ApiResponse<null>> {
        return api.delete(`/seo/admin/robots/${id}`);
    },
};