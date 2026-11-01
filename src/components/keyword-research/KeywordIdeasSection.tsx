// src/components/keyword-research/KeywordIdeasSection.tsx
"use client";

import { ChevronRight, Search, Layers, HelpCircle, Network } from "lucide-react";
import styles from "./KeywordIdeasSection.module.css";
import InfoTooltip from "./InfoTooltip";
import type { KeywordIdeasSection as KeywordIdeasType } from "@/types/keyword-research.types";

interface Props {
  data: KeywordIdeasType;
  onSelectKeyword: (kw: string) => void;
  onViewAllVariations: () => void;
  onViewAllQuestions: () => void;
  onViewAllClusters?: () => void;
  onFilterKeyword?: (kw: string) => void;
}

export default function KeywordIdeasSection({
  data,
  onSelectKeyword,
  onViewAllVariations,
  onViewAllQuestions,
  onViewAllClusters,
  onFilterKeyword,
}: Props) {
  const { variations, questions, strategy_tree } = data;

  const getKdDotColor = (kd: number) => {
    if (kd < 35) return "#10b981"; // green
    if (kd < 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const formatVol = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toString();
  };

  const handleKeywordClick = (kw: string) => {
    if (onFilterKeyword) {
      onFilterKeyword(kw);
    } else {
      onSelectKeyword(kw);
    }
  };

  return (
    <div className={styles.container} id="ideas-section">
      <h3 className={styles.mainHeader}>
        <span>Keyword ideas</span>
        <InfoTooltip content="Discovered search suggestions grouped into keyword variations, question queries, and automated topic cluster hierarchy." />
      </h3>

      <div className={styles.ideasGrid}>
        {/* ── COLUMN 1: Keyword Variations ── */}
        <div className={styles.box}>
          <div>
            <div className={styles.boxTitle}>
              <Layers size={15} color="#2563eb" />
              <span>Keyword Variations</span>
              <InfoTooltip content="Search queries containing your exact seed keyword plus long-tail modifiers, suffixes, and synonyms." />
            </div>

            <div className={styles.countRow}>
              <span className={styles.bigCount}>{variations.total_count}</span>
              <span className={styles.totalVolText}>
                Total Volume: {formatVol(variations.total_volume)}
              </span>
            </div>

            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Keywords</th>
                  <th style={{ textAlign: "right", paddingRight: "0.75rem" }}>
                    Volume
                  </th>
                  <th style={{ textAlign: "right" }}>KD %</th>
                </tr>
              </thead>
              <tbody>
                {variations.items.slice(0, 5).map((item) => (
                  <tr key={item.keyword}>
                    <td>
                      <div className={styles.kwCellFlex}>
                        <span
                          className={styles.kwLink}
                          onClick={() => handleKeywordClick(item.keyword)}
                          title={`Click to view in table: ${item.keyword}`}
                        >
                          {item.keyword}
                        </span>
                        <button
                          type="button"
                          className={styles.quickActionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectKeyword(item.keyword);
                          }}
                          title={`Analyze "${item.keyword}"`}
                        >
                          <Search size={11} />
                        </button>
                      </div>
                    </td>
                    <td className={styles.volCol}>{item.volume}</td>
                    <td className={styles.kdCol}>
                      <span>{item.difficulty}</span>
                      <span
                        className={styles.kdDot}
                        style={{ background: getKdDotColor(item.difficulty) }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={onViewAllVariations}
            title="View all keyword variations in table"
          >
            <span>View all {variations.total_count} keywords</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ── COLUMN 2: Questions ── */}
        <div className={styles.box}>
          <div>
            <div className={styles.boxTitle}>
              <HelpCircle size={15} color="#7c3aed" />
              <span>Questions</span>
              <InfoTooltip content="Questions (Who, What, Where, When, Why, How, Can) typed by real Google searchers. Perfect for FAQ sections and blog content." />
            </div>

            <div className={styles.countRow}>
              <span className={styles.bigCount} style={{ color: "#7c3aed" }}>
                {questions.total_count}
              </span>
              <span className={styles.totalVolText}>
                Total Volume: {formatVol(questions.total_volume)}
              </span>
            </div>

            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Questions</th>
                  <th style={{ textAlign: "right", paddingRight: "0.75rem" }}>
                    Volume
                  </th>
                  <th style={{ textAlign: "right" }}>KD %</th>
                </tr>
              </thead>
              <tbody>
                {questions.items.slice(0, 5).map((item) => (
                  <tr key={item.keyword}>
                    <td>
                      <div className={styles.kwCellFlex}>
                        <span
                          className={styles.kwLink}
                          onClick={() => handleKeywordClick(item.keyword)}
                          title={`Click to view in table: ${item.keyword}`}
                        >
                          {item.keyword}
                        </span>
                        <button
                          type="button"
                          className={styles.quickActionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectKeyword(item.keyword);
                          }}
                          title={`Analyze "${item.keyword}"`}
                        >
                          <Search size={11} />
                        </button>
                      </div>
                    </td>
                    <td className={styles.volCol}>{item.volume}</td>
                    <td className={styles.kdCol}>
                      <span>{item.difficulty}</span>
                      <span
                        className={styles.kdDot}
                        style={{ background: getKdDotColor(item.difficulty) }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={onViewAllQuestions}
            title="View all question queries in table"
          >
            <span>View all {questions.total_count} questions</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ── COLUMN 3: Keyword Strategy / Topic Clusters ── */}
        <div className={styles.box}>
          <div>
            <div className={styles.boxTitle}>
              <Network size={15} color="#059669" />
              <span>Keyword Strategy</span>
              <InfoTooltip content="A topic cluster blueprint grouping your seed pillar into relevant subpages to establish comprehensive topical authority in Google." />
            </div>

            <div className={styles.strategyDesc}>
              Get topics, pillar and subpages <strong>automatically</strong>
            </div>

            <div className={styles.treeWrap}>
              {/* Central Pillar Root */}
              <div className={styles.pillarRoot}>
                <span className={styles.pillarDot} />
                <span>{strategy_tree.pillar}</span>
              </div>

              {/* Branching Subpages */}
              <div className={styles.treeBranches}>
                {strategy_tree.clusters.flatMap((cl) =>
                  cl.keywords.slice(0, 3).map((kw) => (
                    <div
                      key={kw}
                      className={styles.treeBranchItem}
                      onClick={() => handleKeywordClick(kw)}
                      title={`Click to view "${kw}" in table`}
                    >
                      <div
                        className={styles.branchBar}
                        style={{ background: cl.color }}
                      />
                      <span className={styles.branchText}>{kw}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={onViewAllClusters || onViewAllVariations}
            title="View all topic clusters"
          >
            <span>View all clusters</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
