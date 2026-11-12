"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, AnalyticsOverviewData } from "@/services/analytics.service";
import { toolsApi } from "@/services/tools.service";
import DateRangePicker, { DateRangeValue } from "@/components/admin/analytics/DateRangePicker";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function AnalyticsOverviewPage() {
  // Default to "all" (All Time) so existing historical data is immediately visible on first load!
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    preset: "all",
    startDate: "2020-01-01",
    endDate: "",
    label: "All Time",
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 1. Fetch Analytics Overview Data
  const { data: analyticsRes, isLoading, refetch } = useQuery({
    queryKey: [
      "admin-analytics-overview",
      dateRange.preset,
      dateRange.startDate,
      dateRange.endDate,
      selectedCategory,
    ],
    queryFn: async () => {
      const res = await analyticsApi.getOverview({
        range: dateRange.preset === "custom" ? undefined : (dateRange.preset as any),
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });
      return res.data;
    },
  });

  // 2. Fetch Categories for Filter Dropdown
  const { data: categoriesRes } = useQuery({
    queryKey: ["admin-categories-filter"],
    queryFn: async () => {
      const res = await toolsApi.getCategories();
      return res.data ?? [];
    },
  });

  const kpis = analyticsRes?.kpis;
  const timeSeries = analyticsRes?.time_series ?? [];
  const topTools = analyticsRes?.top_tools ?? [];
  const underperforming = analyticsRes?.underperforming_tools ?? [];
  const categoryStats = analyticsRes?.categories ?? [];
  const categories = categoriesRes ?? [];

  // Format Recharts data
  const chartData = timeSeries.map((t) => {
    const d = new Date(t.timestamp);
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      date: dateFormatted,
      fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      views: t.views,
      runs: t.runs,
      conversion_rate: t.conversion_rate,
    };
  });

  // Category chart colors
  const CATEGORY_COLORS = ["#ff6b35", "#6366f1", "#10b981", "#0ea5e9", "#f59e0b", "#ec4899"];

  return (
    <div className="adminPage">
      {/* ── 1. Top Filter Bar with Advanced Date Picker (matching Screenshot 3) ── */}
      <div className="analyticsFilterBar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          {/* Advanced Dual Calendar Date Picker Component */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Category Filter */}
          <select
            className="tableCategorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Tool Categories</option>
            {categories.map((c) => (
              <option key={c.category_slug} value={c.category_slug}>
                {c.page_title || c.category_slug}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="liveTelemetryBadge">
            <span className="livePulseDot" />
            <span>Live Telemetry Active</span>
          </div>

          <button
            onClick={() => refetch()}
            className="dtBtn secondary sm"
            title="Refresh statistics"
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Executive KPI Cards ── */}
      <div className="kpiGrid">
        {/* Total Page Views */}
        <div className="kpiCard">
          <div className="kpiIconWrap" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
            <i className="bi bi-eye-fill" />
          </div>
          <div className="kpiBody">
            <div className="kpiLabel">Total Tool Views</div>
            <div className="kpiValue">
              {isLoading ? "—" : kpis?.total_views.toLocaleString() ?? "0"}
            </div>
            <div className="kpiSub">
              <span className={`metricTrend ${kpis?.views_change && kpis.views_change >= 0 ? "up" : "down"}`}>
                <i className={`bi bi-arrow-${kpis?.views_change && kpis.views_change >= 0 ? "up" : "down"}`} />
                {Math.abs(kpis?.views_change ?? 0)}%
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", marginLeft: "4px" }}>vs previous period</span>
            </div>
          </div>
        </div>

        {/* Total Tool Executions */}
        <div className="kpiCard">
          <div className="kpiIconWrap" style={{ background: "rgba(255, 107, 53, 0.12)", color: "#ff6b35" }}>
            <i className="bi bi-lightning-charge-fill" />
          </div>
          <div className="kpiBody">
            <div className="kpiLabel">Tool Executions (Runs)</div>
            <div className="kpiValue">
              {isLoading ? "—" : kpis?.total_runs.toLocaleString() ?? "0"}
            </div>
            <div className="kpiSub">
              <span className={`metricTrend ${kpis?.runs_change && kpis.runs_change >= 0 ? "up" : "down"}`}>
                <i className={`bi bi-arrow-${kpis?.runs_change && kpis.runs_change >= 0 ? "up" : "down"}`} />
                {Math.abs(kpis?.runs_change ?? 0)}%
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", marginLeft: "4px" }}>utility actions run</span>
            </div>
          </div>
        </div>

        {/* Platform Conversion Rate */}
        <div className="kpiCard">
          <div className="kpiIconWrap" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
            <i className="bi bi-pie-chart-fill" />
          </div>
          <div className="kpiBody">
            <div className="kpiLabel">Global Conversion Rate</div>
            <div className="kpiValue">
              {isLoading ? "—" : `${kpis?.conversion_rate ?? 0}%`}
            </div>
            <div className="kpiSub">
              <span className={`metricTrend ${kpis?.conversion_change && kpis.conversion_change >= 0 ? "up" : "down"}`}>
                {kpis?.conversion_change && kpis.conversion_change >= 0 ? "+" : ""}
                {kpis?.conversion_change ?? 0}%
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", marginLeft: "4px" }}>Runs ÷ Views</span>
            </div>
          </div>
        </div>

        {/* Unique Sessions & Recommendation Clicks */}
        <div className="kpiCard">
          <div className="kpiIconWrap" style={{ background: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" }}>
            <i className="bi bi-people-fill" />
          </div>
          <div className="kpiBody">
            <div className="kpiLabel">Active Sessions & Clicks</div>
            <div className="kpiValue">
              {isLoading ? "—" : kpis?.unique_sessions.toLocaleString() ?? "0"}
            </div>
            <div className="kpiSub">
              <span style={{ color: "#0ea5e9", fontWeight: 700 }}>
                {kpis?.recommendation_clicks ?? 0}
              </span>
              <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: "4px" }}>cross-tool recommendation clicks</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Traffic & Execution Trend Area Chart (Built with Recharts) ── */}
      <div className="adminCard" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Traffic & Usage Momentum
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "3px 0 0 0" }}>
              Visualizing Page Views (purple area) against actual Tool Executions (orange curve) over time.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "0.82rem", fontWeight: 700 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#6366f1" }} />
              <span style={{ color: "#334155" }}>Page Views</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#ff6b35" }} />
              <span style={{ color: "#334155" }}>Tool Executions</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
            <i className="bi bi-bar-chart" style={{ fontSize: "2.4rem", display: "block", marginBottom: "8px", opacity: 0.6 }} />
            No telemetry events found for this date range. Try switching to <strong>All Time</strong> in the date picker above.
          </div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  allowDecimals={false}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: "rgba(15, 23, 42, 0.95)",
                            backdropFilter: "blur(8px)",
                            color: "#ffffff",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                            fontSize: "0.78rem",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <div style={{ fontWeight: 800, marginBottom: "6px", color: "#94a3b8" }}>
                            {data.fullDate}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} />
                            <span>Page Views: <strong>{data.views}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b35" }} />
                            <span>Tool Runs: <strong>{data.runs}</strong></span>
                          </div>
                          <div style={{ marginTop: "4px", paddingTop: "4px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", color: "#10b981", fontWeight: 700 }}>
                            Conversion Rate: {data.conversion_rate}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />

                <Area
                  type="monotone"
                  dataKey="runs"
                  stroke="#ff6b35"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRuns)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── 4. Smart Action Insights Hub (Data-Driven Decisions) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="bi bi-stars" style={{ color: "var(--admin-accent)", fontSize: "1.2rem" }} />
            <h3 style={{ fontSize: "1.02rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Automated Action Recommendations
            </h3>
          </div>
          <Link href="/admin/analytics/tools" className="dtBtn ghost sm">
            View All Tool Diagnostics →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {/* Drop-off action */}
          <div className="insightActionCard warning">
            <div style={{ color: "#ef4444", fontSize: "1.4rem" }}>
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                High Drop-Off Detected
              </div>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 10px 0", lineHeight: 1.5 }}>
                {underperforming.length > 0
                  ? `"${underperforming[0].title}" has ${underperforming[0].views} views but a low run rate of ${underperforming[0].conversion_rate}%. Users may need clearer CTA buttons or FAQ guidance.`
                  : "No high drop-off alerts detected. Platform conversion across all tools is healthy!"}
              </p>
              {underperforming.length > 0 && (
                <Link
                  href={`/admin/tools/tool-pages/${underperforming[0].slug}`}
                  className="dtBtn secondary sm"
                >
                  <i className="bi bi-pencil-square" />
                  <span>Improve Tool Landing Copy & FAQs</span>
                </Link>
              )}
            </div>
          </div>

          {/* High Potential action */}
          <div className="insightActionCard opportunity">
            <div style={{ color: "#6366f1", fontSize: "1.4rem" }}>
              <i className="bi bi-arrow-up-right-circle-fill" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                Feature High-Traffic Catalysts
              </div>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 10px 0", lineHeight: 1.5 }}>
                {topTools.length > 0
                  ? `"${topTools[0].title}" is your #1 visited tool (${topTools[0].views} views). Featuring it on the home page will drive cross-tool conversions.`
                  : "Promote tools that demonstrate strong visitor engagement."}
              </p>
              <Link href="/admin/tools/tools-card" className="dtBtn secondary sm">
                <i className="bi bi-star-fill" style={{ color: "#f59e0b" }} />
                <span>Manage Featured Catalog Tools</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Split Section: Top Executed Tools & Category Recharts Bar Graph ── */}
      <div className="dashboardSplitRow">
        {/* Top Most Visited / Executed Tools */}
        <div className="adminCard" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              🔥 Top Tools Leaderboard
            </h4>
            <Link href="/admin/analytics/tools" className="dtBtn ghost sm">
              Diagnostics Table →
            </Link>
          </div>

          {topTools.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
              No tool data in this window.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {topTools.map((t, idx) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: idx === 0 ? "#ff6b35" : "#94a3b8", width: "18px" }}>
                      #{idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/admin/tools/tool-pages/${t.slug}`}
                        style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", textDecoration: "none" }}
                      >
                        {t.title}
                      </Link>
                      <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        <span style={{ textTransform: "capitalize" }}>{t.category_slug.replace("-", " ")}</span>
                        <span> • </span>
                        <span>{t.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className="dtBadge active" style={{ fontSize: "0.75rem" }}>
                      {t.views} Views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown Bar Chart (Recharts) */}
        <div className="adminCard" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              📊 Category Activity Breakdown
            </h4>
            <Link href="/admin/tools/categories" className="dtBtn ghost sm">
              Categories →
            </Link>
          </div>

          {categoryStats.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
              No category telemetry recorded yet.
            </p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={categoryStats.map((c) => ({
                    name: c.category_slug.replace("-", " "),
                    views: c.views,
                    runs: c.runs,
                  }))}
                  margin={{ top: 0, right: 30, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: "#0f172a",
                              color: "#ffffff",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "0.78rem",
                            }}
                          >
                            <div style={{ fontWeight: 800, textTransform: "capitalize", marginBottom: "4px" }}>
                              {d.name}
                            </div>
                            <div>Views: <strong>{d.views}</strong></div>
                            <div>Runs: <strong>{d.runs}</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="views" radius={[0, 6, 6, 0]}>
                    {categoryStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
