"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/keyword-research/HeroSection";
import HowItWorks from "@/components/keyword-research/HowItWorks";
import ToolSection from "@/components/keyword-research/ToolSection";
import TestimonialsSection from "@/components/keyword-research/TestimonialsSection";
import CtaSection from "@/components/keyword-research/CtaSection";
import styles from "./keyword-research.module.css";
import type { KeywordResult, FilterType, SortColumn } from "@/app/(public)/keyword-research/types";
import { generateKeywords } from "@/app/(public)/keyword-research/utils";

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allKeywords, setAllKeywords] = useState<KeywordResult[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortCol, setSortCol] = useState<SortColumn>("volume");
  const [sortAsc, setSortAsc] = useState(false);
  const toolRef = useRef<HTMLDivElement>(null);

  const scrollToTool = useCallback(() => {
    toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleAnalyze = useCallback(
    async (kw: string) => {
      if (!kw.trim()) return;
      setQuery(kw.trim());
      setIsLoading(true);
      setHasResults(false);
      setActiveFilter("all");
      scrollToTool();

      await new Promise((r) => setTimeout(r, 1800 + Math.random() * 500));

      const results = generateKeywords(kw.trim());
      setAllKeywords(results);
      setIsLoading(false);
      setHasResults(true);
    },
    [scrollToTool]
  );

  const handleSort = useCallback(
    (col: SortColumn) => {
      if (sortCol === col) setSortAsc((p) => !p);
      else { setSortCol(col); setSortAsc(false); }
    },
    [sortCol]
  );

  return (
    <div className={styles.page}>
      <HeroSection onAnalyze={handleAnalyze} scrollToTool={scrollToTool} />
      <HowItWorks />
      <div ref={toolRef}>
        <ToolSection
          query={query}
          isLoading={isLoading}
          hasResults={hasResults}
          allKeywords={allKeywords}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortCol={sortCol}
          sortAsc={sortAsc}
          onSort={handleSort}
          onAnalyze={handleAnalyze}
        />
      </div>
      <TestimonialsSection />
      <CtaSection onAnalyze={handleAnalyze} />
    </div>
  );
}
