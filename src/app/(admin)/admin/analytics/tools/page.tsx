"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, ToolAnalyticsItem } from "@/services/analytics.service";
import { toolsApi } from "@/services/tools.service";
import DateRangePicker, { DateRangeValue } from "@/components/admin/analytics/DateRangePicker";

export default function ToolAnalyticsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [healthTier, setHealthTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Default to "all" (All Time) so existing historical data is immediately visible
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    preset: "all",
    startDate: "2020-01-01",
    endDate: "",
    label: "All Time",
  });

  // 1. Fetch Tool Diagnostics List
  const { data: analyticsRes, isLoading, refetch } = useQuery({
    queryKey: [
      "admin-tools-analytics",
      page,
      limit,
      search,
      category,
      healthTier,
      sortBy,
      sortOrder,
      dateRange.preset,
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: async () => {
      const res = await analyticsApi.getToolsAnalytics({
        page,
        limit,
        search: search.trim() || undefined,
        category: category === "all" ? undefined : category,
        health_tier: healthTier === "all" ? undefined : (healthTier as any),
        sort_by: sortBy,
        sort_order: sortOrder,
        range: dateRange.preset === "custom" ? undefined : dateRange.preset,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      });
      return res;
    },
  });

  // 2. Fetch Categories for Filter
  const { data: categoriesRes } = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      const res = await toolsApi.getCategories();
      return res.data ?? [];
    },
  });

  const tools: ToolAnalyticsItem[] = analyticsRes?.data ?? [];
  const meta = analyticsRes?.meta ?? { total: 0, page: 1, limit: 15, totalPages: 1 };
  const categories = categoriesRes ?? [];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="adminPage">
      {/* ── 1. Top Controls Bar with DateRangePicker ── */}
      <div className="analyticsFilterBar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          {/* Advanced Dual Calendar Date Picker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "220px", flex: 1, maxWidth: "320px" }}>
            <input
              type="text"
              placeholder="Search by tool name or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.84rem",
                outline: "none",
              }}
            />
            <i
              className="bi bi-search"
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            className="tableCategorySelect"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_slug} value={c.category_slug}>
                {c.page_title || c.category_slug}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

      {/* ── 2. Health Tier Filter Pills ── */}
      <div className="tableFilterBar">
        <div className="tableFilterPills">
          {[
            { id: "all", label: "All Health Tiers", icon: "bi-layers" },
            { id: "star", label: "Star Performers", icon: "bi-stars", color: "#059669" },
            { id: "high_potential", label: "High Potential (Hidden Gems)", icon: "bi-graph-up", color: "#4f46e5" },
            { id: "needs_optimization", label: "High Drop-Off (Needs Fix)", icon: "bi-exclamation-octagon", color: "#dc2626" },
            { id: "dormant", label: "Dormant (0 Usage)", icon: "bi-moon-stars", color: "#64748b" },
          ].map((pill) => (
            <button
              key={pill.id}
              className={`tableFilterPill ${healthTier === pill.id ? "active" : ""}`}
              onClick={() => {
                setHealthTier(pill.id);
                setPage(1);
              }}
            >
              <i className={`bi ${pill.icon}`} style={{ color: pill.color }} />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Diagnostic Data Table ── */}
      <div className="adminCard" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#475569" }}>
                  Tool & Category
                </th>
                <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                  Health Tier
                </th>
                <th
                  onClick={() => handleSort("views")}
                  style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Views</span>
                    {sortBy === "views" && (
                      <i className={`bi bi-arrow-${sortOrder === "asc" ? "up" : "down"}`} style={{ color: "var(--admin-accent)" }} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("runs")}
                  style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Runs</span>
                    {sortBy === "runs" && (
                      <i className={`bi bi-arrow-${sortOrder === "asc" ? "up" : "down"}`} style={{ color: "var(--admin-accent)" }} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("conversion_rate")}
                  style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", cursor: "pointer", userSelect: "none", minWidth: "140px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Conversion Rate</span>
                    {sortBy === "conversion_rate" && (
                      <i className={`bi bi-arrow-${sortOrder === "asc" ? "up" : "down"}`} style={{ color: "var(--admin-accent)" }} />
                    )}
                  </div>
                </th>
                <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                  Satisfaction
                </th>
                <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                  Cross-Sell Clicks
                </th>
                <th
                  onClick={() => handleSort("last_used_at")}
                  style={{ padding: "12px 14px", fontWeight: 700, color: "#475569", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Last Used</span>
                    {sortBy === "last_used_at" && (
                      <i className={`bi bi-arrow-${sortOrder === "asc" ? "up" : "down"}`} style={{ color: "var(--admin-accent)" }} />
                    )}
                  </div>
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#475569", textAlign: "right" }}>
                  Action Trigger
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    <i className="bi bi-arrow-repeat spin" style={{ fontSize: "1.5rem", display: "inline-block", marginBottom: "8px" }} />
                    <div>Loading tool diagnostics...</div>
                  </td>
                </tr>
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    <i className="bi bi-inbox" style={{ fontSize: "1.8rem", display: "block", marginBottom: "8px" }} />
                    No tools match the selected filters.
                  </td>
                </tr>
              ) : (
                tools.map((t) => {
                  const convClass =
                    t.conversion_rate >= 60 ? "high" : t.conversion_rate >= 30 ? "mid" : "low";

                  return (
                    <tr
                      key={t.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" }}
                      className="tableRowHover"
                    >
                      {/* Tool Title & Slug */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.88rem" }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                          <code>{t.slug}</code>
                          <span>•</span>
                          <span style={{ textTransform: "capitalize" }}>{t.category_slug.replace("-", " ")}</span>
                        </div>
                      </td>

                      {/* Health Tier Badge */}
                      <td style={{ padding: "14px 14px" }}>
                        {t.health_tier === "star" && (
                          <span className="tierBadge star">
                            <i className="bi bi-stars" /> Star Performer
                          </span>
                        )}
                        {t.health_tier === "high_potential" && (
                          <span className="tierBadge highPotential">
                            <i className="bi bi-gem" /> High Potential
                          </span>
                        )}
                        {t.health_tier === "needs_optimization" && (
                          <span className="tierBadge needsOpt">
                            <i className="bi bi-exclamation-triangle-fill" /> High Drop-off
                          </span>
                        )}
                        {t.health_tier === "dormant" && (
                          <span className="tierBadge dormant">
                            <i className="bi bi-moon" /> Dormant
                          </span>
                        )}
                        {t.health_tier === "normal" && (
                          <span className="tierBadge normal">
                            Steady
                          </span>
                        )}
                      </td>

                      {/* Views */}
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#0f172a" }}>
                        {t.views.toLocaleString()}
                      </td>

                      {/* Runs */}
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#ff6b35" }}>
                        {t.runs.toLocaleString()}
                      </td>

                      {/* Conversion Rate */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700 }}>
                          <span style={{ color: t.conversion_rate >= 60 ? "#059669" : t.conversion_rate >= 30 ? "#d97706" : "#dc2626" }}>
                            {t.conversion_rate}%
                          </span>
                        </div>
                        <div className="convBarTrack">
                          <div
                            className={`convBarFill ${convClass}`}
                            style={{ width: `${Math.min(100, Math.max(4, t.conversion_rate))}%` }}
                          />
                        </div>
                      </td>

                      {/* Satisfaction */}
                      <td style={{ padding: "14px 14px" }}>
                        {t.satisfaction_rate !== null ? (
                          <span className={`dtBadge ${t.satisfaction_rate >= 80 ? "success" : "warning"}`} style={{ fontSize: "0.72rem" }}>
                            {t.satisfaction_rate}% ({t.feedback_likes} 👍)
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>No ratings</span>
                        )}
                      </td>

                      {/* Cross-Sell Clicks */}
                      <td style={{ padding: "14px 14px", color: "#64748b", fontWeight: 600 }}>
                        {t.ref_clicks}
                      </td>

                      {/* Last Used */}
                      <td style={{ padding: "14px 14px", color: "#64748b", fontSize: "0.78rem" }}>
                        {t.last_used_at ? new Date(t.last_used_at).toLocaleDateString() : "Never"}
                      </td>

                      {/* Action Triggers */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          {/* SEO & Copy Edit Action */}
                          <Link
                            href={`/admin/tools/tool-pages/${t.slug}`}
                            className="dtBtn secondary sm"
                            title="Edit Tool Page Copy, SEO & FAQs"
                          >
                            <i className="bi bi-pencil-square" />
                            <span>Edit Page</span>
                          </Link>

                          {/* Live Site Preview */}
                          <a
                            href={`/tools/${t.category_slug}/${t.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dtBtn ghost sm"
                            title="Open live tool on website"
                          >
                            <i className="bi bi-box-arrow-up-right" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "0.82rem" }}>
          <div style={{ color: "#64748b" }}>
            Showing page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} tools diagnosed)
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="dtBtn secondary sm"
            >
              Previous
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="dtBtn secondary sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
