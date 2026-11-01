// src/components/keyword-research/SerpAnalysisSection.tsx
"use client";

import { useState } from "react";
import {
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Video,
  Star,
  HelpCircle,
  Layers,
} from "lucide-react";
import styles from "./SerpAnalysisSection.module.css";
import InfoTooltip from "./InfoTooltip";
import type { SerpAnalysisResult } from "@/types/keyword-research.types";

interface Props {
  serpData: SerpAnalysisResult;
  query: string;
}

export default function SerpAnalysisSection({ serpData, query }: Props) {
  const [viewMode, setViewMode] = useState<"domain" | "url">("url");
  const [activeRange, setActiveRange] = useState("1-10");

  const { total_results, serp_features, organic_results } = serpData;

  const renderFeatureIcon = (feat: string) => {
    switch (feat.toLowerCase()) {
      case "ai_overview":
        return <Sparkles size={12} color="#2563eb" />;
      case "sitelinks":
        return <LinkIcon size={12} color="#475569" />;
      case "video_carousel":
      case "video":
        return <Video size={12} color="#dc2626" />;
      case "star_ratings":
      case "reviews":
        return <Star size={12} color="#f59e0b" fill="#f59e0b" />;
      case "people_also_ask":
        return <HelpCircle size={12} color="#7c3aed" />;
      default:
        return <Layers size={12} color="#64748b" />;
    }
  };

  return (
    <div className={styles.container} id="serp-section">
      <div className={styles.topRow}>
        <div className={styles.headerLeft}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
            <span className={styles.title}>SERP Analysis</span>
            <InfoTooltip content="Google Page 1 live organic search results showing the top 10 ranking URLs, competing domains, and detected rich SERP features." />
          </div>
          <div className={styles.togglePills}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                viewMode === "domain" ? styles.toggleBtnActive : ""
              }`}
              onClick={() => setViewMode("domain")}
            >
              Domain
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                viewMode === "url" ? styles.toggleBtnActive : ""
              }`}
              onClick={() => setViewMode("url")}
            >
              URL
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <span className={styles.statLbl}>Indexed Results</span>
            <InfoTooltip content="Estimated total number of Google index results matching this search query." />
          </div>
          <span className={styles.statVal}>
            {(total_results / 1000).toFixed(0)}K
          </span>
        </div>

        <div className={styles.statItem}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <span className={styles.statLbl}>SERP Features Detected</span>
            <InfoTooltip content="Special search result enhancements active on this query (such as Google AI Overview, Sitelinks, Video Carousels, and Star Ratings)." />
          </div>
          <div className={styles.featuresList}>
            {serp_features.map((feat) => (
              <span key={feat} className={styles.featureTag}>
                {renderFeatureIcon(feat)}
                {feat.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Page range tabs */}
      <div className={styles.rangeTabs}>
        {["1-10", "11-20", "21-30", "31-40", "41-50"].map((range) => (
          <button
            key={range}
            type="button"
            className={`${styles.rangeBtn} ${
              activeRange === range ? styles.rangeBtnActive : ""
            }`}
            onClick={() => setActiveRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Special AI Overview Feature Block (Image 3) */}
      <div className={styles.specialFeatureBlock}>
        <Sparkles size={14} color="#2563eb" />
        <span>Google AI Overview (Summary synthesized with 5 authoritative sources)</span>
      </div>

      {/* Organic Rankings List */}
      <div className={styles.serpList}>
        {organic_results.map((res) => (
          <div key={res.position} className={styles.serpRow}>
            <div className={styles.posCol}>{res.position}</div>

            <div className={styles.serpDetails}>
              <div className={styles.urlHeader}>
                {viewMode === "domain" ? (
                  <span className={styles.domainName}>{res.domain}</span>
                ) : (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.extLink}
                  >
                    <span>{res.url}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {viewMode === "url" && (
                <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "0.95rem" }}>
                  {res.title}
                </div>
              )}

              {res.snippet && <div className={styles.snippet}>{res.snippet}</div>}

              {res.features && res.features.length > 0 && (
                <div className={styles.snippetFeatures}>
                  {res.features.map((f) => (
                    <span key={f} className={styles.snippetFeatureBadge}>
                      {renderFeatureIcon(f)}
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
