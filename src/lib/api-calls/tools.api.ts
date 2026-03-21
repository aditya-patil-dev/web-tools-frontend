import { ToolItem } from "@/app/(public)/tools/tools.config";
import { api } from "@/lib/api/api";
import { toNumber } from "../api/apiHelpers";

export type AllToolsResponse = {
  categories: {
    slug: string;
    category_name: string | null;
    page_title: string;
    page_description: string;
  }[];
  tools: ToolItem[];
};

export type ToolPageDTO = {
  image_url: any;
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  tool_type: string;
  tags?: string[];
  short_description?: string;
  access_level: "free" | "premium" | "pro" | "enterprise";
  daily_limit: number | null;
  monthly_limit: number | null;
  views: number | string;
  users_count: number | string;
  page_title: string;
  page_intro: string;
  long_content?: string;
  features: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  schema_markup?: Record<string, unknown>;
  noindex?: boolean;
};

type ToolPageApiResponse = {
  success: boolean;
  message: string;
  data: ToolPageDTO;
};

// Client-side version (axios) — used by ToolPageClient and other client components
export async function fetchToolPage(
  category: string,
  slug: string,
): Promise<ToolPageDTO> {
  const res = await api.get<ToolPageApiResponse>(`/tools/${category}/${slug}`);
  if (!res.success || !res.data) {
    throw new Error("Tool not found");
  }
  return normalizeToolPage(res.data);
}

// Cannot use axios here because server components have no browser APIs.
export async function fetchToolPageServer(
  category: string,
  slug: string,
): Promise<ToolPageDTO | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    if (!base) {
      console.warn("[Server] NEXT_PUBLIC_API_BASE_URL is not set");
      return null;
    }

    const res = await fetch(`${base}/tools/${category}/${slug}`, {
      cache: "no-store", // always fresh — tool data changes
    });

    if (!res.ok) return null;

    const json = await res.json();

    if (!json.success || !json.data) return null;

    return normalizeToolPage(json.data);
  } catch (e) {
    console.error("[Server] fetchToolPageServer failed:", e);
    return null;
  }
}

// ── Shared normalizer — keeps both versions consistent
function normalizeToolPage(data: ToolPageApiResponse["data"]): ToolPageDTO {
  return {
    ...data,
    views: Number(data.views) || 0,
    users_count: Number(data.users_count) || 0,
    tags: data.tags || [],
    features: data.features || [],
    faqs: data.faqs || [],
    meta_keywords: data.meta_keywords || [],
  };
}

// Redirect Checker Types
interface RedirectHop {
  url: string;
  statusCode: number;
  statusText: string;
  redirectType: string;
  responseTime: number;
  headers: Record<string, string>;
}

interface RedirectResult {
  originalUrl: string;
  finalUrl: string;
  redirectChain: RedirectHop[];
  totalRedirects: number;
  totalTime: number;
  hasIssues: boolean;
  issues: string[];
  timestamp: string;
}

export const checkRedirect = async (url: string): Promise<RedirectResult> => {
  return api
    .post<{
      success: boolean;
      data: RedirectResult;
    }>("/redirect-checker/check", { url })
    .then((res) => res.data);
};

// Fetch ALL tools across every category (no category filter)
export async function fetchAllTools(): Promise<AllToolsResponse> {
  const res = await api.get<{
    success: boolean;
    message: string;
    data: AllToolsResponse;
  }>("/tools/all"); // ← /tools/all, not /tools

  return {
    categories: res.data.categories || [],
    tools: (res.data.tools || []).map((tool: ToolItem) => ({
      ...tool,
      users_count: toNumber(tool.users_count),
      views: toNumber(tool.views),
      rating: toNumber(tool.rating),
    })),
  };
}

// Speed Test Types
export interface SpeedTestRequest {
  url: string;
}

export interface CWVMetric {
  value: number;
  display: string;
  score: number | null;
}

export interface DiagnosticMetric {
  value: number;
  display: string;
  score: number | null;
}

export interface SpeedRecommendation {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  savingsMs?: number;
  savingsBytes?: number;
  savingsDisplay?: string;
}

export interface SpeedTestResponse {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  totalSize: number;
  requests: number;
  imageSize: number;
  scriptSize: number;
  styleSize: number;
  score: number;
  grade: string;
  coreWebVitals: {
    lcp: CWVMetric;
    cls: CWVMetric;
    tbt: CWVMetric;
    fcp: CWVMetric;
    speedIndex: CWVMetric;
  };
  diagnostics: {
    ttfb: DiagnosticMetric;
    domSize: DiagnosticMetric;
    bootupTime: DiagnosticMetric;
    mainThreadWork: DiagnosticMetric;
    thirdPartyBytes: DiagnosticMetric;
  };
  recommendations: SpeedRecommendation[];
  passedAuditsCount: number;
}

export const toolsApi = {
  /**
   * Test website speed via Google PageSpeed Insights
   */
  testWebsiteSpeed: async (
    data: SpeedTestRequest,
  ): Promise<SpeedTestResponse> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SpeedTestResponse;
    }>("/tools/speed-test", data);
    return response.data;
  },

  /**
   * Protect PDF with AES-256 encryption via server-side qpdf.
   * Uses apiClient directly (not api helper) because we need
   * responseType: "blob" to receive the binary PDF back.
   */
  protectPdf: async (opts: {
    file: File;
    password: string;
    ownerPassword: string;
    allowPrint: boolean;
    allowCopy: boolean;
    allowModify: boolean;
  }): Promise<{ blob: Blob; fileName: string }> => {
    // Import apiClient locally — it already handles FormData headers
    // (removes Content-Type so the browser sets the multipart boundary)
    const { default: apiClient } = await import("@/lib/api/api");

    const formData = new FormData();
    formData.append("pdf", opts.file);
    formData.append("password", opts.password);
    formData.append("ownerPassword", opts.ownerPassword);
    formData.append("allowPrint", String(opts.allowPrint));
    formData.append("allowCopy", String(opts.allowCopy));
    formData.append("allowModify", String(opts.allowModify));

    const response = await apiClient.post("/tools/protect-pdf", formData, {
      responseType: "blob",
    });

    // Extract filename from Content-Disposition header if present
    const disposition = response.headers["content-disposition"] || "";
    const nameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    const fileName = nameMatch
      ? nameMatch[1]
      : opts.file.name.replace(/\.pdf$/i, "_protected.pdf");

    const blob = new Blob([response.data], { type: "application/pdf" });
    return { blob, fileName };
  },
};
