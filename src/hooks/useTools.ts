import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toolsApi } from "@/services/tools.api";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";
import type {
    Tool,
    ToolListParams,
    CompleteToolData,
    CategoryWithStats,
    BulkUpdatePayload,
    BulkDeletePayload,
} from "@/types/tool.types";

// ==================== Use Tools List ====================

interface UseToolsListReturn {
    tools: Tool[];
    isLoading: boolean;
    error: Error | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    } | null;
    refetch: () => Promise<void>;
    setParams: (params: Partial<ToolListParams>) => void;
}

export function useToolsList(initialParams?: ToolListParams): UseToolsListReturn {
    const [tools, setTools] = useState<Tool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [pagination, setPagination] = useState<UseToolsListReturn["pagination"]>(null);
    const [params, setParamsState] = useState<ToolListParams>(
        initialParams || { page: 1, limit: 20 }
    );

    const fetchTools = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await toolsApi.getTools(params);
            setTools(response.data);
            setPagination(response.meta);
        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error(`Failed to fetch tools: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchTools();
    }, [fetchTools]);

    const setParams = useCallback((newParams: Partial<ToolListParams>) => {
        setParamsState((prev) => ({ ...prev, ...newParams }));
    }, []);

    return {
        tools,
        isLoading,
        error,
        pagination,
        refetch: fetchTools,
        setParams,
    };
}

// ==================== Use Tool Detail ====================

interface UseToolDetailReturn {
    toolData: CompleteToolData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useToolDetail(id: number | null): UseToolDetailReturn {
    const [toolData, setToolData] = useState<CompleteToolData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchTool = useCallback(async () => {
        if (!id) {
            setToolData(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await toolsApi.getToolById(id);
            setToolData(response.data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error(`Failed to fetch tool: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTool();
    }, [fetchTool]);

    return {
        toolData,
        isLoading,
        error,
        refetch: fetchTool,
    };
}

// ==================== Use Tool Mutations ====================

interface UseToolMutationsReturn {
    createTool: (data: CompleteToolData) => Promise<boolean>;
    updateTool: (id: number, data: Partial<CompleteToolData>) => Promise<boolean>;
    deleteTool: (id: number, permanent?: boolean) => Promise<boolean>;
    duplicateTool: (id: number, newSlug: string, newTitle?: string) => Promise<boolean>;
    restoreTool: (id: number) => Promise<boolean>;
    isSubmitting: boolean;
}

export function useToolMutations(): UseToolMutationsReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const createTool = async (data: CompleteToolData): Promise<boolean> => {
        setIsSubmitting(true);
        loading.show({ message: "Creating tool..." });

        try {
            const response = await toolsApi.createTool(data);
            toast.success(response.message || "Tool created successfully!");
            router.push("/admin/tools");
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to create tool: ${error.message}`);
            return false;
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    const updateTool = async (
        id: number,
        data: Partial<CompleteToolData>
    ): Promise<boolean> => {
        setIsSubmitting(true);
        loading.show({ message: "Updating tool..." });

        try {
            const response = await toolsApi.updateTool(id, data);
            toast.success(response.message || "Tool updated successfully!");
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to update tool: ${error.message}`);
            return false;
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    const deleteTool = async (id: number, permanent = false): Promise<boolean> => {
        setIsSubmitting(true);
        loading.show({ message: permanent ? "Permanently deleting tool..." : "Deleting tool..." });

        try {
            const response = permanent
                ? await toolsApi.permanentDeleteTool(id)
                : await toolsApi.deleteTool(id);
            toast.success(response.message || "Tool deleted successfully!");
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to delete tool: ${error.message}`);
            return false;
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    const duplicateTool = async (
        id: number,
        newSlug: string,
        newTitle?: string
    ): Promise<boolean> => {
        setIsSubmitting(true);
        loading.show({ message: "Duplicating tool..." });

        try {
            const response = await toolsApi.duplicateTool(id, { new_slug: newSlug, new_title: newTitle });
            toast.success(response.message || "Tool duplicated successfully!");
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to duplicate tool: ${error.message}`);
            return false;
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    const restoreTool = async (id: number): Promise<boolean> => {
        setIsSubmitting(true);
        loading.show({ message: "Restoring tool..." });

        try {
            const response = await toolsApi.restoreTool(id);
            toast.success(response.message || "Tool restored successfully!");
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to restore tool: ${error.message}`);
            return false;
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    return {
        createTool,
        updateTool,
        deleteTool,
        duplicateTool,
        restoreTool,
        isSubmitting,
    };
}

// ==================== Use Bulk Operations ====================

interface UseBulkOperationsReturn {
    bulkUpdate: (payload: BulkUpdatePayload) => Promise<boolean>;
    bulkDelete: (payload: BulkDeletePayload) => Promise<boolean>;
    isProcessing: boolean;
}

export function useBulkOperations(): UseBulkOperationsReturn {
    const [isProcessing, setIsProcessing] = useState(false);

    const bulkUpdate = async (payload: BulkUpdatePayload): Promise<boolean> => {
        setIsProcessing(true);
        loading.show({ message: `Updating ${payload.ids.length} tools...` });

        try {
            const response = await toolsApi.bulkUpdate(payload);
            toast.success(
                response.message || `${response.data.updated_count} tools updated successfully!`
            );
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to update tools: ${error.message}`);
            return false;
        } finally {
            setIsProcessing(false);
            loading.hide();
        }
    };

    const bulkDelete = async (payload: BulkDeletePayload): Promise<boolean> => {
        setIsProcessing(true);
        loading.show({
            message: payload.permanent
                ? `Permanently deleting ${payload.ids.length} tools...`
                : `Deleting ${payload.ids.length} tools...`,
        });

        try {
            const response = await toolsApi.bulkDelete(payload);
            toast.success(
                response.message || `${response.data.deleted_count} tools deleted successfully!`
            );
            return true;
        } catch (err) {
            const error = err as Error;
            toast.error(`Failed to delete tools: ${error.message}`);
            return false;
        } finally {
            setIsProcessing(false);
            loading.hide();
        }
    };

    return {
        bulkUpdate,
        bulkDelete,
        isProcessing,
    };
}

// ==================== Use Categories ====================

interface UseCategoriesReturn {
    categories: CategoryWithStats[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
    const [categories, setCategories] = useState<CategoryWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await toolsApi.getCategories();
            setCategories(response.data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error(`Failed to fetch categories: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refetch: fetchCategories,
    };
}

// ==================== Use Slug Checker ====================

interface UseSlugCheckerReturn {
    checkSlug: (slug: string) => Promise<boolean>;
    isChecking: boolean;
}

export function useSlugChecker(): UseSlugCheckerReturn {
    const [isChecking, setIsChecking] = useState(false);

    const checkSlug = async (slug: string): Promise<boolean> => {
        if (!slug) return false;

        setIsChecking(true);
        try {
            const response = await toolsApi.checkSlugAvailability(slug);
            return response.data.available;
        } catch (err) {
            toast.error("Failed to check slug availability");
            return false;
        } finally {
            setIsChecking(false);
        }
    };

    return {
        checkSlug,
        isChecking,
    };
}