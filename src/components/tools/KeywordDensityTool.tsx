"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
  FiSearch,
  FiFileText,
  FiClock,
  FiBarChart2,
  FiCopy,
  FiDownload,
  FiCheck,
  FiTrash2,
  FiFilter,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiLayers,
  FiCode,
  FiExternalLink,
} from "react-icons/fi";

const DEFAULT_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
  "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
  "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
  "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
  "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
  "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves", "will", "just", "also"
]);

type NGramSize = 1 | 2 | 3 | 4;
type SortMode = "density-desc" | "density-asc" | "alpha-asc" | "alpha-desc";

interface KeywordStat {
  phrase: string;
  count: number;
  density: number;
}

const SAMPLE_TEXT = `Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of searches, including image search, video search, academic search, news search, and industry-specific vertical search engines.

As an internet marketing strategy, SEO considers how search engines work, the computer-programmed algorithms that dictate search engine behavior, what people search for, the actual search terms or keywords typed into search engines, and which search engines are preferred by their targeted audience. SEO is performed because a website will receive more visitors from a search engine when websites rank higher on the search engine results page (SERP). These visitors can then potentially be converted into customers.

A search engine optimization strategy involves keyword research, content optimization, structured data markup, technical site performance, Core Web Vitals, and authoritative backlink building. Analyzing keyword density and n-gram phrases ensures content avoids keyword stuffing while maintaining high relevance for primary search intent. Modern search engines use natural language processing to understand semantic topical authority rather than simple keyword counts.`;

export default function KeywordDensityTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [activeTab, setActiveTab] = useState<NGramSize>(1);
  const [filterStopWords, setFilterStopWords] = useState<boolean>(true);
  const [minWordLength, setMinWordLength] = useState<number>(3);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("density-desc");
  const [highlightKeyword, setHighlightKeyword] = useState<string>("");
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);

  // Strip HTML utility
  const handleStripHtml = () => {
    const stripped = text.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    setText(stripped);
    toast.success("Stripped all HTML tags from text!", "Cleaned");
  };

  // Raw tokenization
  const tokens = useMemo(() => {
    if (!text.trim()) return [];
    // Replace non-alphanumeric chars (except hyphens and apostrophes inside words)
    const sanitized = text
      .toLowerCase()
      .replace(/[\r\n\t]+/g, " ")
      .replace(/[^\w\s-']/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return sanitized
      .split(" ")
      .map((w) => w.replace(/^[-']+|[-']+$/g, "")) // trim hyphens/apostrophes
      .filter((w) => w.length > 0);
  }, [text]);

  // Overall Document Metrics
  const stats = useMemo(() => {
    const totalWords = tokens.length;
    const totalCharsWithSpaces = text.length;
    const totalCharsWithoutSpaces = text.replace(/\s/g, "").length;
    const uniqueWords = new Set(tokens).size;
    const readingTimeMins = totalWords > 0 ? Math.ceil(totalWords / 200) : 0;
    const speakingTimeMins = totalWords > 0 ? Math.ceil(totalWords / 130) : 0;
    const avgWordLength =
      totalWords > 0
        ? (tokens.reduce((acc, w) => acc + w.length, 0) / totalWords).toFixed(1)
        : "0";

    return {
      totalWords,
      uniqueWords,
      totalCharsWithSpaces,
      totalCharsWithoutSpaces,
      readingTimeMins,
      speakingTimeMins,
      avgWordLength,
    };
  }, [text, tokens]);

  // Compute N-Grams
  const nGramData = useMemo(() => {
    if (tokens.length === 0) return { 1: [], 2: [], 3: [], 4: [] };

    const totalWords = tokens.length;
    const result: Record<NGramSize, KeywordStat[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    ([1, 2, 3, 4] as NGramSize[]).forEach((n) => {
      const counts: Record<string, number> = {};
      const maxIndex = tokens.length - n;

      for (let i = 0; i <= maxIndex; i++) {
        const slice = tokens.slice(i, i + n);

        // Stop word & word length filters
        if (filterStopWords) {
          if (n === 1) {
            const word = slice[0];
            if (DEFAULT_STOP_WORDS.has(word) || word.length < minWordLength) {
              continue;
            }
          } else {
            // For multi-word n-grams, ignore if ALL words are stop words or start/end with stop word
            const allStopWords = slice.every((w) => DEFAULT_STOP_WORDS.has(w));
            const startOrEndStop =
              DEFAULT_STOP_WORDS.has(slice[0]) ||
              DEFAULT_STOP_WORDS.has(slice[slice.length - 1]);

            if (allStopWords || startOrEndStop) {
              continue;
            }
          }
        } else if (minWordLength > 1 && n === 1) {
          if (slice[0].length < minWordLength) continue;
        }

        const phrase = slice.join(" ");
        counts[phrase] = (counts[phrase] || 0) + 1;
      }

      // Convert to array and calculate density percentage
      // Standard SEO density formula: (count / (totalWords - n + 1)) * 100
      const possibleNGrams = Math.max(1, totalWords - n + 1);
      const list: KeywordStat[] = Object.entries(counts).map(([phrase, count]) => ({
        phrase,
        count,
        density: Number(((count / possibleNGrams) * 100).toFixed(2)),
      }));

      result[n] = list;
    });

    return result;
  }, [tokens, filterStopWords, minWordLength]);

  // Filtered and Sorted list for active tab
  const currentList = useMemo(() => {
    let list = nGramData[activeTab] || [];

    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase().trim();
      list = list.filter((item) => item.phrase.toLowerCase().includes(query));
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortMode === "density-desc") return b.count - a.count;
      if (sortMode === "density-asc") return a.count - b.count;
      if (sortMode === "alpha-asc") return a.phrase.localeCompare(b.phrase);
      if (sortMode === "alpha-desc") return b.phrase.localeCompare(a.phrase);
      return 0;
    });
  }, [nGramData, activeTab, searchFilter, sortMode]);

  // Copy CSV
  const handleCopyCsv = () => {
    if (currentList.length === 0) {
      toast.error("No keywords to export", "Empty");
      return;
    }
    const headers = "Phrase,Count,Density (%)\n";
    const rows = currentList
      .map((item) => `"${item.phrase.replace(/"/g, '""')}",${item.count},${item.density}%`)
      .join("\n");
    navigator.clipboard.writeText(headers + rows);
    setCopiedCsv(true);
    toast.success(`Copied ${currentList.length} ${activeTab}-gram keywords as CSV!`, "Exported");
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (currentList.length === 0) {
      toast.error("No keywords to download", "Empty");
      return;
    }
    const headers = "Phrase,Count,Density (%)\n";
    const rows = currentList
      .map((item) => `"${item.phrase.replace(/"/g, '""')}",${item.count},${item.density}%`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-density-${activeTab}gram.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!", "Downloaded");
  };

  // Highlight status helper
  const getDensityStatus = (density: number) => {
    if (density > 3.5) {
      return {
        label: "High Risk",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.15)",
        desc: "Possible keyword stuffing. Consider diversifying with synonyms.",
      };
    }
    if (density > 2.5) {
      return {
        label: "Moderate",
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.15)",
        desc: "Close to upper threshold. Keep it natural.",
      };
    }
    if (density >= 0.8) {
      return {
        label: "Optimal",
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.15)",
        desc: "Great keyword frequency for organic relevance.",
      };
    }
    return {
      label: "Low",
      color: "#94a3b8",
      bg: "rgba(148, 163, 184, 0.1)",
      desc: "Light topical mention.",
    };
  };

  // Highlight occurrences in preview box
  const renderedHighlightedText = useMemo(() => {
    if (!highlightKeyword.trim()) return text;
    try {
      const escaped = highlightKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = text.split(regex);

      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: "#f59e0b",
              color: "#000",
              borderRadius: 3,
              padding: "1px 4px",
              fontWeight: 700,
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  }, [text, highlightKeyword]);

  return (
    <motion.div
      className="tool-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Info Banner ──────────────────────────────────────────────── */}
      <div className="tool-info-banner">
        <FiBarChart2 />
        <p>
          Analyze your content’s keyword density across 1-gram (single words), 2-gram, 3-gram, and
          4-gram phrases. Filter stop-words, detect over-optimization risks, and optimize topical
          relevance without keyword stuffing.
        </p>
      </div>

      {/* ── Stats Metric Cards Header ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <div style={metricCardStyle}>
          <span style={metricLabelStyle}>Total Words</span>
          <span style={metricValStyle}>{stats.totalWords.toLocaleString()}</span>
        </div>
        <div style={metricCardStyle}>
          <span style={metricLabelStyle}>Unique Words</span>
          <span style={metricValStyle}>{stats.uniqueWords.toLocaleString()}</span>
        </div>
        <div style={metricCardStyle}>
          <span style={metricLabelStyle}>Characters</span>
          <span style={metricValStyle}>{stats.totalCharsWithoutSpaces.toLocaleString()}</span>
          <span style={{ fontSize: 10, color: "#64748b" }}>({stats.totalCharsWithSpaces} w/ spaces)</span>
        </div>
        <div style={metricCardStyle}>
          <span style={metricLabelStyle}>Reading Time</span>
          <span style={metricValStyle}>~{stats.readingTimeMins} min</span>
        </div>
        <div style={metricCardStyle}>
          <span style={metricLabelStyle}>Avg Word Length</span>
          <span style={metricValStyle}>{stats.avgWordLength} chars</span>
        </div>
      </div>

      {/* ── Two-Column Main Layout ────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── Left Column: Text Input & Controls ─────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header & Quick Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
              Content Editor
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setText(SAMPLE_TEXT);
                  toast.success("Loaded sample SEO article", "Sample Loaded");
                }}
                style={smallBtnStyle}
              >
                Sample Text
              </button>
              <button onClick={handleStripHtml} style={smallBtnStyle}>
                Strip HTML
              </button>
              <button
                onClick={() => {
                  setText("");
                  setHighlightKeyword("");
                  toast.info("Cleared text", "Reset");
                }}
                style={{ ...smallBtnStyle, color: "#ef4444" }}
              >
                <FiTrash2 /> Clear
              </button>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, blog post, or webpage content here to calculate keyword density..."
            rows={14}
            style={{
              width: "100%",
              padding: 16,
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 14,
              color: "#f8fafc",
              fontSize: 14,
              lineHeight: 1.6,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4)",
            }}
          />

          {/* Filters & Preferences Box */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 14,
              border: "1px solid #334155",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
              <FiFilter /> Analysis Filters
            </span>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              {/* Stop Words Checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filterStopWords}
                  onChange={(e) => setFilterStopWords(e.target.checked)}
                  style={{ accentColor: "#2563eb", width: 16, height: 16 }}
                />
                Filter Common Stop Words
              </label>

              {/* Min Word Length Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Min Word Length:</span>
                <select
                  value={minWordLength}
                  onChange={(e) => setMinWordLength(Number(e.target.value))}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 6,
                    color: "#f8fafc",
                    padding: "4px 8px",
                    fontSize: 12,
                    outline: "none",
                  }}
                >
                  <option value={1}>1 char</option>
                  <option value={2}>2 chars</option>
                  <option value={3}>3 chars</option>
                  <option value={4}>4 chars</option>
                  <option value={5}>5 chars</option>
                </select>
              </div>
            </div>

            {/* Keyword In-Text Highlight Feedback */}
            {highlightKeyword && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#fbbf24",
                }}
              >
                <span>
                  Highlighting: <strong>&quot;{highlightKeyword}&quot;</strong>
                </span>
                <button
                  onClick={() => setHighlightKeyword("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fbbf24",
                    cursor: "pointer",
                    fontSize: 11,
                    textDecoration: "underline",
                  }}
                >
                  Clear Highlight
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: N-Gram Tabs & Density Table ──────────────── */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 16,
            border: "1px solid #334155",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* N-Gram Tab Selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              borderBottom: "1px solid #334155",
              paddingBottom: 14,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {([1, 2, 3, 4] as NGramSize[]).map((n) => {
                const isActive = activeTab === n;
                const count = (nGramData[n] || []).length;
                return (
                  <button
                    key={n}
                    onClick={() => {
                      setActiveTab(n);
                      setHighlightKeyword("");
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#ffffff" : "#94a3b8",
                      background: isActive ? "#2563eb" : "#0f172a",
                      border: isActive ? "1px solid #3b82f6" : "1px solid #334155",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {n}-Gram ({count})
                  </button>
                );
              })}
            </div>

            {/* Export buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleCopyCsv} style={actionBtnStyle} title="Copy CSV to clipboard">
                {copiedCsv ? <FiCheck /> : <FiCopy />}
                {copiedCsv ? "Copied" : "CSV"}
              </button>
              <button onClick={handleDownloadCsv} style={actionBtnStyle} title="Download CSV">
                <FiDownload />
              </button>
            </div>
          </div>

          {/* Search within N-Gram results & Sort Controls */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: 160,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "6px 12px",
              }}
            >
              <FiSearch style={{ color: "#64748b" }} />
              <input
                type="text"
                placeholder={`Search ${activeTab}-word phrases...`}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f8fafc",
                  fontSize: 12,
                  width: "100%",
                }}
              />
            </div>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#cbd5e1",
                fontSize: 12,
                padding: "6px 10px",
                outline: "none",
              }}
            >
              <option value="density-desc">Density (Highest First)</option>
              <option value="density-asc">Density (Lowest First)</option>
              <option value="alpha-asc">Alphabetical (A - Z)</option>
              <option value="alpha-desc">Alphabetical (Z - A)</option>
            </select>
          </div>

          {/* Table of Keywords */}
          <div
            style={{
              maxHeight: 460,
              overflowY: "auto",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0f172a",
            }}
          >
            {currentList.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                No {activeTab}-word keywords found matching your filters.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>
                    <th style={thStyle}>#</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Keyword / Phrase</th>
                    <th style={{ ...thStyle, textAlign: "center", width: 70 }}>Count</th>
                    <th style={{ ...thStyle, textAlign: "right", width: 90 }}>Density</th>
                    <th style={{ ...thStyle, textAlign: "center", width: 90 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((item, idx) => {
                    const status = getDensityStatus(item.density);
                    const isSelected = highlightKeyword.toLowerCase() === item.phrase.toLowerCase();
                    return (
                      <tr
                        key={idx}
                        onClick={() => setHighlightKeyword(item.phrase)}
                        style={{
                          borderBottom: "1px solid #1e293b",
                          cursor: "pointer",
                          background: isSelected
                            ? "rgba(59, 130, 246, 0.2)"
                            : idx % 2 === 0
                            ? "transparent"
                            : "rgba(30, 41, 59, 0.4)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td style={{ ...tdStyle, color: "#64748b", fontSize: 11 }}>
                          {idx + 1}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600, color: "#f8fafc" }}>
                          {item.phrase}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center", color: "#38bdf8", fontWeight: 700 }}>
                          {item.count}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#f8fafc" }}>
                          {item.density}%
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                              color: status.color,
                              background: status.bg,
                            }}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Density Recommendation Footer Alert */}
          <div
            style={{
              padding: "12px 16px",
              background: "#0f172a",
              borderRadius: 10,
              border: "1px solid #334155",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            <FiInfo style={{ color: "#38bdf8", flexShrink: 0, fontSize: 16 }} />
            <span>
              <strong>SEO Best Practice:</strong> Keep your primary keyword density between{" "}
              <span style={{ color: "#10b981", fontWeight: 700 }}>1.0% and 2.5%</span>. Frequencies
              above 3.5% risk triggering Google search spam filters.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const metricCardStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "12px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const metricValStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#f8fafc",
};

const smallBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 6,
  padding: "4px 10px",
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
};

const actionBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 6,
  padding: "6px 10px",
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
};
