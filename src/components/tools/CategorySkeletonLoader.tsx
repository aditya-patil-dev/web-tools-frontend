"use client";

import React from "react";

export function ToolCardSkeleton() {
  return (
    <div className="tool-card tool-card--skeleton">
      <div className="tool-card-link" style={{ pointerEvents: "none", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Badge shimmer */}
        <div className="tool-skeleton-badge tool-skeleton-shimmer" />

        {/* Icon shimmer */}
        <div className="tool-skeleton-icon tool-skeleton-shimmer" />

        {/* Content shimmer */}
        <div className="tool-content" style={{ width: "100%", marginBottom: 0 }}>
          <div className="tool-skeleton-title tool-skeleton-shimmer" />
          <div className="tool-skeleton-desc tool-skeleton-shimmer" style={{ width: "100%" }} />
          <div className="tool-skeleton-desc tool-skeleton-shimmer" style={{ width: "75%", marginBottom: "1.5rem" }} />
        </div>

        {/* Footer shimmer */}
        <div className="tool-card-footer" style={{ marginTop: "auto", width: "100%" }}>
          <div className="tool-skeleton-tag tool-skeleton-shimmer" />
          <div className="tool-skeleton-circle tool-skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

interface CategorySkeletonLoaderProps {
  count?: number;
  showSearchAndTabs?: boolean;
}

export default function CategorySkeletonLoader({
  count = 6,
  showSearchAndTabs = false,
}: CategorySkeletonLoaderProps) {
  return (
    <div className="tools-page-wrapper">
      <div className="tools-page-container">
        {/* Header Skeleton */}
        <div className="tools-page-header" style={{ marginBottom: 36 }}>
          <div
            className="tool-page-skeleton-shimmer"
            style={{
              width: "min(360px, 80%)",
              height: 44,
              margin: "0 auto 16px",
              borderRadius: 12,
            }}
          />
          <div
            className="tool-page-skeleton-shimmer"
            style={{
              width: "min(520px, 90%)",
              height: 18,
              margin: "0 auto",
              borderRadius: 6,
            }}
          />
        </div>

        {/* Optional Search & Filter Tabs for All Tools page */}
        {showSearchAndTabs && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 36 }}>
            {/* Search bar placeholder */}
            <div
              className="tool-page-skeleton-shimmer"
              style={{
                width: "min(480px, 100%)",
                height: 48,
                borderRadius: 999,
              }}
            />
            {/* Filter pills placeholder */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {[80, 100, 90, 85, 95].map((w, idx) => (
                <div
                  key={idx}
                  className="tool-page-skeleton-shimmer"
                  style={{
                    width: w,
                    height: 36,
                    borderRadius: 999,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar Skeleton */}
        <div className="stats-bar" style={{ marginBottom: 44 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="stat-item" style={{ pointerEvents: "none" }}>
              <div
                className="tool-page-skeleton-shimmer"
                style={{ width: 68, height: 32, borderRadius: 8, marginBottom: 6 }}
              />
              <div
                className="tool-page-skeleton-shimmer"
                style={{ width: 92, height: 14, borderRadius: 4 }}
              />
            </div>
          ))}
        </div>

        {/* Tools Page Grid Skeleton */}
        <div className="tools-page-grid">
          {[...Array(count)].map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
