"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe, Languages, Zap, Download, ArrowUpDown,
  ArrowUp, ArrowDown, BarChart2, Target, DollarSign, TrendingUp
} from "lucide-react";
import styles from "./ToolSection.module.css";
import type { KeywordResult, FilterType, SortColumn } from "@/app/(public)/keyword-research/types";
import {
  getDifficultyLevel, computeMetrics, formatVolume,
  exportToCSV, getRelatedSuggestions,
} from "@/app/(public)/keyword-research/utils";

const INTENT_ICONS: Record<string, string> = {
  informational: "📖", commercial: "🛒", transactional: "💳", navigational: "🧭",
};
const LOADING_STEPS = [
  "Search volume", "Keyword difficulty", "CPC data",
  "Search intent", "Related terms", "Trend data",
];
const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "All Keywords",        value: "all"            },
  { label: "📖 Informational",    value: "informational"  },
  { label: "🛒 Commercial",       value: "commercial"     },
  { label: "💳 Transactional",    value: "transactional"  },
  { label: "🧭 Navigational",     value: "navigational"   },
  { label: "🟢 Easy",             value: "easy"           },
  { label: "🟡 Medium",           value: "medium"         },
  { label: "🔴 Hard",             value: "hard"           },
];
const COUNTRIES = [
  { value: "global", label: "🌍 Global" },
  { value: "us",     label: "🇺🇸 United States" },
  { value: "uk",     label: "🇬🇧 United Kingdom" },
  { value: "in",     label: "🇮🇳 India" },
  { value: "ca",     label: "🇨🇦 Canada" },
  { value: "au",     label: "🇦🇺 Australia" },
];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French"  },
  { value: "de", label: "German"  },
];

interface Props {
  query: string;
  isLoading: boolean;
  hasResults: boolean;
  allKeywords: KeywordResult[];
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  sortCol: SortColumn;
  sortAsc: boolean;
  onSort: (col: SortColumn) => void;
  onAnalyze: (kw: string) => void;
}

export default function ToolSection({
  query, isLoading, hasResults, allKeywords,
  activeFilter, onFilterChange, sortCol, sortAsc, onSort, onAnalyze,
}: Props) {
  const [inputVal, setInputVal] = useState(query);
  const [loadStep, setLoadStep] = useState(0);

  /* Sync input when query changes from hero */
  useMemo(() => { if (query) setInputVal(query); }, [query]);

  /* Simulate loading step progression */
  useMemo(() => {
    if (!isLoading) { setLoadStep(0); return; }
    let i = 0;
    const timer = setInterval(() => {
      i++; setLoadStep(i);
      if (i >= LOADING_STEPS.length) clearInterval(timer);
    }, 240);
    return () => clearInterval(timer);
  }, [isLoading]);

  /* Filtered + sorted keywords */
  const filtered = useMemo(() => {
    let kws = [...allKeywords];
    if (activeFilter !== "all") {
      const diffLevels = ["easy", "medium", "hard"];
      if (diffLevels.includes(activeFilter)) {
        kws = kws.filter((k) => getDifficultyLevel(k.difficulty) === activeFilter);
      } else {
        kws = kws.filter((k) => k.intent === activeFilter);
      }
    }
    kws.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return kws;
  }, [allKeywords, activeFilter, sortCol, sortAsc]);

  const metrics = useMemo(() => computeMetrics(filtered), [filtered]);
  const related = useMemo(() => (query ? getRelatedSuggestions(query) : []), [query]);
  const maxVol = useMemo(() => (filtered.length ? Math.max(...filtered.map((k) => k.volume)) : 1), [filtered]);

  const handleAnalyze = useCallback(() => {
    if (inputVal.trim()) onAnalyze(inputVal.trim());
  }, [inputVal, onAnalyze]);

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortCol !== col) return <ArrowUpDown size={13} className={styles.sortIconNeutral} />;
    return sortAsc ? <ArrowUp size={13} className={styles.sortIconActive} /> : <ArrowDown size={13} className={styles.sortIconActive} />;
  };

  return (
    <section className={styles.section} id="tool">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <span className={styles.label}>Live Tool</span>
          <h2 className={styles.title}>Start Your Research</h2>
          <p className={styles.desc}>Enter any keyword below and get instant insights.</p>
        </motion.div>

        <motion.div
          className={styles.toolBox}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Top bar */}
          <div className={styles.topBar}>
            <div className={styles.topBarDots}>
              <span /><span /><span />
            </div>
            <span className={styles.topBarTitle}>🔍 Keyword Research Tool</span>
          </div>

          <div className={styles.body}>
            {/* Search Row */}
            <div className={styles.searchRow}>
              <div className={styles.inputWrap}>
                <Search size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="e.g. best running shoes, SEO tools, coffee maker…"
                  className={styles.input}
                  autoComplete="off"
                />
              </div>
              <div className={styles.selects}>
                <div className={styles.selectWrap}>
                  <Globe size={14} className={styles.selectIcon} />
                  <select className={styles.select}>
                    {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className={styles.selectWrap}>
                  <Languages size={14} className={styles.selectIcon} />
                  <select className={styles.select}>
                    {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <button
                className={styles.analyzeBtn}
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                <Zap size={15} />
                {isLoading ? "Analyzing…" : "Analyze"}
              </button>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
              <span className={styles.filterLabel}>Filter:</span>
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  className={`${styles.filterChip} ${activeFilter === f.value ? styles.filterActive : ""}`}
                  onClick={() => onFilterChange(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Results Area */}
            <div className={styles.resultsArea}>
              <AnimatePresence mode="wait">
                {/* Empty state */}
                {!isLoading && !hasResults && (
                  <motion.div
                    key="empty"
                    className={styles.emptyState}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.emptyIcon}>🔍</div>
                    <div className={styles.emptyTitle}>Ready to discover keywords</div>
                    <p className={styles.emptyText}>Enter a seed keyword above and hit Analyze to see search volume, difficulty, CPC, and more.</p>
                  </motion.div>
                )}

                {/* Loading state */}
                {isLoading && (
                  <motion.div
                    key="loading"
                    className={styles.loadingState}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.spinner} />
                    <div className={styles.loadingTitle}>Analyzing keywords…</div>
                    <div className={styles.loadingChips}>
                      {LOADING_STEPS.map((step, i) => (
                        <motion.span
                          key={step}
                          className={`${styles.loadingChip} ${i < loadStep ? styles.loadingChipDone : ""}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: i < loadStep ? 1 : 0.3, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          {i < loadStep ? "✓" : "○"} {step}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Results */}
                {!isLoading && hasResults && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Metrics row */}
                    <div className={styles.metricsRow}>
                      {[
                        { icon: <BarChart2 size={20} />, val: formatVolume(metrics.totalVolume), lbl: "Total Monthly Searches" },
                        { icon: <Target      size={20} />, val: `${metrics.avgDifficulty}/100`,   lbl: "Avg. Difficulty"        },
                        { icon: <DollarSign  size={20} />, val: `$${metrics.avgCpc}`,             lbl: "Avg. CPC"              },
                        { icon: <TrendingUp  size={20} />, val: `${metrics.easyCount}`,           lbl: "Easy Opportunities"    },
                      ].map((m) => (
                        <div className={styles.metricCard} key={m.lbl}>
                          <div className={styles.metricIcon}>{m.icon}</div>
                          <div>
                            <div className={styles.metricVal}>{m.val}</div>
                            <div className={styles.metricLbl}>{m.lbl}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary + export */}
                    <div className={styles.tableSummary}>
                      <div className={styles.resultCount}>
                        Showing <strong>{filtered.length}</strong> keywords for "<strong>{query}</strong>"
                      </div>
                      <button className={styles.exportBtn} onClick={() => exportToCSV(filtered, query)}>
                        <Download size={14} /> Export CSV
                      </button>
                    </div>

                    {/* Table */}
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th onClick={() => onSort("keyword")}>Keyword <SortIcon col="keyword" /></th>
                            <th onClick={() => onSort("volume")}>Search Volume <SortIcon col="volume" /></th>
                            <th onClick={() => onSort("difficulty")}>Difficulty <SortIcon col="difficulty" /></th>
                            <th onClick={() => onSort("cpc")}>CPC (USD) <SortIcon col="cpc" /></th>
                            <th>Intent</th>
                            <th>12mo Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((kw, i) => {
                            const dl = getDifficultyLevel(kw.difficulty);
                            const pct = Math.round((kw.volume / maxVol) * 100);
                            return (
                              <motion.tr
                                key={kw.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.025, duration: 0.3 }}
                              >
                                <td className={styles.kwCell}>
                                  <span className={styles.kwIcon}>{INTENT_ICONS[kw.intent]}</span>
                                  {kw.keyword}
                                </td>
                                <td>
                                  <div className={styles.volWrap}>
                                    <div className={styles.volBarBg}>
                                      <motion.div
                                        className={styles.volBar}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.02 }}
                                      />
                                    </div>
                                    <span className={styles.volText}>{formatVolume(kw.volume)}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`${styles.diffBadge} ${styles[`diff_${dl}`]}`}>
                                    {dl === "easy" ? "🟢" : dl === "medium" ? "🟡" : "🔴"} {kw.difficulty}
                                  </span>
                                </td>
                                <td className={styles.cpcCell}>${kw.cpc.toFixed(2)}</td>
                                <td>
                                  <span className={styles.intentBadge}>
                                    {INTENT_ICONS[kw.intent]} {kw.intent.charAt(0).toUpperCase() + kw.intent.slice(1)}
                                  </span>
                                </td>
                                <td>
                                  <div className={styles.sparkline}>
                                    {kw.trend.map((v, ti) => (
                                      <div
                                        key={ti}
                                        className={`${styles.sparkBar} ${v > 0.5 ? styles.sparkBarUp : ""}`}
                                        style={{ height: `${Math.max(4, Math.round(v * 24))}px` }}
                                      />
                                    ))}
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Related tags */}
                    {related.length > 0 && (
                      <div className={styles.related}>
                        <div className={styles.relatedTitle}>💡 Related Searches</div>
                        <div className={styles.relatedTags}>
                          {related.map((r) => (
                            <button key={r} className={styles.relatedTag} onClick={() => onAnalyze(r)}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
