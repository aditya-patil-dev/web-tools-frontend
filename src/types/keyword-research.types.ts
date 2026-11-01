// src/types/keyword-research.types.ts

export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

export type DifficultyLevel = "easy" | "possible" | "difficult" | "hard";

export type SourceType = "seed" | "depth_1" | "depth_2" | "question" | "preposition" | "alphabet";

export type FilterType =
  | "all"
  | "questions"
  | "prepositions"
  | SearchIntent
  | DifficultyLevel;

export type SortColumn = "keyword" | "word_count" | "char_length" | "search_volume" | "difficulty" | "cpc";

export interface KeywordItem {
  id: string;
  keyword: string;
  word_count: number;
  char_length: number;
  intent: SearchIntent;
  group: string;
  source: SourceType;
  search_volume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competition: number | null;
  competition_level: "LOW" | "MEDIUM" | "HIGH" | null;
}

export interface CountryVolumeBreakdown {
  country: string;
  code: string;
  volume: number;
  percentage: number;
}

export interface KeywordOverview {
  volume: number;
  keyword_difficulty: number;
  difficulty_level: "easy" | "possible" | "difficult" | "hard";
  difficulty_description: string;
  intent: SearchIntent;
  cpc: number;
  competitive_density: number;
  pla_status: string;
  ads_status: string;
  global_volume: {
    total: number;
    breakdown: CountryVolumeBreakdown[];
  };
  trend: number[];
}

export interface KeywordIdeaItem {
  keyword: string;
  volume: number;
  difficulty: number;
  difficulty_level: "easy" | "possible" | "difficult" | "hard";
}

export interface KeywordIdeasSection {
  variations: {
    total_count: number;
    total_volume: number;
    items: KeywordIdeaItem[];
  };
  questions: {
    total_count: number;
    total_volume: number;
    items: KeywordIdeaItem[];
  };
  strategy_tree: {
    pillar: string;
    clusters: {
      name: string;
      color: string;
      keywords: string[];
    }[];
  };
}

export interface SerpOrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  features?: string[];
}

export interface SerpAnalysisResult {
  total_results: number;
  serp_features: string[];
  organic_results: SerpOrganicResult[];
}

export interface ResearchApiResponse {
  query: string;
  language: string;
  region: string;
  total: number;
  metrics_enabled: boolean;
  metrics_provider: string;
  keywords: KeywordItem[];
  grouped: Record<string, KeywordItem[]>;
  intent_summary: Record<string, number>;
  overview: KeywordOverview;
  keyword_ideas: KeywordIdeasSection;
  serp_analysis: SerpAnalysisResult;
  csv?: string;
}
