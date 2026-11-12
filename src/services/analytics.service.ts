import { api } from "@/lib/api/api";

export interface AnalyticsOverviewParams {
  range?: "today" | "24h" | "7d" | "30d" | "month" | "custom";
  start_date?: string;
  end_date?: string;
  category?: string;
}

export interface AnalyticsOverviewData {
  kpis: {
    total_views: number;
    views_change: number;
    total_runs: number;
    runs_change: number;
    conversion_rate: number;
    conversion_change: number;
    unique_sessions: number;
    sessions_change: number;
    recommendation_clicks: number;
    satisfaction_rate: number;
    total_feedback: number;
  };
  time_series: Array<{
    timestamp: string;
    views: number;
    runs: number;
    rec_clicks: number;
    conversion_rate: number;
  }>;
  top_tools: Array<{
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    badge?: string;
    runs: number;
    views: number;
    conversion_rate: number;
  }>;
  underperforming_tools: Array<{
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    runs: number;
    views: number;
    conversion_rate: number;
  }>;
  categories: Array<{
    category_slug: string;
    views: number;
    runs: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
}

export interface ToolsAnalyticsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  health_tier?: "all" | "star" | "high_potential" | "needs_optimization" | "dormant";
  sort_by?: string;
  sort_order?: "asc" | "desc";
  range?: string;
  start_date?: string;
  end_date?: string;
}

export interface ToolAnalyticsItem {
  id: number;
  title: string;
  slug: string;
  category_slug: string;
  tool_type: string;
  badge?: string;
  is_featured: boolean;
  status: string;
  last_used_at?: string;
  created_at: string;
  views: number;
  runs: number;
  ref_clicks: number;
  feedback_likes: number;
  feedback_dislikes: number;
  conversion_rate: number;
  satisfaction_rate: number | null;
  feedback_total: number;
  health_tier: "star" | "high_potential" | "needs_optimization" | "dormant" | "normal";
}

export interface EventsTelemetryParams {
  page?: number;
  limit?: number;
  event_type?: string;
  tool_id?: number;
  session_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface EventTelemetryItem {
  id: number;
  tool_id: number;
  tool_title?: string;
  tool_slug?: string;
  category_slug?: string;
  event_type: "PAGE_VIEW" | "TOOL_RUN" | "RECOMMENDATION_CLICK";
  session_id: string;
  user_id?: number | null;
  ref_tool_id?: number | null;
  ref_tool_title?: string | null;
  ref_tool_slug?: string | null;
  meta: any;
  created_at: string;
}

export const analyticsApi = {
  /**
   * GET /admin/analytics/overview - Fetch executive analytics dashboard
   */
  async getOverview(params?: AnalyticsOverviewParams): Promise<{ success: boolean; data: AnalyticsOverviewData }> {
    const q = new URLSearchParams();
    if (params?.range) q.set("range", params.range);
    if (params?.start_date) q.set("start_date", params.start_date);
    if (params?.end_date) q.set("end_date", params.end_date);
    if (params?.category) q.set("category", params.category);

    return api.get<{ success: boolean; data: AnalyticsOverviewData }>(
      `/admin/analytics/overview?${q.toString()}`
    );
  },

  /**
   * GET /admin/analytics/tools - Fetch tool performance diagnostics
   */
  async getToolsAnalytics(params?: ToolsAnalyticsParams): Promise<{
    success: boolean;
    data: ToolAnalyticsItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.category) q.set("category", params.category);
    if (params?.health_tier) q.set("health_tier", params.health_tier);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_order) q.set("sort_order", params.sort_order);
    if (params?.range) q.set("range", params.range);
    if (params?.start_date) q.set("start_date", params.start_date);
    if (params?.end_date) q.set("end_date", params.end_date);

    return api.get<{
      success: boolean;
      data: ToolAnalyticsItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/analytics/tools?${q.toString()}`);
  },

  /**
   * GET /admin/analytics/events - Fetch raw telemetry event stream
   */
  async getEventsTelemetry(params?: EventsTelemetryParams): Promise<{
    success: boolean;
    data: EventTelemetryItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.event_type) q.set("event_type", params.event_type);
    if (params?.tool_id) q.set("tool_id", String(params.tool_id));
    if (params?.session_id) q.set("session_id", params.session_id);
    if (params?.start_date) q.set("start_date", params.start_date);
    if (params?.end_date) q.set("end_date", params.end_date);

    return api.get<{
      success: boolean;
      data: EventTelemetryItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/analytics/events?${q.toString()}`);
  },

  /**
   * POST /tools/events/track - Public client event ingestion
   */
  async trackClientEvent(data: {
    tool_slug?: string;
    tool_id?: number;
    event_type: "PAGE_VIEW" | "TOOL_RUN" | "RECOMMENDATION_CLICK";
    session_id: string;
    ref_tool_slug?: string;
    ref_tool_id?: number;
    meta?: any;
  }) {
    return api.post(`/tools/events/track`, data);
  },
};

