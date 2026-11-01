// src/app/(public)/seo/tools/keyword-research/page.tsx
import { Metadata } from "next";
import KeywordResearchPage from "@/components/keyword-research/KeywordResearchPage";

export const metadata: Metadata = {
  title: "Free Keyword Research Tool & Search Intent Analyzer | Fusiontools",
  description:
    "Find hundreds of long-tail keywords, Google search suggestions, question queries, and search intent clusters for free. Boost your SEO rankings today.",
  keywords: [
    "keyword research tool",
    "free keyword tool",
    "google suggest scraper",
    "search intent analyzer",
    "long tail keyword generator",
    "question keywords finder",
    "seo tools",
  ],
  alternates: {
    canonical: "/seo/tools/keyword-research",
  },
  openGraph: {
    title: "Free Keyword Research Tool | Fusiontools",
    description:
      "Instant Google autocomplete queries, search intent classification, and question-based keywords. 100% free with CSV export.",
    type: "website",
  },
};

export default function Page() {
  return <KeywordResearchPage />;
}
