"use client";

import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface KeywordItem {
    keyword: string;
    word_count: number;
    char_length: number;
    intent: string;
    group: string;
    source: "seed" | "depth_1" | "depth_2" | "question";
}

interface GroupedKeywords {
    [group: string]: KeywordItem[];
}

interface ResearchResult {
    query: string;
    language: string;
    region: string;
    total: number;
    keywords: KeywordItem[];
    grouped: GroupedKeywords;
    intent_summary: Record<string, number>;
    csv?: string;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "ja", label: "Japanese" },
    { code: "pt", label: "Portuguese" },
    { code: "zh", label: "Chinese" },
];

const REGIONS = [
    { code: "us", label: "United States" },
    { code: "in", label: "India" },
    { code: "gb", label: "United Kingdom" },
    { code: "ca", label: "Canada" },
    { code: "au", label: "Australia" },
    { code: "de", label: "Germany" },
    { code: "fr", label: "France" },
    { code: "jp", label: "Japan" },
];

const INTENT_COLORS: Record<string, string> = {
    informational: "#3b82f6",
    navigational: "#8b5cf6",
    transactional: "#10b981",
    commercial: "#f59e0b",
};

const INTENT_ICONS: Record<string, string> = {
    informational: "📚",
    navigational: "🧭",
    transactional: "🛒",
    commercial: "⭐",
};

const SOURCE_LABELS: Record<string, string> = {
    seed: "Seed",
    depth_1: "Related",
    depth_2: "Deep",
    question: "Question",
};

const SOURCE_COLORS: Record<string, string> = {
    seed: "#ff6b35",
    depth_1: "#3b82f6",
    depth_2: "#8b5cf6",
    question: "#10b981",
};

const FEATURES = [
    {
        icon: "🌍",
        title: "Language & Region",
        desc: "Get localized keyword suggestions for any country and language combination.",
    },
    {
        icon: "❓",
        title: "Question Keywords",
        desc: "Automatically discovers who, what, how, why variations of your seed keyword.",
    },
    {
        icon: "🔁",
        title: "Deep Crawl",
        desc: "2-level depth crawling turns 10 seed keywords into 100+ keyword ideas.",
    },
    {
        icon: "🎯",
        title: "Intent Detection",
        desc: "Each keyword tagged as informational, navigational, transactional or commercial.",
    },
    {
        icon: "📂",
        title: "Smart Grouping",
        desc: "Keywords automatically clustered by topic patterns for easy navigation.",
    },
    {
        icon: "📤",
        title: "CSV Export",
        desc: "Download all keywords with metadata in a clean CSV ready for your workflow.",
    },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function KeywordExplorer() {
    // ── State ────────────────────────────────────────────────
    const [query, setQuery] = useState("");
    const [language, setLanguage] = useState("en");
    const [region, setRegion] = useState("us");
    const [depth, setDepth] = useState<1 | 2>(1);
    const [includeQuestions, setIncludeQuestions] = useState(true);
    const [exportCsv, setExportCsv] = useState(false);
    const [minWordCount, setMinWordCount] = useState("");
    const [maxWordCount, setMaxWordCount] = useState("");
    const [minCharLength, setMinCharLength] = useState("");
    const [excludeKeywords, setExcludeKeywords] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "grouped" | "intent">("all");
    const [activeGroup, setActiveGroup] = useState<string>("");
    const [searchFilter, setSearchFilter] = useState("");
    const [copied, setCopied] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    // ── Handlers ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const body: any = {
                query: query.trim(),
                language,
                region,
                depth,
                include_questions: includeQuestions,
                export_csv: exportCsv,
                filters: {},
            };

            if (minWordCount) body.filters.min_word_count = parseInt(minWordCount);
            if (maxWordCount) body.filters.max_word_count = parseInt(maxWordCount);
            if (minCharLength) body.filters.min_char_length = parseInt(minCharLength);
            if (excludeKeywords)
                body.filters.exclude_keywords = excludeKeywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean);

            const res = await fetch("/api/keyword/research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) throw new Error(data.message || "Something went wrong");

            setResult(data.data);
            setActiveGroup(Object.keys(data.data.grouped)[0] || "");

            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (err: any) {
            setError(err.message || "Failed to fetch keywords");
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!result?.csv) return;
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `keywords-${result.query}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyKeywords = () => {
        if (!result) return;
        const text = filteredKeywords.map((k) => k.keyword).join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Derived ───────────────────────────────────────────────
    const filteredKeywords =
        result?.keywords.filter((k) =>
            k.keyword.toLowerCase().includes(searchFilter.toLowerCase()),
        ) || [];

    const groupedKeys = result ? Object.keys(result.grouped) : [];

    const totalIntents = result
        ? Object.values(result.intent_summary).reduce((a, b) => a + b, 0)
        : 0;

    // ─────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        :root {
          --color-primary: #ff6b35;
          --color-primary-hover: #ff5722;
          --color-primary-light: #ffebe6;
          --color-primary-dark: #e85a28;
          --color-slate-50: #f8fafc;
          --color-slate-100: #f1f5f9;
          --color-slate-200: #e2e8f0;
          --color-slate-300: #cbd5e1;
          --color-slate-400: #94a3b8;
          --color-slate-500: #64748b;
          --color-slate-600: #475569;
          --color-slate-700: #334155;
          --color-slate-800: #1e293b;
          --color-slate-900: #0f172a;
          --color-success: #10b981;
          --color-error: #ef4444;
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --border-primary: #e2e8f0;
          --shadow-sm: 0 1px 3px rgba(15,23,42,0.1);
          --shadow-md: 0 4px 6px -1px rgba(15,23,42,0.1);
          --shadow-lg: 0 10px 15px -3px rgba(15,23,42,0.1);
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-2xl: 1.5rem;
          --transition-base: 250ms cubic-bezier(0.4,0,0.2,1);
          --transition-bounce: 500ms cubic-bezier(0.34,1.56,0.64,1);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ke-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .ke-hero {
          background: var(--color-slate-900);
          position: relative;
          overflow: hidden;
          padding: 5rem 1.5rem 4rem;
        }

        .ke-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255,107,53,0.25), transparent),
            radial-gradient(ellipse 40% 30% at 80% 60%, rgba(255,87,34,0.1), transparent);
          pointer-events: none;
        }

        .ke-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .ke-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .ke-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,107,53,0.15);
          border: 1px solid rgba(255,107,53,0.3);
          color: #ff9a76;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          animation: ke-fadeDown 0.6s ease both;
        }

        .ke-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          animation: ke-fadeDown 0.6s 0.1s ease both;
        }

        .ke-hero-title span {
          background: linear-gradient(135deg, #ff6b35, #ff9a76);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ke-hero-desc {
          font-size: 1.1rem;
          color: var(--color-slate-400);
          max-width: 560px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          animation: ke-fadeDown 0.6s 0.2s ease both;
        }

        .ke-stats-row {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          animation: ke-fadeDown 0.6s 0.3s ease both;
        }

        .ke-stat {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .ke-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
        }

        .ke-stat-label {
          font-size: 0.78rem;
          color: var(--color-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── FORM CARD ── */
        .ke-form-wrap {
          background: var(--color-slate-900);
          padding-bottom: 0;
        }

        .ke-form-card {
          background: #ffffff;
          border-radius: 1.25rem 1.25rem 0 0;
          padding: 2.5rem;
          box-shadow: 0 -4px 40px rgba(0,0,0,0.12);
          position: relative;
          z-index: 2;
          animation: ke-fadeUp 0.5s 0.35s ease both;
        }

        .ke-search-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .ke-search-input {
          flex: 1;
          padding: 0.9rem 1.25rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          outline: none;
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .ke-search-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(255,107,53,0.1);
          background: #fff;
        }

        .ke-search-input::placeholder { color: var(--color-slate-400); }

        .ke-btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1.75rem;
          background: linear-gradient(135deg, #ff6b35, #ff5722);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: transform var(--transition-bounce), box-shadow var(--transition-base), opacity var(--transition-base);
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(255,107,53,0.35);
        }

        .ke-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,107,53,0.45);
        }

        .ke-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .ke-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

        .ke-options-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 1rem;
        }

        .ke-select {
          padding: 0.55rem 2rem 0.55rem 0.85rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.65rem center;
          transition: border-color var(--transition-base);
        }

        .ke-select:focus { border-color: var(--color-primary); }

        .ke-depth-toggle {
          display: flex;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .ke-depth-btn {
          padding: 0.5rem 0.9rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .ke-depth-btn.active {
          background: var(--color-primary);
          color: #fff;
        }

        .ke-toggle-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .ke-toggle {
          position: relative;
          width: 36px;
          height: 20px;
        }

        .ke-toggle input { display: none; }

        .ke-toggle-track {
          position: absolute;
          inset: 0;
          background: var(--color-slate-200);
          border-radius: 9999px;
          transition: background var(--transition-base);
        }

        .ke-toggle input:checked ~ .ke-toggle-track {
          background: var(--color-primary);
        }

        .ke-toggle-thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 14px; height: 14px;
          background: #fff;
          border-radius: 50%;
          transition: transform var(--transition-bounce);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .ke-toggle input:checked ~ .ke-toggle-track ~ .ke-toggle-thumb,
        .ke-toggle input:checked + .ke-toggle-track + .ke-toggle-thumb {
          transform: translateX(16px);
        }

        .ke-toggle-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .ke-filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.9rem;
          background: transparent;
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-md);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .ke-filter-toggle:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .ke-filter-toggle.open {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: rgba(255,107,53,0.05);
        }

        .ke-filters-panel {
          overflow: hidden;
          transition: max-height 0.35s ease, opacity 0.3s ease;
          max-height: 0;
          opacity: 0;
        }

        .ke-filters-panel.open {
          max-height: 300px;
          opacity: 1;
        }

        .ke-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
          margin-top: 1rem;
        }

        .ke-filter-field { display: flex; flex-direction: column; gap: 0.35rem; }

        .ke-filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ke-filter-input {
          padding: 0.55rem 0.85rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-md);
          outline: none;
          background: var(--bg-secondary);
          color: var(--text-primary);
          transition: border-color var(--transition-base);
        }

        .ke-filter-input:focus { border-color: var(--color-primary); }

        /* ── ERROR ── */
        .ke-error {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444;
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-lg);
          margin-top: 1rem;
          font-size: 0.9rem;
          animation: ke-shake 0.4s ease;
        }

        /* ── LOADING ── */
        .ke-loading {
          padding: 3rem 1.5rem;
          text-align: center;
        }

        .ke-spinner {
          width: 44px; height: 44px;
          border: 3px solid var(--border-primary);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: ke-spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        .ke-loading-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .ke-loading-dots span {
          animation: ke-blink 1.2s infinite;
          font-size: 1.2rem;
          color: var(--color-primary);
        }
        .ke-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ke-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── RESULTS ── */
        .ke-results {
          background: var(--bg-secondary);
          padding: 3rem 1.5rem;
        }

        .ke-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .ke-results-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .ke-results-meta {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .ke-results-meta strong { color: var(--color-primary); }

        .ke-action-btns {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .ke-btn-outline {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          background: #fff;
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-md);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .ke-btn-outline:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        /* ── INTENT SUMMARY ── */
        .ke-intent-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .ke-intent-card {
          background: #fff;
          border-radius: var(--radius-xl);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          transition: transform var(--transition-bounce), box-shadow var(--transition-base);
          animation: ke-fadeUp 0.4s ease both;
        }

        .ke-intent-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .ke-intent-icon {
          width: 44px; height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .ke-intent-info { min-width: 0; }

        .ke-intent-count {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .ke-intent-name {
          font-size: 0.78rem;
          text-transform: capitalize;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .ke-intent-bar {
          height: 3px;
          border-radius: 2px;
          margin-top: 0.4rem;
          transition: width 1s ease;
        }

        /* ── TABS ── */
        .ke-tabs {
          display: flex;
          gap: 0.25rem;
          background: #fff;
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 0.3rem;
          margin-bottom: 1.5rem;
          width: fit-content;
        }

        .ke-tab {
          padding: 0.5rem 1.25rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          background: transparent;
          color: var(--text-secondary);
          transition: all var(--transition-base);
        }

        .ke-tab.active {
          background: var(--color-primary);
          color: #fff;
          box-shadow: 0 2px 8px rgba(255,107,53,0.3);
        }

        /* ── SEARCH FILTER ── */
        .ke-search-filter-wrap {
          position: relative;
          margin-bottom: 1.25rem;
          max-width: 380px;
        }

        .ke-search-filter-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-slate-400);
          font-size: 0.9rem;
          pointer-events: none;
        }

        .ke-search-filter {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 2.25rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-lg);
          background: #fff;
          outline: none;
          transition: border-color var(--transition-base);
          color: var(--text-primary);
        }

        .ke-search-filter:focus { border-color: var(--color-primary); }

        /* ── KEYWORD TABLE ── */
        .ke-table-wrap {
          background: #fff;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          overflow: hidden;
        }

        .ke-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ke-table th {
          padding: 0.85rem 1.1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          white-space: nowrap;
        }

        .ke-table td {
          padding: 0.75rem 1.1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid rgba(226,232,240,0.6);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .ke-table tr:last-child td { border-bottom: none; }

        .ke-table tr {
          transition: background var(--transition-base);
          animation: ke-fadeIn 0.3s ease both;
        }

        .ke-table tr:hover td { background: rgba(255,107,53,0.02); }

        .ke-keyword-text {
          font-weight: 500;
          color: var(--text-primary);
        }

        .ke-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .ke-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: var(--bg-secondary);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        /* ── GROUPED VIEW ── */
        .ke-grouped-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 1.25rem;
          align-items: start;
        }

        .ke-group-sidebar {
          background: #fff;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-primary);
          overflow: hidden;
          position: sticky;
          top: 1rem;
        }

        .ke-group-sidebar-title {
          padding: 0.85rem 1.1rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
        }

        .ke-group-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.7rem 1rem;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(226,232,240,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-base);
          text-transform: capitalize;
        }

        .ke-group-btn:last-child { border-bottom: none; }

        .ke-group-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }

        .ke-group-btn.active {
          background: rgba(255,107,53,0.06);
          color: var(--color-primary);
          font-weight: 600;
          border-left: 3px solid var(--color-primary);
        }

        /* ── FEATURES SECTION ── */
        .ke-features {
          padding: 5rem 1.5rem;
          background: #fff;
        }

        .ke-section-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-primary);
          margin-bottom: 0.75rem;
        }

        .ke-section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          line-height: 1.15;
        }

        .ke-section-desc {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 3rem;
        }

        .ke-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .ke-feature-card {
          padding: 1.75rem;
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-xl);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .ke-feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,107,53,0.03), transparent);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .ke-feature-card:hover {
          border-color: rgba(255,107,53,0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(255,107,53,0.1);
        }

        .ke-feature-card:hover::before { opacity: 1; }

        .ke-feature-icon {
          font-size: 1.75rem;
          margin-bottom: 1rem;
          display: block;
        }

        .ke-feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .ke-feature-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ── HOW IT WORKS ── */
        .ke-how {
          padding: 5rem 1.5rem;
          background: var(--color-slate-900);
          position: relative;
          overflow: hidden;
        }

        .ke-how::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 80% 50%, rgba(255,107,53,0.08), transparent);
          pointer-events: none;
        }

        .ke-how .ke-section-title { color: #fff; }
        .ke-how .ke-section-desc { color: var(--color-slate-400); }

        .ke-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          position: relative;
        }

        .ke-step {
          padding: 1.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-xl);
          transition: all var(--transition-base);
        }

        .ke-step:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,107,53,0.3);
        }

        .ke-step-num {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff6b35, rgba(255,107,53,0.2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.75rem;
        }

        .ke-step-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .ke-step-desc {
          font-size: 0.875rem;
          color: var(--color-slate-400);
          line-height: 1.6;
        }

        /* ── FAQ ── */
        .ke-faq {
          padding: 5rem 1.5rem;
          background: #fff;
        }

        .ke-faq-list {
          max-width: 720px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ke-faq-item {
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color var(--transition-base);
        }

        .ke-faq-item.open { border-color: rgba(255,107,53,0.3); }

        .ke-faq-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          user-select: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          transition: color var(--transition-base);
        }

        .ke-faq-item.open .ke-faq-q { color: var(--color-primary); }

        .ke-faq-chevron {
          font-size: 0.75rem;
          transition: transform var(--transition-base);
          flex-shrink: 0;
          color: var(--color-slate-400);
        }

        .ke-faq-item.open .ke-faq-chevron { transform: rotate(180deg); }

        .ke-faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease, padding 0.3s ease;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.7;
          padding: 0 1.25rem;
        }

        .ke-faq-item.open .ke-faq-a {
          max-height: 200px;
          padding: 0 1.25rem 1.1rem;
        }

        /* ── EMPTY / NO RESULTS ── */
        .ke-empty {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .ke-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        /* ── ANIMATIONS ── */
        @keyframes ke-fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes ke-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes ke-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes ke-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes ke-blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }

        @keyframes ke-shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .ke-search-row { flex-direction: column; }
          .ke-btn-primary { justify-content: center; }
          .ke-grouped-layout { grid-template-columns: 1fr; }
          .ke-group-sidebar { position: static; }
          .ke-stats-row { gap: 1.25rem; }
          .ke-form-card { padding: 1.5rem; }
          .ke-table { font-size: 0.8rem; }
          .ke-table th, .ke-table td { padding: 0.65rem 0.75rem; }
        }
      `}</style>

            <div className="ke-page">

                {/* ── HERO ── */}
                <section className="ke-hero">
                    <div className="ke-hero-grid" />
                    <div className="ke-container">
                        <div className="ke-badge">
                            <span>🔍</span> Free Keyword Research Tool
                        </div>
                        <h1 className="ke-hero-title">
                            Discover Keywords<br />
                            <span>That Actually Convert</span>
                        </h1>
                        <p className="ke-hero-desc">
                            Uncover thousands of keyword ideas from Google Autocomplete — with intent detection,
                            smart grouping, question keywords, and deep crawling. All in one powerful tool.
                        </p>
                        <div className="ke-stats-row">
                            {[
                                { num: "100+", label: "Keywords per search" },
                                { num: "16", label: "Question variations" },
                                { num: "4", label: "Intent categories" },
                                { num: "Free", label: "No API key needed" },
                            ].map((s) => (
                                <div className="ke-stat" key={s.label}>
                                    <span className="ke-stat-num">{s.num}</span>
                                    <span className="ke-stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FORM ── */}
                <div className="ke-form-wrap">
                    <div className="ke-container">
                        <div className="ke-form-card">
                            <form onSubmit={handleSubmit}>
                                {/* Search row */}
                                <div className="ke-search-row">
                                    <input
                                        className="ke-search-input"
                                        type="text"
                                        placeholder="Enter a seed keyword (e.g. pdf tools, seo checklist…)"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                    <button className="ke-btn-primary" type="submit" disabled={loading || !query.trim()}>
                                        {loading ? (
                                            <>
                                                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "ke-spin 0.7s linear infinite" }} />
                                                Researching…
                                            </>
                                        ) : (
                                            <> 🔍 Explore Keywords </>
                                        )}
                                    </button>
                                </div>

                                {/* Options row */}
                                <div className="ke-options-row">
                                    <select className="ke-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                        {LANGUAGES.map((l) => (
                                            <option key={l.code} value={l.code}>{l.label}</option>
                                        ))}
                                    </select>

                                    <select className="ke-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                                        {REGIONS.map((r) => (
                                            <option key={r.code} value={r.code}>{r.label}</option>
                                        ))}
                                    </select>

                                    <div className="ke-depth-toggle">
                                        <button type="button" className={`ke-depth-btn ${depth === 1 ? "active" : ""}`} onClick={() => setDepth(1)}>Depth 1</button>
                                        <button type="button" className={`ke-depth-btn ${depth === 2 ? "active" : ""}`} onClick={() => setDepth(2)}>Depth 2</button>
                                    </div>

                                    <label className="ke-toggle-row">
                                        <div className="ke-toggle">
                                            <input type="checkbox" checked={includeQuestions} onChange={(e) => setIncludeQuestions(e.target.checked)} />
                                            <div className="ke-toggle-track" />
                                            <div className="ke-toggle-thumb" />
                                        </div>
                                        <span className="ke-toggle-label">Question keywords</span>
                                    </label>

                                    <label className="ke-toggle-row">
                                        <div className="ke-toggle">
                                            <input type="checkbox" checked={exportCsv} onChange={(e) => setExportCsv(e.target.checked)} />
                                            <div className="ke-toggle-track" />
                                            <div className="ke-toggle-thumb" />
                                        </div>
                                        <span className="ke-toggle-label">Export CSV</span>
                                    </label>

                                    <button
                                        type="button"
                                        className={`ke-filter-toggle ${showFilters ? "open" : ""}`}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        ⚙️ Filters {showFilters ? "▲" : "▼"}
                                    </button>
                                </div>

                                {/* Filters panel */}
                                <div className={`ke-filters-panel ${showFilters ? "open" : ""}`}>
                                    <div className="ke-filters-grid">
                                        <div className="ke-filter-field">
                                            <label className="ke-filter-label">Min Word Count</label>
                                            <input className="ke-filter-input" type="number" min="1" max="10" placeholder="e.g. 2" value={minWordCount} onChange={(e) => setMinWordCount(e.target.value)} />
                                        </div>
                                        <div className="ke-filter-field">
                                            <label className="ke-filter-label">Max Word Count</label>
                                            <input className="ke-filter-input" type="number" min="1" max="10" placeholder="e.g. 6" value={maxWordCount} onChange={(e) => setMaxWordCount(e.target.value)} />
                                        </div>
                                        <div className="ke-filter-field">
                                            <label className="ke-filter-label">Min Char Length</label>
                                            <input className="ke-filter-input" type="number" min="1" placeholder="e.g. 5" value={minCharLength} onChange={(e) => setMinCharLength(e.target.value)} />
                                        </div>
                                        <div className="ke-filter-field">
                                            <label className="ke-filter-label">Exclude Keywords</label>
                                            <input className="ke-filter-input" type="text" placeholder="e.g. free, crack, adult" value={excludeKeywords} onChange={(e) => setExcludeKeywords(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="ke-error">
                                        <span>⚠️</span> {error}
                                    </div>
                                )}
                            </form>

                            {/* Loading */}
                            {loading && (
                                <div className="ke-loading">
                                    <div className="ke-spinner" />
                                    <p className="ke-loading-text">
                                        Crawling Google Autocomplete
                                        <span className="ke-loading-dots">
                                            <span>.</span><span>.</span><span>.</span>
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RESULTS ── */}
                {result && !loading && (
                    <section className="ke-results" ref={resultsRef}>
                        <div className="ke-container">

                            {/* Header */}
                            <div className="ke-results-header">
                                <div>
                                    <h2 className="ke-results-title">Research Results</h2>
                                    <p className="ke-results-meta">
                                        Found <strong>{result.total}</strong> keywords for&nbsp;
                                        <strong>&quot;{result.query}&quot;</strong> &nbsp;·&nbsp;
                                        {result.language.toUpperCase()} / {result.region.toUpperCase()}
                                    </p>
                                </div>
                                <div className="ke-action-btns">
                                    <button className="ke-btn-outline" onClick={copyKeywords}>
                                        {copied ? "✅ Copied!" : "📋 Copy All"}
                                    </button>
                                    {result.csv && (
                                        <button className="ke-btn-outline" onClick={downloadCSV}>
                                            📥 Download CSV
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Intent Summary Cards */}
                            <div className="ke-intent-summary">
                                {Object.entries(result.intent_summary).map(([intent, count], i) => (
                                    <div className="ke-intent-card" key={intent} style={{ animationDelay: `${i * 0.08}s` }}>
                                        <div className="ke-intent-icon" style={{ background: `${INTENT_COLORS[intent]}18` }}>
                                            {INTENT_ICONS[intent] || "💡"}
                                        </div>
                                        <div className="ke-intent-info">
                                            <div className="ke-intent-count">{count}</div>
                                            <div className="ke-intent-name">{intent}</div>
                                            <div
                                                className="ke-intent-bar"
                                                style={{
                                                    background: INTENT_COLORS[intent] || "#94a3b8",
                                                    width: `${Math.round((count / totalIntents) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div className="ke-tabs">
                                {(["all", "grouped", "intent"] as const).map((tab) => (
                                    <button key={tab} className={`ke-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                                        {tab === "all" ? "All Keywords" : tab === "grouped" ? "By Group" : "By Intent"}
                                    </button>
                                ))}
                            </div>

                            {/* Search filter */}
                            {activeTab === "all" && (
                                <div className="ke-search-filter-wrap">
                                    <span className="ke-search-filter-icon">🔍</span>
                                    <input
                                        className="ke-search-filter"
                                        type="text"
                                        placeholder="Filter keywords…"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* ── ALL TAB ── */}
                            {activeTab === "all" && (
                                <div className="ke-table-wrap">
                                    {filteredKeywords.length === 0 ? (
                                        <div className="ke-empty">
                                            <div className="ke-empty-icon">🔍</div>
                                            <p>No keywords match your filter.</p>
                                        </div>
                                    ) : (
                                        <table className="ke-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Keyword</th>
                                                    <th>Words</th>
                                                    <th>Intent</th>
                                                    <th>Group</th>
                                                    <th>Source</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredKeywords.map((kw, i) => (
                                                    <tr key={kw.keyword} style={{ animationDelay: `${Math.min(i * 0.02, 0.5)}s` }}>
                                                        <td style={{ color: "var(--color-slate-400)", fontSize: "0.8rem" }}>{i + 1}</td>
                                                        <td><span className="ke-keyword-text">{kw.keyword}</span></td>
                                                        <td><span className="ke-count-badge">{kw.word_count}</span></td>
                                                        <td>
                                                            <span className="ke-chip" style={{ background: `${INTENT_COLORS[kw.intent]}15`, color: INTENT_COLORS[kw.intent] }}>
                                                                {INTENT_ICONS[kw.intent]} {kw.intent}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="ke-chip" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                                                {kw.group}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="ke-chip" style={{ background: `${SOURCE_COLORS[kw.source]}15`, color: SOURCE_COLORS[kw.source] }}>
                                                                {SOURCE_LABELS[kw.source]}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* ── GROUPED TAB ── */}
                            {activeTab === "grouped" && (
                                <div className="ke-grouped-layout">
                                    <div className="ke-group-sidebar">
                                        <div className="ke-group-sidebar-title">Groups</div>
                                        {groupedKeys.map((g) => (
                                            <button key={g} className={`ke-group-btn ${activeGroup === g ? "active" : ""}`} onClick={() => setActiveGroup(g)}>
                                                <span style={{ textTransform: "capitalize" }}>{g}</span>
                                                <span className="ke-count-badge">{result.grouped[g].length}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ke-table-wrap">
                                        {activeGroup && result.grouped[activeGroup] ? (
                                            <table className="ke-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Keyword</th>
                                                        <th>Words</th>
                                                        <th>Intent</th>
                                                        <th>Source</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.grouped[activeGroup].map((kw, i) => (
                                                        <tr key={kw.keyword} style={{ animationDelay: `${i * 0.02}s` }}>
                                                            <td style={{ color: "var(--color-slate-400)", fontSize: "0.8rem" }}>{i + 1}</td>
                                                            <td><span className="ke-keyword-text">{kw.keyword}</span></td>
                                                            <td><span className="ke-count-badge">{kw.word_count}</span></td>
                                                            <td>
                                                                <span className="ke-chip" style={{ background: `${INTENT_COLORS[kw.intent]}15`, color: INTENT_COLORS[kw.intent] }}>
                                                                    {INTENT_ICONS[kw.intent]} {kw.intent}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="ke-chip" style={{ background: `${SOURCE_COLORS[kw.source]}15`, color: SOURCE_COLORS[kw.source] }}>
                                                                    {SOURCE_LABELS[kw.source]}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="ke-empty">
                                                <p>Select a group from the sidebar.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── INTENT TAB ── */}
                            {activeTab === "intent" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {Object.entries(INTENT_COLORS).map(([intent, color]) => {
                                        const intentKws = result.keywords.filter((k) => k.intent === intent);
                                        if (!intentKws.length) return null;
                                        return (
                                            <div key={intent} className="ke-table-wrap">
                                                <div style={{ padding: "0.9rem 1.1rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                    <span style={{ fontSize: "1.1rem" }}>{INTENT_ICONS[intent]}</span>
                                                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, textTransform: "capitalize", color }}>{intent}</span>
                                                    <span className="ke-count-badge" style={{ marginLeft: "auto" }}>{intentKws.length}</span>
                                                </div>
                                                <table className="ke-table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Keyword</th>
                                                            <th>Words</th>
                                                            <th>Group</th>
                                                            <th>Source</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {intentKws.map((kw, i) => (
                                                            <tr key={kw.keyword}>
                                                                <td style={{ color: "var(--color-slate-400)", fontSize: "0.8rem" }}>{i + 1}</td>
                                                                <td><span className="ke-keyword-text">{kw.keyword}</span></td>
                                                                <td><span className="ke-count-badge">{kw.word_count}</span></td>
                                                                <td>
                                                                    <span className="ke-chip" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                                                        {kw.group}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="ke-chip" style={{ background: `${SOURCE_COLORS[kw.source]}15`, color: SOURCE_COLORS[kw.source] }}>
                                                                        {SOURCE_LABELS[kw.source]}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </section>
                )}

                {/* ── FEATURES ── */}
                <section className="ke-features">
                    <div className="ke-container">
                        <div className="ke-section-label">✦ Capabilities</div>
                        <h2 className="ke-section-title">Everything You Need for<br />Keyword Research</h2>
                        <p className="ke-section-desc">
                            Powered by Google Autocomplete with intelligent processing — no API key, no credit card, no limits.
                        </p>
                        <div className="ke-features-grid">
                            {FEATURES.map((f) => (
                                <div className="ke-feature-card" key={f.title}>
                                    <span className="ke-feature-icon">{f.icon}</span>
                                    <h3 className="ke-feature-title">{f.title}</h3>
                                    <p className="ke-feature-desc">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="ke-how">
                    <div className="ke-container">
                        <div className="ke-section-label" style={{ color: "#ff9a76" }}>✦ How It Works</div>
                        <h2 className="ke-section-title">From One Keyword<br />to Hundreds of Ideas</h2>
                        <p className="ke-section-desc">
                            Our multi-layer crawling engine extracts the maximum number of keyword ideas from Google&apos;s own suggestion data.
                        </p>
                        <div className="ke-steps">
                            {[
                                { num: "01", title: "Enter Your Seed", desc: "Type any topic, product, or phrase. Choose your language and target region." },
                                { num: "02", title: "Deep Crawl", desc: "We fetch suggestions, then crawl each suggestion up to 2 levels deep for maximum coverage." },
                                { num: "03", title: "Question Mining", desc: "16 question words (who, what, how, why…) are auto-appended to uncover FAQ-style keywords." },
                                { num: "04", title: "Analyze & Export", desc: "Each keyword is tagged with intent and grouped by topic. Export to CSV for your workflow." },
                            ].map((s) => (
                                <div className="ke-step" key={s.num}>
                                    <div className="ke-step-num">{s.num}</div>
                                    <div className="ke-step-title">{s.title}</div>
                                    <p className="ke-step-desc">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <FaqSection />

            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────
// FAQ SUB-COMPONENT
// ─────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: "Is Keyword Explorer completely free to use?",
        a: "Yes! Keyword Explorer uses Google's public Autocomplete API — no API key or payment required. You can run unlimited searches.",
    },
    {
        q: "What is 'Depth 2' crawling?",
        a: "Depth 1 fetches suggestions for your seed keyword. Depth 2 takes the top 5 of those suggestions and fetches suggestions for each of them too — turning 10 keywords into 100+.",
    },
    {
        q: "How is search intent detected?",
        a: "Each keyword is pattern-matched against common intent signals: informational (how, what, why), navigational (login, download), transactional (buy, price, free), and commercial (best, review, vs).",
    },
    {
        q: "What does 'Question Keywords' do?",
        a: "It automatically prepends 16 question words (who, what, when, where, why, how, can, is, are, does, will, which, should, do, was, has) to your seed keyword and fetches suggestions for each — great for FAQ and featured snippet targeting.",
    },
    {
        q: "Can I export the results?",
        a: "Yes. Enable 'Export CSV' before running your search. After results load, you'll get a Download CSV button. The file includes keyword, word count, char length, intent, group, and source columns.",
    },
    {
        q: "What languages and regions are supported?",
        a: "We support English, Hindi, Spanish, French, German, Japanese, Portuguese, and Chinese — targeting US, India, UK, Canada, Australia, Germany, France, and Japan regions.",
    },
];

function FaqSection() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section className="ke-faq">
            <div className="ke-container">
                <div className="ke-section-label">✦ FAQ</div>
                <h2 className="ke-section-title">Common Questions</h2>
                <p className="ke-section-desc" style={{ marginBottom: "2rem" }}>
                    Everything you need to know about Keyword Explorer.
                </p>
                <div className="ke-faq-list">
                    {FAQS.map((f, i) => (
                        <div className={`ke-faq-item ${open === i ? "open" : ""}`} key={i}>
                            <button className="ke-faq-q" onClick={() => setOpen(open === i ? null : i)}>
                                {f.q}
                                <span className="ke-faq-chevron">▼</span>
                            </button>
                            <div className="ke-faq-a">{f.a}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}