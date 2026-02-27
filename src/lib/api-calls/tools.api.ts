import { api } from "@/lib/api/api";

export type ToolPageDTO = {
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

// Speed Test Types
export interface SpeedTestRequest {
  url: string;
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
  recommendations: Array<{
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
  }>;
}

export const toolsApi = {
  /**
   * Test website speed
   */
  testWebsiteSpeed: async (
    data: SpeedTestRequest,
  ): Promise<SpeedTestResponse> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SpeedTestResponse;
    }>("/tools/speed-test", data);

    // Extract the actual data from the response wrapper
    return response.data;
  },
};
