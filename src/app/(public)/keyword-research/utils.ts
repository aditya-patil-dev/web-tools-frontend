import type { KeywordResult, SearchIntent, MetricsSummary } from "./types";

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const intents: SearchIntent[] = ["informational", "commercial", "transactional", "navigational"];

const MODIFIERS = [
  "best", "top", "cheap", "affordable", "professional", "free", "online",
  "how to", "what is", "vs", "alternative", "review", "guide", "tips",
  "for beginners", "near me", "2025", "easy", "advanced", "tools",
  "software", "services", "tutorial", "examples",
];

function makeKeyword(kw: string, vol: number, diff: number, cpc: number, intent: SearchIntent): KeywordResult {
  return {
    id: Math.random().toString(36).slice(2),
    keyword: kw,
    volume: Math.round(vol),
    difficulty: Math.round(diff),
    cpc: parseFloat(cpc.toFixed(2)),
    intent,
    trend: Array.from({ length: 12 }, () => Math.random()),
  };
}

function resolveIntent(mod: string): SearchIntent {
  if (/^(how|what|guide|tips|tutorial|for beginners|examples)/.test(mod)) return "informational";
  if (/^(best|top|review|vs|alternative)/.test(mod)) return "commercial";
  if (/^(cheap|affordable|near me|buy)/.test(mod)) return "transactional";
  return pick(intents);
}

export function generateKeywords(seed: string): KeywordResult[] {
  const results: KeywordResult[] = [];

  // Seed keyword itself
  results.push(makeKeyword(seed, rnd(5_000, 200_000), rnd(20, 85), rnd(0.5, 18), pick(intents)));

  // Modifier variations
  MODIFIERS.forEach((mod) => {
    const kw = Math.random() > 0.5 ? `${mod} ${seed}` : `${seed} ${mod}`;
    results.push(makeKeyword(kw, rnd(100, 150_000), rnd(5, 92), rnd(0.05, 22), resolveIntent(mod)));
  });

  // Question keywords
  ["how to use", "what is the best", "where to buy", "why use", "when to get"].forEach((q) => {
    results.push(makeKeyword(`${q} ${seed}`, rnd(200, 50_000), rnd(5, 55), rnd(0.1, 8), "informational"));
  });

  return results;
}

export function getDifficultyLevel(d: number): "easy" | "medium" | "hard" {
  return d < 35 ? "easy" : d < 65 ? "medium" : "hard";
}

export function computeMetrics(kws: KeywordResult[]): MetricsSummary {
  if (!kws.length) return { totalVolume: 0, avgDifficulty: 0, avgCpc: 0, easyCount: 0 };
  return {
    totalVolume: kws.reduce((a, k) => a + k.volume, 0),
    avgDifficulty: Math.round(kws.reduce((a, k) => a + k.difficulty, 0) / kws.length),
    avgCpc: parseFloat((kws.reduce((a, k) => a + k.cpc, 0) / kws.length).toFixed(2)),
    easyCount: kws.filter((k) => getDifficultyLevel(k.difficulty) === "easy").length,
  };
}

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function exportToCSV(kws: KeywordResult[], query: string) {
  const header = ["Keyword", "Search Volume", "Difficulty", "CPC (USD)", "Intent"];
  const rows = kws.map((k) => [k.keyword, k.volume, k.difficulty, k.cpc, k.intent]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `keywords-${query.replace(/\s+/g, "-")}.csv`;
  a.click();
}

export function getRelatedSuggestions(query: string): string[] {
  return [
    `${query} tutorial`,
    `${query} examples`,
    `best ${query}`,
    `${query} for beginners`,
    `${query} vs`,
    `${query} pricing`,
    `${query} free`,
    `how to ${query}`,
    `${query} tips`,
    `${query} 2025`,
    `top ${query}`,
    `${query} software`,
  ];
}
