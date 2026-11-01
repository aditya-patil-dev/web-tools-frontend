// src/components/keyword-research/KeywordOverviewCards.tsx
"use client";

import { useMemo } from "react";
import {
  BookOpen,
  ShoppingBag,
  CreditCard,
  Compass,
  Sparkles,
  DollarSign,
  TrendingUp,
  Globe,
  Gauge,
  Target,
  Lightbulb,
} from "lucide-react";
import styles from "./KeywordOverviewCards.module.css";
import InfoTooltip from "./InfoTooltip";
import type { KeywordOverview } from "@/types/keyword-research.types";

interface Props {
  overview: KeywordOverview;
  region: string;
}

export default function KeywordOverviewCards({ overview, region }: Props) {
  const {
    volume,
    keyword_difficulty,
    difficulty_level,
    difficulty_description,
    intent,
    cpc,
    competitive_density,
    pla_status,
    ads_status,
    global_volume,
    trend,
  } = overview;

  // Circular gauge color based on KD score
  const kdColor = useMemo(() => {
    if (keyword_difficulty < 30) return "#10b981"; // green
    if (keyword_difficulty < 50) return "#f59e0b"; // yellow
    if (keyword_difficulty < 70) return "#ea580c"; // orange
    return "#ef4444"; // red
  }, [keyword_difficulty]);

  // Donut SVG constants
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (keyword_difficulty / 100) * circumference;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const renderIntentIcon = (int: string) => {
    switch (int) {
      case "informational":
        return <BookOpen size={15} />;
      case "commercial":
        return <ShoppingBag size={15} />;
      case "transactional":
        return <CreditCard size={15} />;
      case "navigational":
        return <Compass size={15} />;
      default:
        return <Sparkles size={15} />;
    }
  };

  // Human-friendly Intent Explanation & Strategic Recommendation
  const getIntentDetails = (int: string) => {
    switch (int) {
      case "informational":
        return {
          title: "Informational",
          badgeClass: styles.intent_informational,
          meaning: "The searcher wants to learn, solve a problem, or find an answer to a question.",
          format: "Blog articles, how-to tutorials, and FAQ guides",
        };
      case "commercial":
        return {
          title: "Commercial",
          badgeClass: styles.intent_commercial,
          meaning: "The searcher is comparing products, investigating brands, or researching reviews before buying.",
          format: "Comparison tables, 'Best of' listicles, and review pages",
        };
      case "transactional":
        return {
          title: "Transactional",
          badgeClass: styles.intent_transactional,
          meaning: "The searcher has high purchase intent and wants to buy, download, or subscribe now.",
          format: "Product landing pages, checkout flows, and pricing tables",
        };
      case "navigational":
        return {
          title: "Navigational",
          badgeClass: styles.intent_navigational,
          meaning: "The searcher is trying to locate a specific website, brand portal, or login page.",
          format: "Homepage, brand authority links, and direct portal paths",
        };
      default:
        return {
          title: "General",
          badgeClass: styles.intent_informational,
          meaning: "Mixed or general search intent across multiple search queries.",
          format: "Comprehensive pillar page covering multiple angles",
        };
    }
  };

  const intentDetails = getIntentDetails(intent);

  return (
    <div className={styles.overviewGrid}>
      {/* ── CARD 1: Volume & Keyword Difficulty ── */}
      <div className={styles.card}>
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.headerTitleWrap}>
              <span>Search Volume</span>
              <InfoTooltip content="The average number of monthly searches on Google for this exact keyword in the selected country." />
            </span>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#94a3b8" }}>
              {region.toUpperCase()}
            </span>
          </div>
          <div className={styles.bigValue}>{formatNumber(volume)}</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.kdSection}>
          <div className={styles.kdHeaderRow}>
            <span className={styles.headerTitleWrap}>
              <span className={styles.sectionHeader} style={{ marginBottom: 0 }}>
                Keyword Difficulty
              </span>
              <InfoTooltip content="Keyword Difficulty (0–100%) estimates how hard it will be to rank in Google's top 10 organic search results. Higher KD requires stronger backlinks and domain authority." />
            </span>
          </div>

          <div className={styles.kdRow}>
            {/* SVG Circular Donut Ring */}
            <div className={styles.kdGaugeWrap}>
              <svg className={styles.kdSvg} width="56" height="56">
                <circle
                  className={styles.kdCircleBg}
                  cx="28"
                  cy="28"
                  r={radius}
                />
                <circle
                  className={styles.kdCircleFill}
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke={kdColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className={styles.kdScoreText}>{keyword_difficulty}%</span>
            </div>

            <div className={styles.kdInfo}>
              <span className={styles.kdPercentage} style={{ color: kdColor }}>
                {difficulty_level.charAt(0).toUpperCase() + difficulty_level.slice(1)}
              </span>
              <span className={styles.kdDesc}>{difficulty_description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Global Volume & Country Breakdown ── */}
      <div className={styles.card}>
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.headerTitleWrap}>
              <span>Global Volume</span>
              <InfoTooltip content="Total estimated monthly searches across all countries worldwide, with a breakdown of the top geographic markets." />
            </span>
            <Globe size={14} color="#64748b" />
          </div>
          <div className={styles.bigValue}>
            {formatNumber(global_volume.total)}
          </div>
        </div>

        <div className={styles.countryList}>
          {global_volume.breakdown.slice(0, 5).map((item) => (
            <div key={item.code} className={styles.countryRow}>
              <span className={styles.countryCode}>{item.code}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className={styles.countryVol}>
                {formatNumber(item.volume)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 3: Stacked Intent (Top) & 12-Month Trend (Bottom) ── */}
      <div className={styles.stackedCardsCol}>
        {/* SUB-CARD 3A: Clear, Explained Search Intent */}
        <div className={styles.subCard}>
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.headerTitleWrap}>
                <span>Search Intent</span>
                <InfoTooltip content="Search intent is the primary goal of the searcher. Google ranks content that satisfies this intent: Informational (learning), Commercial (comparing options), Transactional (buying), or Navigational (locating a site)." />
              </span>
              <Target size={14} color="#64748b" />
            </div>

            <div className={styles.intentCardBody}>
              <div className={`${styles.intentBadge} ${intentDetails.badgeClass}`}>
                {renderIntentIcon(intent)}
                <span>{intentDetails.title}</span>
              </div>

              <div className={styles.intentExplanation}>
                {intentDetails.meaning}
              </div>

              <div className={styles.intentRecommendation}>
                <Lightbulb size={13} color="#ff6b35" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Best for:</strong> {intentDetails.format}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SUB-CARD 3B: 12-Month Search Trend */}
        <div className={styles.subCard}>
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.headerTitleWrap}>
                <span>12-Month Search Trend</span>
                <InfoTooltip content="Monthly search interest fluctuations over the last 12 months. Useful for identifying seasonal demand or steady evergreen interest." />
              </span>
              <TrendingUp size={14} color="#64748b" />
            </div>

            <div className={styles.trendWrap}>
              <div className={styles.trendBars}>
                {trend.map((val, idx) => (
                  <div
                    key={idx}
                    className={styles.trendBar}
                    style={{ height: `${Math.max(10, Math.round(val * 46))}px` }}
                    title={`Month ${idx + 1}: ${Math.round(val * 100)}% of peak`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4: CPC & Competitive Density ── */}
      <div className={styles.card}>
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.headerTitleWrap}>
              <span>Cost Per Click (CPC)</span>
              <InfoTooltip content="Estimated average price advertisers pay Google Ads whenever a user clicks an ad for this keyword." />
            </span>
            <DollarSign size={14} color="#64748b" />
          </div>
          <div className={styles.bigValue}>${cpc.toFixed(2)}</div>
        </div>

        <div className={styles.divider} />

        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.headerTitleWrap}>
              <span>Competitive Density</span>
              <InfoTooltip content="A score from 0.00 to 1.00 indicating the level of advertiser competition in Google Ads paid search (1.00 = high competition)." />
            </span>
            <Gauge size={14} color="#64748b" />
          </div>
          <div className={styles.bigValue}>{competitive_density.toFixed(2)}</div>

          <div className={styles.extraMetricsRow}>
            <div className={styles.extraItem}>
              <span className={styles.extraLabel}>
                PLA (Shopping)
                <InfoTooltip content="Product Listing Ads: indicates whether sponsored Google Shopping product cards appear in the search results." />
              </span>
              <span className={styles.extraVal}>{pla_status}</span>
            </div>
            <div className={styles.extraItem}>
              <span className={styles.extraLabel}>
                Ads (Search)
                <InfoTooltip content="Text Search Ads: indicates whether paid Google sponsored ads are competing on this query." />
              </span>
              <span className={styles.extraVal}>{ads_status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
