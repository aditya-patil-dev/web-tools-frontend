// src/services/keyword.api.ts
import { api } from "@/lib/api/api";
import { ResearchApiResponse } from "@/types/keyword-research.types";

export interface KeywordResearchParams {
  query: string;
  language?: string;
  region?: string;
  depth?: 1 | 2;
  include_questions?: boolean;
  include_prepositions?: boolean;
  include_alphabet?: boolean;
  export_csv?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function fetchKeywordResearch(
  params: KeywordResearchParams
): Promise<ResearchApiResponse> {
  const payload = {
    query: params.query.trim(),
    language: params.language || "en",
    region: params.region || "us",
    depth: params.depth || 1,
    include_questions: params.include_questions ?? true,
    include_prepositions: params.include_prepositions ?? true,
    include_alphabet: params.include_alphabet ?? false,
    export_csv: params.export_csv ?? false,
  };

  const response = await api.post<ApiResponse<ResearchApiResponse>>(
    "/keyword/research",
    payload
  );

  return (response as any)?.data || response;
}
