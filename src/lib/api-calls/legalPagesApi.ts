// ─── Legal Pages API Service ──────────────────────────────────────────────────
//
// SERVER calls  → legalPagesServer.*  (native fetch, supports Next.js ISR cache)
// CLIENT calls  → legalPagesClient.* (your centralized axios api client)
// ADMIN calls   → legalPagesAdmin.*  (your centralized axios api client)
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "@/lib/api/api";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface LegalPageData {
    id: number;
    page_key: string;
    slug: string;
    title: string;
    content: string;
    content_json?: Record<string, unknown>;
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    noindex: boolean;
    status: "published" | "draft";
    updated_at: string;
}

export interface LegalPageListItem {
    id: number;
    page_key: string;
    slug: string;
    title: string;
    updated_at: string;
}

export interface AdminLegalPageListItem {
    id: number;
    page_key: string;
    slug: string;
    title: string;
    status: "published" | "draft";
    updated_at: string;
}

export interface AdminLegalPagesListResponse {
    pages: AdminLegalPageListItem[];
    total: number;
}

export interface CreateLegalPagePayload {
    page_key: string;
    slug: string;
    title: string;
    content: string;
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    noindex: boolean;
    status: "published" | "draft";
}

export interface UpdateLegalPagePayload {
    title?: string;
    slug?: string;
    content?: string;
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    noindex?: boolean;
    status?: "published" | "draft";
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

const ENDPOINTS = {
    allPages: "/legal-pages",
    bySlug: (slug: string) => `/legal-pages/${slug}`,
    admin: "/legal-pages/admin",
    adminById: (id: number) => `/legal-pages/admin/${id}`,
} as const;

// ─── Error Class ──────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

// ─── SERVER-SIDE ──────────────────────────────────────────────────────────────
// Use in: page.tsx, generateStaticParams, generateMetadata (Server Components)

export const legalPagesServer = {
    async fetchAll(): Promise<LegalPageListItem[]> {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
        const res = await fetch(`${base}${ENDPOINTS.allPages}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) throw new Error(`Failed to fetch legal pages list (status ${res.status})`);
        const json: ApiResponse<LegalPageListItem[]> = await res.json();
        return json.data;
    },

    async fetchBySlug(slug: string): Promise<LegalPageData> {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
        const res = await fetch(`${base}${ENDPOINTS.bySlug(slug)}`, {
            next: { revalidate: 3600 },
        });
        if (res.status === 404) throw new NotFoundError(`Legal page "${slug}" not found`);
        if (!res.ok) throw new Error(`Failed to fetch legal page "${slug}" (status ${res.status})`);
        const json: ApiResponse<LegalPageData> = await res.json();
        return json.data;
    },
};

// ─── CLIENT-SIDE ──────────────────────────────────────────────────────────────
// Use in: "use client" components only

export const legalPagesClient = {
    async fetchAll(): Promise<LegalPageListItem[]> {
        const json = await api.get<ApiResponse<LegalPageListItem[]>>(ENDPOINTS.allPages);
        return json.data;
    },

    async fetchBySlug(slug: string): Promise<LegalPageData> {
        try {
            const json = await api.get<ApiResponse<LegalPageData>>(ENDPOINTS.bySlug(slug));
            return json.data;
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr?.response?.status === 404) {
                throw new NotFoundError(`Legal page "${slug}" not found`);
            }
            throw err;
        }
    },
};

// ─── ADMIN-SIDE ───────────────────────────────────────────────────────────────
// Use in: Admin "use client" components only

export const legalPagesAdmin = {
    /** GET /legal-pages/admin — all pages with optional filters */
    async fetchAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: "published" | "draft";
    }): Promise<AdminLegalPagesListResponse> {
        const query = new URLSearchParams();
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        if (params?.search) query.set("search", params.search);
        if (params?.status) query.set("status", params.status);
        const qs = query.toString();
        const json = await api.get<ApiResponse<AdminLegalPagesListResponse>>(
            `${ENDPOINTS.admin}${qs ? `?${qs}` : ""}`
        );
        return json.data;
    },

    /** GET /legal-pages/admin/:id */
    async fetchById(id: number): Promise<LegalPageData> {
        const json = await api.get<ApiResponse<LegalPageData>>(ENDPOINTS.adminById(id));
        return json.data;
    },

    /** POST /legal-pages/admin */
    async create(payload: CreateLegalPagePayload): Promise<void> {
        await api.post<ApiResponse<void>>(ENDPOINTS.admin, {
            ...payload,
            created_by: "admin",
        });
    },

    /** PUT /legal-pages/admin/:id */
    async update(id: number, payload: UpdateLegalPagePayload): Promise<void> {
        await api.put<ApiResponse<void>>(ENDPOINTS.adminById(id), {
            ...payload,
            updated_by: "admin",
        });
    },

    /** DELETE /legal-pages/admin/:id */
    async remove(id: number): Promise<void> {
        await api.delete<ApiResponse<void>>(ENDPOINTS.adminById(id));
    },
};