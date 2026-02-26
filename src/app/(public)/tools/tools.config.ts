import { api } from "@/lib/api/api";
import { toNumber } from "@/lib/api/apiHelpers";

export type ToolItem = {
  id: string;
  title: string;
  short_description: string;
  slug: string;
  category_slug: string;
  badge?: "new" | "popular" | "pro";
  tags: string[];
  views: number;
  users_count: number;
  rating: number;
  tool_url: string;
};

export type CategoryPage = {
  page_title: string;
  page_description: string;
  page_intro?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  noindex?: boolean;
};

export async function fetchToolsByCategory(category: string): Promise<{
  category: CategoryPage | null;
  tools: ToolItem[];
}> {
  const res = await api.get<{
    success: boolean;
    message: string;
    data: { category: CategoryPage | null; tools: ToolItem[] };
  }>(`/tools?category=${category}`);

  return {
    category: res.data.category ?? null,
    tools: (res.data.tools || []).map((tool: ToolItem) => ({
      ...tool,
      users_count: toNumber(tool.users_count),
      views: toNumber(tool.views),
      rating: toNumber(tool.rating),
    })),
  };
}
