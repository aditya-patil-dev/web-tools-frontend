import { useState, useEffect, useCallback } from "react";
import { toolPagesApi } from "@/services/tool-pages.service";
import { toast } from "@/components/toast/toast";
import type {
  ToolPageWithTool,
  ToolPageListParams,
} from "@/types/tool-page.types";

// ==================== Use Tool Pages List ====================

interface UseToolPagesListReturn {
  toolPages: ToolPageWithTool[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null;
  refetch: () => Promise<void>;
  setParams: (params: Partial<ToolPageListParams>) => void;
}

export function useToolPagesList(
  params: ToolPageListParams = { page: 1, limit: 20 },
): UseToolPagesListReturn {
  const [toolPages, setToolPages] = useState<ToolPageWithTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] =
    useState<UseToolPagesListReturn["pagination"]>(null);

  const fetchToolPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await toolPagesApi.list(params);
      setToolPages(response.data);
      setPagination(response.meta || null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch tool pages: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]); // ← stable dep, avoids infinite loop

  useEffect(() => {
    fetchToolPages();
  }, [fetchToolPages]);

  return {
    toolPages,
    isLoading,
    error,
    pagination,
    refetch: fetchToolPages,
    setParams: () => {}, // kept for interface compatibility, no longer needed
  };
}

// ==================== Use Tool Page Detail ====================

interface UseToolPageDetailReturn {
  toolPage: ToolPageWithTool | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useToolPageDetail(
  slug: string | null,
): UseToolPageDetailReturn {
  const [toolPage, setToolPage] = useState<ToolPageWithTool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchToolPage = useCallback(async () => {
    if (!slug) {
      setToolPage(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await toolPagesApi.getBySlug(slug);
      setToolPage(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch tool page: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchToolPage();
  }, [fetchToolPage]);

  return {
    toolPage,
    isLoading,
    error,
    refetch: fetchToolPage,
  };
}
