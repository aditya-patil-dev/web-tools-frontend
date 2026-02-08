export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastItem = {
    id: string;
    title?: string;
    message: string;
    variant: ToastVariant;
    durationMs?: number;
};
