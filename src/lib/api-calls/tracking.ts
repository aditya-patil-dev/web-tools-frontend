// Central tracking utility for tool analytics.
// Currently handles: PAGE_VIEW, RECOMMENDATION_CLICK
// TOOL_RUN can be added later per tool component.

import { api } from "@/lib/api/api";
import { getOrCreateSessionId } from "@/lib/session";

// ── Types ─────────────────────────────────────────────────────────────────────
export type EventType = "PAGE_VIEW" | "TOOL_RUN" | "RECOMMENDATION_CLICK";
export type WidgetType = "related" | "popular" | "alsoUsed";

interface TrackEventPayload {
    tool_id: string;
    event_type: EventType;
    session_id: string;
    ref_tool_id?: string;
    meta?: Record<string, unknown>;
}

// ── Core fire-and-forget tracker ──────────────────────────────────────────────
export async function trackEvent(payload: TrackEventPayload): Promise<void> {
    try {
        await api.post("/tools/events/track", payload);
    } catch {
        // Silent fail — never break the UI for analytics
    }
}

// ── Dedupe guard for PAGE_VIEW ─────────────────────────────────────────────────
// Prevents double-firing in React 18 Strict Mode and on accidental re-renders.
// Uses sessionStorage so it resets when the browser tab closes.
const PAGE_VIEW_TTL_MS = 30_000; // 30 seconds

export function shouldTrackPageView(toolId: string): boolean {
    if (typeof window === "undefined") return false;
    const key = `pv:${toolId}:${location.pathname}`;
    const now = Date.now();
    const raw = sessionStorage.getItem(key);
    if (raw) {
        const last = Number(raw);
        if (!Number.isNaN(last) && now - last < PAGE_VIEW_TTL_MS) return false;
    }
    sessionStorage.setItem(key, String(now));
    return true;
}

// ── Convenience: track PAGE_VIEW ──────────────────────────────────────────────
export function trackPageView(toolId: string): void {
    const sessionId = getOrCreateSessionId();
    if (!sessionId || !toolId) return;
    if (!shouldTrackPageView(toolId)) return;

    trackEvent({
        tool_id: toolId,
        event_type: "PAGE_VIEW",
        session_id: sessionId,
        meta: {
            path: location.pathname,
            referrer: document.referrer || null,
        },
    });
}

// ── Convenience: track RECOMMENDATION_CLICK ───────────────────────────────────
export function trackRecommendationClick(id: string, currentToolId: string | number, widget: string, href: string, {
    clickedToolId, currentToolId, widget, toPath,
}: {
    clickedToolId: string;
    currentToolId: string;
    widget: WidgetType;
    toPath: string;
}): void {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    trackEvent({
        tool_id: clickedToolId,
        event_type: "RECOMMENDATION_CLICK",
        session_id: sessionId,
        ref_tool_id: currentToolId,
        meta: {
            widget,
            from_path: location.pathname,
            to_path: toPath,
        },
    });
}