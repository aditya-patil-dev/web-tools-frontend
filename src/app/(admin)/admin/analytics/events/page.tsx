"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, EventTelemetryItem } from "@/services/analytics.service";

// Format timestamps into warm, conversational human-readable relative time
function formatRelativeTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return "Just now";
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago (${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;
    }
    if (diffDays === 1) {
      return `Yesterday at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays < 7) {
      return `${diffDays} days ago (${d.toLocaleDateString([], { month: "short", day: "numeric" })})`;
    }
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// Convert complex GUID into a friendly, memorable visitor identifier
function getVisitorTag(sessionId: string) {
  if (!sessionId) return "Visitor #guest";
  const clean = sessionId.replace(/[^a-zA-Z0-9]/g, "");
  return `Visitor #${clean.slice(0, 6)}`;
}

// Format slug into clean category label
function formatCategory(slug?: string) {
  if (!slug) return "All Tools";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function EventsTelemetryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [eventType, setEventType] = useState<string>("all");
  const [sessionId, setSessionId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"feed" | "table">("feed");
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);
  const [showExplainer, setShowExplainer] = useState<boolean>(true);

  // 1. Fetch Paginated Event Activity from Database
  const { data: telemetryRes, isLoading, refetch } = useQuery({
    queryKey: ["admin-events-telemetry", page, limit, eventType, sessionId],
    queryFn: async () => {
      const res = await analyticsApi.getEventsTelemetry({
        page,
        limit,
        event_type: eventType === "all" ? undefined : eventType,
        session_id: sessionId.trim() || undefined,
      });
      return res;
    },
  });

  const [realtimeEvents, setRealtimeEvents] = useState<EventTelemetryItem[]>([]);

  // 2. Connect to WebSocket for Live real-time event broadcasts
  useEffect(() => {
    if (!isLiveStreaming) return;

    let activeSocket: any = null;

    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

        const socket = io(backendUrl, {
          path: "/socket.io",
          withCredentials: true,
          transports: ["websocket", "polling"],
        });

        activeSocket = socket;

        socket.on("tool:event_created", (newEvent: EventTelemetryItem) => {
          // Check if matches active filters
          if (eventType !== "all" && newEvent.event_type !== eventType) return;
          if (sessionId && newEvent.session_id !== sessionId) return;

          setRealtimeEvents((prev) => [newEvent, ...prev.slice(0, 50)]);
        });
      } catch (err) {
        console.warn("Real-time telemetry socket connection paused:", err);
      }
    };

    connectSocket();

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [isLiveStreaming, eventType, sessionId]);

  const apiEvents: EventTelemetryItem[] = telemetryRes?.data ?? [];
  const meta = telemetryRes?.meta ?? { total: 0, page: 1, limit: 30, totalPages: 1 };

  // Combine realtime events at top if on page 1
  const combinedEvents = useMemo(() => {
    if (page === 1) {
      return [
        ...realtimeEvents.filter((re) => !apiEvents.some((ae) => ae.id === re.id)),
        ...apiEvents,
      ];
    }
    return apiEvents;
  }, [page, realtimeEvents, apiEvents]);

  // Client-side search filter for quick instant filtering by tool name
  const displayEvents = useMemo(() => {
    if (!searchQuery.trim()) return combinedEvents;
    const q = searchQuery.toLowerCase();
    return combinedEvents.filter(
      (e) =>
        e.tool_title?.toLowerCase().includes(q) ||
        e.tool_slug?.toLowerCase().includes(q) ||
        e.session_id?.toLowerCase().includes(q) ||
        e.ref_tool_title?.toLowerCase().includes(q)
    );
  }, [combinedEvents, searchQuery]);

  // Calculate quick summary metrics from current view
  const uniqueVisitorsCount = useMemo(() => {
    const s = new Set(displayEvents.map((e) => e.session_id));
    return s.size;
  }, [displayEvents]);

  const runsCount = useMemo(() => {
    return displayEvents.filter((e) => e.event_type === "TOOL_RUN").length;
  }, [displayEvents]);

  const viewsCount = useMemo(() => {
    return displayEvents.filter((e) => e.event_type === "PAGE_VIEW").length;
  }, [displayEvents]);

  // Export visible events to CSV
  const handleExportCsv = () => {
    if (displayEvents.length === 0) return;

    const headers = [
      "ID",
      "Visitor Action",
      "Visitor Tag",
      "Tool Title",
      "Tool Slug",
      "Category",
      "Referred By",
      "Raw Session ID",
      "Timestamp",
    ];

    const rows = displayEvents.map((e) => [
      e.id,
      e.event_type === "TOOL_RUN"
        ? "Executed Tool"
        : e.event_type === "PAGE_VIEW"
        ? "Opened Page"
        : "Clicked Recommendation",
      getVisitorTag(e.session_id),
      `"${e.tool_title || ""}"`,
      e.tool_slug || "",
      e.category_slug || "",
      `"${e.ref_tool_title || "Direct / Search"}"`,
      e.session_id,
      e.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fusiontools_activity_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="adminPage">
      {/* ── 1. Friendly Explanation Banner (What is this section?) ── */}
      {showExplainer && (
        <div className="activityExplainerBanner">
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#dbeafe",
              color: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}
          >
            <i className="bi bi-info-circle-fill" />
          </div>
          <div style={{ flex: 1, fontSize: "0.85rem", color: "#1e3a8a", lineHeight: 1.5 }}>
            <div style={{ fontWeight: 800, marginBottom: "2px", fontSize: "0.92rem" }}>
              What is the Live Activity Feed?
            </div>
            Think of this as your website&apos;s live pulse. Every time a real person opens a tool, executes an action (e.g. converts an image, merges a PDF), or jumps to a recommended tool, their step shows up here in plain English. Click <strong>&quot;Trace Visitor Journey&quot;</strong> on any card to follow that person&apos;s step-by-step path across your site!
          </div>
          <button
            onClick={() => setShowExplainer(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#60a5fa",
              fontSize: "1.1rem",
              padding: "2px",
            }}
            title="Dismiss explanation"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {/* ── 2. Top Summary KPI Cards ── */}
      <div className="activitySummaryGrid">
        {/* Live Stream Status Card */}
        <div className="activitySummaryCard">
          <div
            className="activitySummaryIcon"
            style={{
              background: isLiveStreaming ? "rgba(16, 185, 129, 0.12)" : "rgba(100, 116, 139, 0.12)",
              color: isLiveStreaming ? "#059669" : "#64748b",
            }}
          >
            {isLiveStreaming ? <span className="livePulseDot" /> : <i className="bi bi-pause-fill" />}
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Live Stream Connection
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              {isLiveStreaming ? "Active & Streaming" : "Stream Paused"}
            </div>
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--admin-accent)",
                cursor: "pointer",
                marginTop: "2px",
              }}
            >
              {isLiveStreaming ? "Pause Live Updates" : "Resume Live Updates"}
            </button>
          </div>
        </div>

        {/* Unique Visitors in View */}
        <div className="activitySummaryCard">
          <div
            className="activitySummaryIcon"
            style={{ background: "rgba(99, 102, 241, 0.12)", color: "#4f46e5" }}
          >
            <i className="bi bi-people-fill" />
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Active Visitors in Feed
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              {uniqueVisitorsCount}{" "}
              <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748b" }}>
                unique sessions
              </span>
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
              across {meta.total} recorded actions
            </div>
          </div>
        </div>

        {/* Tool Executions Completed */}
        <div className="activitySummaryCard">
          <div
            className="activitySummaryIcon"
            style={{ background: "rgba(255, 107, 53, 0.12)", color: "#ea580c" }}
          >
            <i className="bi bi-lightning-charge-fill" />
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Tool Runs in View
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              {runsCount}{" "}
              <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748b" }}>
                utility runs
              </span>
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
              vs {viewsCount} browsing views
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Active Journey Filter Notice (If Filtering by a Visitor) ── */}
      {sessionId && (
        <div className="journeyActiveBanner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="bi bi-compass-fill" style={{ fontSize: "1.3rem", color: "#d97706" }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#92400e" }}>
                Tracing Visitor Journey: {getVisitorTag(sessionId)}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#b45309" }}>
                Viewing all actions performed by this specific person in chronological order.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSessionId("");
              setPage(1);
            }}
            className="dtBtn secondary sm"
            style={{ background: "#ffffff", borderColor: "#f59e0b", color: "#b45309" }}
          >
            <i className="bi bi-x-circle" />
            <span>Show All Visitors</span>
          </button>
        </div>
      )}

      {/* ── 4. Main Controls Bar (View Mode Switcher + Search + Export) ── */}
      <div className="analyticsFilterBar" style={{ flexWrap: "wrap", gap: "12px" }}>
        {/* View Mode Toggle: Easy View vs Data Table */}
        <div className="viewModeToggle">
          <button
            onClick={() => setViewMode("feed")}
            className={`viewModeBtn ${viewMode === "feed" ? "active" : ""}`}
            title="Visual, friendly story timeline"
          >
            <i className="bi bi-view-stacked" />
            <span>Activity Feed (Easy View)</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`viewModeBtn ${viewMode === "table" ? "active" : ""}`}
            title="Detailed spreadsheet style table"
          >
            <i className="bi bi-table" />
            <span>Data Table</span>
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: "relative", minWidth: "240px", flex: 1, maxWidth: "400px" }}>
          <i
            className="bi bi-search"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: "0.85rem",
            }}
          />
          <input
            type="text"
            placeholder="Search by tool name, visitor ID, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px 7px 34px",
              fontSize: "0.82rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              outline: "none",
              background: "#ffffff",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              <i className="bi bi-x-circle-fill" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleExportCsv} className="dtBtn secondary sm" title="Export to CSV">
            <i className="bi bi-download" />
            <span>Export CSV</span>
          </button>
          <button onClick={() => refetch()} className="dtBtn secondary sm" title="Refresh feed now">
            <i className="bi bi-arrow-clockwise" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 5. Action Type Filter Tabs ── */}
      <div className="tableFilterBar" style={{ marginBottom: "16px" }}>
        <div className="tableFilterPills">
          {[
            { id: "all", label: "All Activity", icon: "bi-activity" },
            {
              id: "TOOL_RUN",
              label: "Tool Executions (Runs)",
              icon: "bi-lightning-charge-fill",
              color: "#ff6b35",
            },
            {
              id: "PAGE_VIEW",
              label: "Page Views (Browsing)",
              icon: "bi-eye-fill",
              color: "#6366f1",
            },
            {
              id: "RECOMMENDATION_CLICK",
              label: "Suggestions Followed",
              icon: "bi-arrow-repeat",
              color: "#10b981",
            },
          ].map((pill) => (
            <button
              key={pill.id}
              className={`tableFilterPill ${eventType === pill.id ? "active" : ""}`}
              onClick={() => {
                setEventType(pill.id);
                setRealtimeEvents([]);
                setPage(1);
              }}
            >
              <i className={`bi ${pill.icon}`} style={{ color: pill.color }} />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 6. FEED VIEW (Intuitive Human Story Mode) ── */}
      {viewMode === "feed" && (
        <div className="activityFeedList">
          {isLoading ? (
            <div
              className="adminCard"
              style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}
            >
              <i
                className="bi bi-arrow-repeat spin"
                style={{ fontSize: "2rem", display: "inline-block", marginBottom: "12px" }}
              />
              <div style={{ fontWeight: 600 }}>Loading activity stream...</div>
            </div>
          ) : displayEvents.length === 0 ? (
            <div
              className="adminCard"
              style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}
            >
              <i
                className="bi bi-broadcast"
                style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px", color: "#cbd5e1" }}
              />
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#475569", marginBottom: "4px" }}>
                No Activity Recorded
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                {sessionId
                  ? "This visitor has no additional actions recorded in this filter."
                  : "No visitor actions match the selected filter or search term."}
              </div>
              {sessionId && (
                <button
                  onClick={() => setSessionId("")}
                  className="dtBtn primary sm"
                  style={{ marginTop: "14px" }}
                >
                  Clear Visitor Filter
                </button>
              )}
            </div>
          ) : (
            displayEvents.map((e, idx) => {
              const isRun = e.event_type === "TOOL_RUN";
              const isView = e.event_type === "PAGE_VIEW";
              const isRec = e.event_type === "RECOMMENDATION_CLICK";
              const visitorTag = getVisitorTag(e.session_id);

              return (
                <div key={e.id} className="activityFeedCard">
                  {/* Action Icon */}
                  <div
                    className={`activityIcon ${isRun ? "run" : isView ? "view" : "rec"}`}
                    title={
                      isRun
                        ? "Executed a tool"
                        : isView
                        ? "Viewed a tool page"
                        : "Followed a recommended tool"
                    }
                  >
                    {isRun && <i className="bi bi-lightning-charge-fill" />}
                    {isView && <i className="bi bi-eye-fill" />}
                    {isRec && <i className="bi bi-arrow-repeat" />}
                  </div>

                  {/* Story & Details */}
                  <div className="activityBody">
                    {/* Story Title */}
                    <div className="activityStoryTitle">
                      <span style={{ color: "#475569", fontWeight: 600 }}>{visitorTag} </span>
                      {isRun && (
                        <span>
                          executed{" "}
                          <strong style={{ color: "#ea580c" }}>
                            {e.tool_title || `Tool #${e.tool_id}`}
                          </strong>
                        </span>
                      )}
                      {isView && (
                        <span>
                          opened{" "}
                          <strong style={{ color: "#0f172a" }}>
                            {e.tool_title || `Tool #${e.tool_id}`}
                          </strong>
                        </span>
                      )}
                      {isRec && (
                        <span>
                          discovered{" "}
                          <strong style={{ color: "#059669" }}>
                            {e.tool_title || `Tool #${e.tool_id}`}
                          </strong>
                        </span>
                      )}
                    </div>

                    {/* Explanatory Subtitle */}
                    <div className="activityStorySub">
                      {isRun && (
                        <span style={{ color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="bi bi-check-circle-fill" /> Successfully processed and ran this tool
                        </span>
                      )}
                      {isView && (
                        <span>
                          Browsed the tool&apos;s interactive workspace
                        </span>
                      )}
                      {isRec && (
                        <span style={{ color: "#059669" }}>
                          Clicked related suggestion while exploring &quot;{e.ref_tool_title || "another tool"}&quot;
                        </span>
                      )}

                      {/* Tool Category Tag */}
                      {e.category_slug && (
                        <span
                          style={{
                            background: "#f1f5f9",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#475569",
                          }}
                        >
                          {formatCategory(e.category_slug)}
                        </span>
                      )}

                      {/* Live Link to Tool */}
                      {e.tool_slug && (
                        <Link
                          href={`/${e.tool_slug}`}
                          target="_blank"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: "0.74rem",
                            color: "var(--admin-accent)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                          title="Open live tool in a new tab"
                        >
                          <span>Open Tool</span>
                          <i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.68rem" }} />
                        </Link>
                      )}
                    </div>

                    {/* Bottom Meta & Visitor Trace Bar */}
                    <div className="activityMetaRow">
                      {/* Visitor Filter Button */}
                      <button
                        onClick={() => {
                          setSessionId(e.session_id);
                          setPage(1);
                        }}
                        className="visitorJourneyPill"
                        title="Click to isolate this visitor's step-by-step path"
                      >
                        <i className="bi bi-compass" />
                        <span>Trace this visitor&apos;s path</span>
                      </button>

                      {/* Referrer Attribution */}
                      {e.ref_tool_title ? (
                        <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="bi bi-box-arrow-in-right" />
                          <span>Referred from: {e.ref_tool_title}</span>
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>
                          <i className="bi bi-globe" style={{ marginRight: "4px" }} />
                          Direct / Search
                        </span>
                      )}

                      {/* Inspect payload */}
                      {e.meta && Object.keys(e.meta).length > 0 && (
                        <button
                          onClick={() => setSelectedMeta(e.meta)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#64748b",
                            cursor: "pointer",
                            fontSize: "0.74rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: 0,
                          }}
                          title="Inspect raw technical event details"
                        >
                          <i className="bi bi-code-square" />
                          <span>Technical Details</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Timestamp Right-aligned */}
                  <div
                    style={{
                      textAlign: "right",
                      flexShrink: 0,
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#334155" }}>
                      {formatRelativeTime(e.created_at)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                      {new Date(e.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                    {sessionId && (
                      <span
                        className="dtBadge neutral"
                        style={{ fontSize: "0.68rem", marginTop: "6px" }}
                      >
                        Step {displayEvents.length - idx}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── 7. TABLE VIEW (Traditional Spreadsheet Format) ── */}
      {viewMode === "table" && (
        <div className="adminCard" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.84rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#475569", width: "180px" }}>
                    Timestamp
                  </th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                    Action
                  </th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                    Tool
                  </th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                    Source / Referrer
                  </th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, color: "#475569" }}>
                    Visitor Identity
                  </th>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#475569", textAlign: "right" }}>
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      <i
                        className="bi bi-arrow-repeat spin"
                        style={{ fontSize: "1.5rem", display: "inline-block", marginBottom: "8px" }}
                      />
                      <div>Loading activity records...</div>
                    </td>
                  </tr>
                ) : displayEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      <i
                        className="bi bi-broadcast"
                        style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
                      />
                      No events recorded in this filter.
                    </td>
                  </tr>
                ) : (
                  displayEvents.map((e) => {
                    return (
                      <tr
                        key={e.id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s ease",
                        }}
                        className="tableRowHover"
                      >
                        {/* Timestamp */}
                        <td style={{ padding: "12px 18px", color: "#64748b", fontSize: "0.78rem" }}>
                          <div style={{ fontWeight: 600, color: "#334155" }}>
                            {formatRelativeTime(e.created_at)}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                            {new Date(e.created_at).toLocaleString()}
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td style={{ padding: "12px 14px" }}>
                          {e.event_type === "TOOL_RUN" && (
                            <span className="dtBadge active" style={{ fontSize: "0.72rem" }}>
                              <i className="bi bi-lightning-charge-fill" /> Tool Executed
                            </span>
                          )}
                          {e.event_type === "PAGE_VIEW" && (
                            <span className="dtBadge primary" style={{ fontSize: "0.72rem" }}>
                              <i className="bi bi-eye-fill" /> Page Opened
                            </span>
                          )}
                          {e.event_type === "RECOMMENDATION_CLICK" && (
                            <span className="dtBadge success" style={{ fontSize: "0.72rem" }}>
                              <i className="bi bi-arrow-repeat" /> Rec Clicked
                            </span>
                          )}
                        </td>

                        {/* Target Tool */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>
                            {e.tool_title || `Tool #${e.tool_id}`}
                          </div>
                          {e.tool_slug && (
                            <code style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {e.tool_slug}
                            </code>
                          )}
                        </td>

                        {/* Referring Tool */}
                        <td style={{ padding: "12px 14px", color: "#64748b" }}>
                          {e.ref_tool_title ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#059669",
                              }}
                            >
                              <i className="bi bi-box-arrow-in-right" />
                              <span>{e.ref_tool_title}</span>
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.76rem" }}>Direct / Search</span>
                          )}
                        </td>

                        {/* Visitor Session (Clickable to trace) */}
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => {
                              setSessionId(e.session_id);
                              setPage(1);
                            }}
                            className="visitorJourneyPill"
                            title="Trace this visitor's full journey"
                          >
                            <i className="bi bi-person-fill" />
                            <span>{getVisitorTag(e.session_id)}</span>
                          </button>
                        </td>

                        {/* Payload Inspection Trigger */}
                        <td style={{ padding: "12px 18px", textAlign: "right" }}>
                          <button
                            onClick={() => setSelectedMeta(e.meta || {})}
                            className="dtBtn ghost sm"
                            title="View event payload metadata"
                          >
                            <i className="bi bi-code-slash" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 8. Pagination Controls ── */}
      <div
        className="adminCard"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          marginTop: "16px",
          background: "#ffffff",
          fontSize: "0.82rem",
        }}
      >
        <div style={{ color: "#64748b" }}>
          Showing page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> (
          <strong>{meta.total}</strong> total visitor actions logged)
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="dtBtn secondary sm"
          >
            Previous
          </button>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="dtBtn secondary sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* ── 9. Technical Details Modal ── */}
      {selectedMeta !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setSelectedMeta(null)}
        >
          <div
            className="adminCard"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i
                  className="bi bi-info-circle-fill"
                  style={{ color: "var(--admin-accent)", fontSize: "1.2rem" }}
                />
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>
                  Event Technical Details
                </h4>
              </div>
              <button
                onClick={() => setSelectedMeta(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#64748b",
                }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <pre
              style={{
                background: "#0b1120",
                color: "#38bdf8",
                padding: "16px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                overflowX: "auto",
                maxHeight: "340px",
                margin: 0,
              }}
            >
              {JSON.stringify(selectedMeta, null, 2)}
            </pre>

            <div style={{ marginTop: "18px", textAlign: "right" }}>
              <button onClick={() => setSelectedMeta(null)} className="dtBtn secondary sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
