export interface ToolFeedbackItem {
  id: number;
  tool_slug: string;
  tool_id: number | null;
  tool_title?: string;
  category_slug?: string;
  rating: "like" | "dislike";
  reason: string | null;
  session_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ToolFeedbackStats {
  total: number;
  likes: number;
  dislikes: number;
  with_comments: number;
  satisfaction_rate: number;
  top_liked: Array<{ tool_slug: string; count: string | number }>;
  top_disliked: Array<{ tool_slug: string; count: string | number }>;
}

export interface FeedbackListParams {
  page?: number;
  limit?: number;
  search?: string;
  tool_slug?: string;
  rating?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  message: string;
  data: ToolFeedbackItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FeedbackStatsResponse {
  success: boolean;
  message: string;
  data: ToolFeedbackStats;
}
