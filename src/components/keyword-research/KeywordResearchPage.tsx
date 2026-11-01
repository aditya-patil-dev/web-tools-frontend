// src/components/keyword-research/KeywordResearchPage.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import ToolSection from "./ToolSection";
import TestimonialsSection from "./TestimonialsSection";
import CtaSection from "./CtaSection";
import styles from "./keyword-research.module.css";
import { fetchKeywordResearch } from "@/services/keyword.api";
import type { ResearchApiResponse } from "@/types/keyword-research.types";

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [apiResult, setApiResult] = useState<ResearchApiResponse | null>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  const scrollToTool = useCallback(() => {
    toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleAnalyze = useCallback(
    async (
      kw: string,
      options?: {
        region?: string;
        language?: string;
        includeAlphabet?: boolean;
      }
    ) => {
      const cleanKw = kw.trim();
      if (!cleanKw) return;

      setQuery(cleanKw);
      setIsLoading(true);
      scrollToTool();

      try {
        const data = await fetchKeywordResearch({
          query: cleanKw,
          region: options?.region || "us",
          language: options?.language || "en",
          depth: 1,
          include_questions: true,
          include_prepositions: true,
          include_alphabet: options?.includeAlphabet || false,
          export_csv: true,
        });

        setApiResult(data);
        setHasResults(true);
      } catch (err) {
        console.error("[KeywordResearchPage] Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [scrollToTool]
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
          apiResult={apiResult}
          onAnalyze={handleAnalyze}
        />
      </div>
      <TestimonialsSection />
      <CtaSection onAnalyze={handleAnalyze} />
    </div>
  );
}
