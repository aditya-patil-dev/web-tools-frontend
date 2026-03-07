export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type FilterType = "all" | SearchIntent | DifficultyLevel;
export type SortColumn = "keyword" | "volume" | "difficulty" | "cpc";

export interface KeywordResult {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intent: SearchIntent;
  trend: number[]; // 12 months, 0-1 normalised
}

export interface MetricsSummary {
  totalVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  easyCount: number;
}
