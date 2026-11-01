// src/components/keyword-research/ToolSection.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  Languages,
  Download,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  Compass,
  BookOpen,
  Link2,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Sliders,
  FolderTree,
  Hash,
  CheckCircle2,
  Circle,
} from "lucide-react";
import styles from "./ToolSection.module.css";
import KeywordSkeleton from "./KeywordSkeleton";
import KeywordOverviewCards from "./KeywordOverviewCards";
import KeywordIdeasSection from "./KeywordIdeasSection";
import SerpAnalysisSection from "./SerpAnalysisSection";
import InfoTooltip from "./InfoTooltip";
import CustomDropdown, { DropdownOption } from "./CustomDropdown";
import CountryFlag from "./CountryFlag";
import type {
  KeywordItem,
  ResearchApiResponse,
  FilterType,
  SortColumn,
} from "@/types/keyword-research.types";

const LOADING_STEPS = [
  "Connecting to Google Suggest Engine",
  "Expanding Question & Comparison Queries",
  "Generating Preposition Variations",
  "Classifying Intent & Topic Clusters",
  "Deduplicating & Sorting Keyword List",
];

const FILTER_TABS: { label: string; value: FilterType; icon: React.ReactNode }[] = [
  { label: "All Keywords", value: "all", icon: <Layers size={14} /> },
  { label: "Questions", value: "questions", icon: <HelpCircle size={14} /> },
  { label: "Prepositions", value: "prepositions", icon: <Link2 size={14} /> },
  { label: "Informational", value: "informational", icon: <BookOpen size={14} /> },
  { label: "Commercial", value: "commercial", icon: <ShoppingBag size={14} /> },
  { label: "Transactional", value: "transactional", icon: <CreditCard size={14} /> },
  { label: "Navigational", value: "navigational", icon: <Compass size={14} /> },
];

const COUNTRY_OPTIONS: DropdownOption[] = [
  {
    value: "us",
    label: "United States",
    badge: "US",
    icon: <CountryFlag code="us" width={18} height={13} />,
  },
  {
    value: "in",
    label: "India",
    badge: "IN",
    icon: <CountryFlag code="in" width={18} height={13} />,
  },
  {
    value: "gb",
    label: "United Kingdom",
    badge: "UK",
    icon: <CountryFlag code="gb" width={18} height={13} />,
  },
  {
    value: "ca",
    label: "Canada",
    badge: "CA",
    icon: <CountryFlag code="ca" width={18} height={13} />,
  },
  {
    value: "au",
    label: "Australia",
    badge: "AU",
    icon: <CountryFlag code="au" width={18} height={13} />,
  },
  {
    value: "de",
    label: "Germany",
    badge: "DE",
    icon: <CountryFlag code="de" width={18} height={13} />,
  },
  {
    value: "fr",
    label: "France",
    badge: "FR",
    icon: <CountryFlag code="fr" width={18} height={13} />,
  },
  {
    value: "jp",
    label: "Japan",
    badge: "JP",
    icon: <CountryFlag code="jp" width={18} height={13} />,
  },
  {
    value: "br",
    label: "Brazil",
    badge: "BR",
    icon: <CountryFlag code="br" width={18} height={13} />,
  },
  {
    value: "es",
    label: "Spain",
    badge: "ES",
    icon: <CountryFlag code="es" width={18} height={13} />,
  },
  {
    value: "it",
    label: "Italy",
    badge: "IT",
    icon: <CountryFlag code="it" width={18} height={13} />,
  },
];

const LANGUAGE_OPTIONS: DropdownOption[] = [
  {
    value: "en",
    label: "English",
    badge: "EN",
    icon: <Languages size={15} color="#2563eb" />,
  },
  {
    value: "hi",
    label: "Hindi",
    subLabel: "हिन्दी",
    badge: "HI",
    icon: <Languages size={15} color="#ea580c" />,
  },
  {
    value: "es",
    label: "Spanish",
    subLabel: "Español",
    badge: "ES",
    icon: <Languages size={15} color="#d97706" />,
  },
  {
    value: "fr",
    label: "French",
    subLabel: "Français",
    badge: "FR",
    icon: <Languages size={15} color="#2563eb" />,
  },
  {
    value: "de",
    label: "German",
    subLabel: "Deutsch",
    badge: "DE",
    icon: <Languages size={15} color="#475569" />,
  },
  {
    value: "ja",
    label: "Japanese",
    subLabel: "日本語",
    badge: "JA",
    icon: <Languages size={15} color="#dc2626" />,
  },
];

interface Props {
  query: string;
  isLoading: boolean;
  hasResults: boolean;
  apiResult: ResearchApiResponse | null;
  onAnalyze: (
    kw: string,
    options?: {
      region?: string;
      language?: string;
      includeAlphabet?: boolean;
    }
  ) => void;
}

export default function ToolSection({
  query,
  isLoading,
  hasResults,
  apiResult,
  onAnalyze,
}: Props) {
  const [inputVal, setInputVal] = useState(query);
  const [region, setRegion] = useState("us");
  const [language, setLanguage] = useState("en");
  const [includeAlphabet, setIncludeAlphabet] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchWithin, setSearchWithin] = useState("");
  const [sortCol, setSortCol] = useState<SortColumn>("keyword");
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [loadStep, setLoadStep] = useState(0);

  // View Switcher Tab
  type ViewTab = "overview" | "keywords" | "ideas" | "serp";
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>("overview");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Handlers for instant interaction from KeywordIdeas cards
  const handleViewAllVariations = useCallback(() => {
    setActiveFilter("all");
    setSearchWithin("");
    setCurrentPage(1);
    const tableEl = document.getElementById("keywords-table-section");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleViewAllQuestions = useCallback(() => {
    setActiveFilter("questions");
    setSearchWithin("");
    setCurrentPage(1);
    const tableEl = document.getElementById("keywords-table-section");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleViewAllClusters = useCallback(() => {
    setActiveViewTab("ideas");
    const ideasEl = document.getElementById("ideas-section");
    if (ideasEl) {
      ideasEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleFilterKeyword = useCallback((kw: string) => {
    setSearchWithin(kw);
    setActiveFilter("all");
    setCurrentPage(1);
    const tableEl = document.getElementById("keywords-table-section");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Sync input value if passed from hero
  useEffect(() => {
    if (query) setInputVal(query);
  }, [query]);

  // Reset pagination when query or activeFilter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchWithin, query]);

  // Simulate loading step chips progression
  useEffect(() => {
    if (!isLoading) {
      setLoadStep(0);
      return;
    }
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setLoadStep(i);
      if (i >= LOADING_STEPS.length) clearInterval(timer);
    }, 280);
    return () => clearInterval(timer);
  }, [isLoading]);

  const allKeywords = useMemo(
    () => apiResult?.keywords || [],
    [apiResult]
  );

  // Filtered & Sorted Keywords
  const filtered = useMemo(() => {
    let list = [...allKeywords];

    // Filter by tab
    if (activeFilter !== "all") {
      if (activeFilter === "questions") {
        list = list.filter(
          (k) => k.source === "question" || k.group === "questions"
        );
      } else if (activeFilter === "prepositions") {
        list = list.filter((k) => k.source === "preposition");
      } else {
        list = list.filter((k) => k.intent === activeFilter);
      }
    }

    // Filter by search within results
    if (searchWithin.trim()) {
      const q = searchWithin.toLowerCase().trim();
      list = list.filter(
        (k) =>
          k.keyword.toLowerCase().includes(q) ||
          k.group.toLowerCase().includes(q)
      );
    }

    // Sort list
    list.sort((a, b) => {
      let av: any = a[sortCol];
      let bv: any = b[sortCol];
      if (av === null || av === undefined) av = "";
      if (bv === null || bv === undefined) bv = "";

      if (typeof av === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [allKeywords, activeFilter, searchWithin, sortCol, sortAsc]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedKeywords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = allKeywords.length;
    const questions = allKeywords.filter(
      (k) => k.source === "question" || k.group === "questions"
    ).length;
    const commercial = allKeywords.filter(
      (k) => k.intent === "commercial" || k.intent === "transactional"
    ).length;
    const avgWords = total
      ? (
          allKeywords.reduce((acc, k) => acc + k.word_count, 0) / total
        ).toFixed(1)
      : "0";

    const topGroup = apiResult?.grouped
      ? Object.entries(apiResult.grouped).sort(
          (a, b) => b[1].length - a[1].length
        )[0]?.[0] || "General"
      : "General";

    return { total, questions, commercial, avgWords, topGroup };
  }, [allKeywords, apiResult]);

  const handleSort = useCallback(
    (col: SortColumn) => {
      if (sortCol === col) {
        setSortAsc((prev) => !prev);
      } else {
        setSortCol(col);
        setSortAsc(col === "keyword");
      }
    },
    [sortCol]
  );

  const handleSubmit = useCallback(() => {
    if (inputVal.trim()) {
      onAnalyze(inputVal.trim(), {
        region,
        language,
        includeAlphabet,
      });
    }
  }, [inputVal, region, language, includeAlphabet, onAnalyze]);

  const handleCopySingle = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 1500);
  };

  const handleCopyAll = () => {
    const text = filtered.map((k) => k.keyword).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportCSV = () => {
    if (apiResult?.csv && activeFilter === "all" && !searchWithin) {
      const blob = new Blob([apiResult.csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `keywords-${query.replace(/\s+/g, "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Filter-aware CSV export
    const headers = [
      "keyword",
      "intent",
      "topic_cluster",
      "word_count",
      "char_length",
      "source",
    ];
    const rows = filtered.map((k) =>
      [
        `"${k.keyword.replace(/"/g, '""')}"`,
        k.intent,
        k.group,
        k.word_count,
        k.char_length,
        k.source,
      ].join(",")
    );
    const content = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `keywords-${query.replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderIntentIcon = (intent: string) => {
    switch (intent) {
      case "informational":
        return <BookOpen size={12} />;
      case "commercial":
        return <ShoppingBag size={12} />;
      case "transactional":
        return <CreditCard size={12} />;
      case "navigational":
        return <Compass size={12} />;
      default:
        return <Sparkles size={12} />;
    }
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortCol !== col) return <ArrowUpDown size={12} color="#94a3b8" />;
    return sortAsc ? (
      <ArrowUp size={12} color="#ff6b35" />
    ) : (
      <ArrowDown size={12} color="#ff6b35" />
    );
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
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
          <span className={styles.label}>
            <Sliders size={13} />
            Interactive Workspace
          </span>
          <h2 className={styles.title}>Keyword Suggestion & Intent Engine</h2>
          <p className={styles.desc}>
            Query real-time search trends, question variants, and buyer intent.
          </p>
        </motion.div>

        <motion.div
          className={styles.toolBox}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Top header bar */}
          <div className={styles.topBar}>
            <div className={styles.topBarDots}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.topBarTitle}>
              <Search size={14} />
              Keyword Research & Topic Clustering Engine
            </span>
          </div>

          <div className={styles.body}>
            {/* ── Search Controls ── */}
            <div className={styles.searchControls}>
              <div className={styles.searchMainRow}>
                {/* Search input */}
                <div className={styles.inputWrap}>
                  <Search className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Enter seed keyword (e.g., vpn, email marketing)..."
                    className={styles.input}
                    disabled={isLoading}
                  />
                </div>

                {/* Country & Language Custom Dropdowns */}
                <div className={styles.selectsGroup}>
                  <CustomDropdown
                    value={region}
                    onChange={setRegion}
                    options={COUNTRY_OPTIONS}
                    disabled={isLoading}
                    headerTitle="Target Country / Region"
                    defaultIcon={<Globe size={15} color="#64748b" />}
                  />

                  <CustomDropdown
                    value={language}
                    onChange={setLanguage}
                    options={LANGUAGE_OPTIONS}
                    disabled={isLoading}
                    headerTitle="Target Language"
                    defaultIcon={<Languages size={15} color="#64748b" />}
                  />

                  {/* Analyze Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !inputVal.trim()}
                    className={styles.analyzeBtn}
                  >
                    <Sparkles size={16} />
                    {isLoading ? "Searching..." : "Research"}
                  </button>
                </div>
              </div>

              {/* Advanced Options Bar */}
              <div className={styles.optionsBar}>
                <label
                  className={styles.toggleSwitch}
                  onClick={() => !isLoading && setIncludeAlphabet(!includeAlphabet)}
                >
                  <div
                    className={`${styles.toggleTrack} ${
                      includeAlphabet ? styles.toggleTrackActive : ""
                    }`}
                  >
                    <div
                      className={`${styles.toggleThumb} ${
                        includeAlphabet ? styles.toggleThumbActive : ""
                      }`}
                    />
                  </div>
                  <span className={styles.toggleText}>
                    <Layers size={14} />
                    Alphabet Soup Expansion (A–Z search depth)
                  </span>
                </label>

                <span className={styles.optionsHint}>
                  Generates up to 300+ long-tail permutations across the alphabet.
                </span>
              </div>
            </div>

            {/* ── Loading step indicator chips ── */}
            {isLoading && (
              <div className={styles.loadingChipsWrap}>
                {LOADING_STEPS.map((step, idx) => (
                  <span
                    key={step}
                    className={`${styles.loadingStepChip} ${
                      idx < loadStep ? styles.loadingStepDone : ""
                    }`}
                  >
                    {idx < loadStep ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Circle size={13} />
                    )}
                    {step}
                  </span>
                ))}
              </div>
            )}

            {/* ── SKELETON LOADER (Rendered while loading) ── */}
            {isLoading && <KeywordSkeleton />}

            {/* ── EMPTY STATE (Before any search) ── */}
            {!isLoading && !hasResults && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconContainer}>
                  <Sparkles size={34} />
                </div>
                <h3 className={styles.emptyTitle}>
                  Discover High-Performing Keywords
                </h3>
                <p className={styles.emptyText}>
                  Type any seed query above and click{" "}
                  <strong>Research</strong> to pull hundreds of Google search
                  suggestions, intent classifications, and topic clusters.
                </p>
              </div>
            )}

            {/* ── RESULTS WORKSPACE ── */}
            {!isLoading && hasResults && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* ── Main View Switcher Tabs ── */}
                  <div className={styles.viewTabsNav}>
                    <button
                      type="button"
                      onClick={() => setActiveViewTab("overview")}
                      className={`${styles.viewTabBtn} ${
                        activeViewTab === "overview" ? styles.viewTabBtnActive : ""
                      }`}
                    >
                      <BarChart3 size={15} />
                      Overview Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewTab("keywords")}
                      className={`${styles.viewTabBtn} ${
                        activeViewTab === "keywords" ? styles.viewTabBtnActive : ""
                      }`}
                    >
                      <Layers size={15} />
                      All Keywords ({allKeywords.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewTab("ideas")}
                      className={`${styles.viewTabBtn} ${
                        activeViewTab === "ideas" ? styles.viewTabBtnActive : ""
                      }`}
                    >
                      <Sparkles size={15} />
                      Keyword Ideas & Strategy
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewTab("serp")}
                      className={`${styles.viewTabBtn} ${
                        activeViewTab === "serp" ? styles.viewTabBtnActive : ""
                      }`}
                    >
                      <Search size={15} />
                      SERP Analysis (Page 1)
                    </button>
                  </div>

                  {/* ── VIEW TAB 1: OVERVIEW ── */}
                  {activeViewTab === "overview" && (
                    <>
                      {apiResult?.overview && (
                        <KeywordOverviewCards
                          overview={apiResult.overview}
                          region={region}
                        />
                      )}

                      {apiResult?.keyword_ideas && (
                        <KeywordIdeasSection
                          data={apiResult.keyword_ideas}
                          onSelectKeyword={(kw) => {
                            setInputVal(kw);
                            onAnalyze(kw, { region, language, includeAlphabet });
                          }}
                          onViewAllVariations={handleViewAllVariations}
                          onViewAllQuestions={handleViewAllQuestions}
                          onViewAllClusters={handleViewAllClusters}
                          onFilterKeyword={handleFilterKeyword}
                        />
                      )}

                      {apiResult?.serp_analysis && (
                        <SerpAnalysisSection
                          serpData={apiResult.serp_analysis}
                          query={query}
                        />
                      )}
                    </>
                  )}

                  {/* ── VIEW TAB 3: KEYWORD IDEAS & TREE ── */}
                  {activeViewTab === "ideas" && apiResult?.keyword_ideas && (
                    <KeywordIdeasSection
                      data={apiResult.keyword_ideas}
                      onSelectKeyword={(kw) => {
                        setInputVal(kw);
                        onAnalyze(kw, { region, language, includeAlphabet });
                      }}
                      onViewAllVariations={handleViewAllVariations}
                      onViewAllQuestions={handleViewAllQuestions}
                      onViewAllClusters={handleViewAllClusters}
                      onFilterKeyword={handleFilterKeyword}
                    />
                  )}

                  {/* ── VIEW TAB 4: SERP ANALYSIS ── */}
                  {activeViewTab === "serp" && apiResult?.serp_analysis && (
                    <SerpAnalysisSection
                      serpData={apiResult.serp_analysis}
                      query={query}
                    />
                  )}

                  {/* ── FULL KEYWORDS TABLE SECTION (Visible in Overview and All Keywords tabs) ── */}
                  {(activeViewTab === "overview" || activeViewTab === "keywords") && (
                    <div id="keywords-table-section">
                      {/* High-level metrics row */}
                      <div className={styles.metricsRow}>
                        <div className={styles.metricCard}>
                          <div className={styles.metricIcon}>
                            <BarChart3 size={24} />
                          </div>
                          <div>
                            <div className={styles.metricVal}>{metrics.total}</div>
                            <div className={styles.metricLbl} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              <span>Total Discovered</span>
                              <InfoTooltip content="Total unique keyword suggestions gathered across autocomplete, questions, prepositions, and alphabet permutations." />
                            </div>
                          </div>
                        </div>

                        <div className={styles.metricCard}>
                          <div className={styles.metricIcon}>
                            <HelpCircle size={24} />
                          </div>
                          <div>
                            <div className={styles.metricVal}>
                              {metrics.questions}
                            </div>
                            <div className={styles.metricLbl} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              <span>Question Queries</span>
                              <InfoTooltip content="Search queries phrased as natural questions (Who, What, Where, When, Why, How, Can). Great for FAQ schemas and featured snippets." />
                            </div>
                          </div>
                        </div>

                        <div className={styles.metricCard}>
                          <div className={styles.metricIcon}>
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <div className={styles.metricVal}>
                              {metrics.commercial}
                            </div>
                            <div className={styles.metricLbl} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              <span>Commercial & Buyer</span>
                              <InfoTooltip content="Keywords where searchers are investigating solutions, reading reviews, comparing brands, or looking to purchase." />
                            </div>
                          </div>
                        </div>

                        <div className={styles.metricCard}>
                          <div className={styles.metricIcon}>
                            <Hash size={24} />
                          </div>
                          <div>
                            <div className={styles.metricVal}>
                              {metrics.avgWords}
                            </div>
                            <div className={styles.metricLbl} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              <span>Avg. Word Count</span>
                              <InfoTooltip content="Average number of words per keyword phrase. Longer phrases (3+ words) indicate high-intent, lower-competition long-tail keywords." />
                            </div>
                          </div>
                        </div>
                      </div>

                  {/* Filter tabs */}
                  <div className={styles.filterRow}>
                    <span className={styles.filterLabel}>
                      <Filter size={13} />
                      Filter:
                    </span>
                    {FILTER_TABS.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveFilter(tab.value)}
                        className={`${styles.filterChip} ${
                          activeFilter === tab.value
                            ? styles.filterChipActive
                            : ""
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Table Toolbar & Search within results */}
                  <div className={styles.tableToolbar}>
                    <div className={styles.resultCount}>
                      <span>
                        Showing <strong>{filtered.length}</strong> keywords
                      </span>

                      {/* Search within results */}
                      <div className={styles.searchWithinInputWrap}>
                        <Search className={styles.searchWithinIcon} size={14} />
                        <input
                          type="text"
                          value={searchWithin}
                          onChange={(e) => setSearchWithin(e.target.value)}
                          placeholder="Filter keywords..."
                          className={styles.searchWithinInput}
                        />
                      </div>
                    </div>

                    <div className={styles.actionsGroup}>
                      <button
                        type="button"
                        onClick={handleCopyAll}
                        className={styles.actionBtn}
                        title="Copy all visible keywords"
                      >
                        {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                        {copiedAll ? "Copied All!" : "Copy All"}
                      </button>

                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      >
                        <Download size={14} />
                        Export CSV
                      </button>
                    </div>
                  </div>

                      {/* Data Table */}
                      <div className={styles.tableWrap}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th onClick={() => handleSort("keyword")}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                  Keyword <SortIcon col="keyword" />
                                  <InfoTooltip content="The discovered search query phrase." />
                                </span>
                              </th>
                              <th>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                  Search Intent
                                  <InfoTooltip content="The user's underlying search goal: Informational, Commercial, Transactional, or Navigational." />
                                </span>
                              </th>
                              <th>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                  Topic Cluster
                                  <InfoTooltip content="Sub-topic grouping based on modifiers and semantic intent." />
                                </span>
                              </th>
                              <th onClick={() => handleSort("word_count")}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                  Words <SortIcon col="word_count" />
                                  <InfoTooltip content="Total word count in this keyword phrase." />
                                </span>
                              </th>
                              <th>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                  Source
                                  <InfoTooltip content="Discovery method: Seed, Autosuggest, Question prefix, Preposition, or Alphabet soup expansion." />
                                </span>
                              </th>
                              <th>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                  Metrics Status
                                  <InfoTooltip content="Search volume and competition source. Currently running under Free Autosuggest Mode (Approach A). Add paid provider key in .env to enable official Google Ads metrics." />
                                </span>
                              </th>
                            </tr>
                          </thead>
                      <tbody>
                        {paginatedKeywords.map((item) => (
                          <tr key={item.keyword}>
                            <td>
                              <div className={styles.kwCell}>
                                <span className={styles.kwText}>{item.keyword}</span>
                                <button
                                  type="button"
                                  className={styles.copyKwBtn}
                                  onClick={() => handleCopySingle(item.keyword)}
                                  title="Copy keyword"
                                >
                                  {copiedKw === item.keyword ? (
                                    <Check size={14} color="#10b981" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`${styles.badgeIntent} ${
                                  styles[`badge_${item.intent}`]
                                }`}
                              >
                                {renderIntentIcon(item.intent)}
                                {item.intent}
                              </span>
                            </td>
                            <td>
                              <span className={styles.badgeGroup}>
                                <FolderTree size={11} />
                                {item.group}
                              </span>
                            </td>
                            <td>
                              <span className={styles.wordCountPill}>
                                {item.word_count}
                              </span>
                            </td>
                            <td>
                              <span className={styles.badgeSource}>
                                {item.source}
                              </span>
                            </td>
                            <td>
                              {apiResult?.metrics_enabled &&
                              item.search_volume !== null ? (
                                <strong>
                                  {item.search_volume.toLocaleString()}/mo
                                </strong>
                              ) : (
                                <span className={styles.metricsBadgeStandby}>
                                  <Sparkles size={11} color="#ff6b35" />
                                  Google Autocomplete
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── PAGINATION CONTROLS ── */}
                  <div className={styles.paginationBar}>
                    <div className={styles.paginationInfo}>
                      Showing{" "}
                      <strong>
                        {filtered.length === 0
                          ? 0
                          : (currentPage - 1) * pageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong>
                        {Math.min(currentPage * pageSize, filtered.length)}
                      </strong>{" "}
                      of <strong>{filtered.length}</strong> keywords
                    </div>

                    <div className={styles.paginationControls}>
                      {/* First Page */}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={styles.pageBtn}
                        title="First Page"
                      >
                        <ChevronsLeft size={15} />
                      </button>

                      {/* Prev Page */}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={styles.pageBtn}
                        title="Previous Page"
                      >
                        <ChevronLeft size={15} />
                      </button>

                      {/* Page Number Buttons */}
                      {getPageNumbers().map((p, idx) =>
                        typeof p === "number" ? (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className={`${styles.pageBtn} ${
                              currentPage === p ? styles.pageBtnActive : ""
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span key={idx} className={styles.pageEllipsis}>
                            {p}
                          </span>
                        )
                      )}

                      {/* Next Page */}
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                        className={styles.pageBtn}
                        title="Next Page"
                      >
                        <ChevronRight size={15} />
                      </button>

                      {/* Last Page */}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages}
                        className={styles.pageBtn}
                        title="Last Page"
                      >
                        <ChevronsRight size={15} />
                      </button>
                    </div>

                    {/* Rows per page selector */}
                    <div className={styles.pageSizeSelector}>
                      <span>Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className={styles.pageSizeSelect}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
                )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
