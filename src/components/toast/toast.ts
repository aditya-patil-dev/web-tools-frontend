import type { ToastVariant } from "./toast.types";

/**
 * This module is a lightweight bridge so you can call toast.success("...") anywhere.
 * It gets wired when ToastProvider mounts.
 */
type PushFn = (input: { message: string; title?: string; variant?: ToastVariant; durationMs?: number }) => string;

let _push: PushFn | null = null;

export function bindToast(pushFn: PushFn) {
    _push = pushFn;
}

function fire(variant: ToastVariant, message: string, title?: string, durationMs?: number) {
    if (!_push) {
        // no provider mounted yet; fail silently (or console.warn if you prefer)
        return "";
    }
    return _push({ variant, message, title, durationMs });
}

export const toast = {
    success: (message: string, title?: string, durationMs?: number) => fire("success", message, title, durationMs),
    error: (message: string, title?: string, durationMs?: number) => fire("error", message, title, durationMs),
    info: (message: string, title?: string, durationMs?: number) => fire("info", message, title, durationMs),
    warning: (message: string, title?: string, durationMs?: number) => fire("warning", message, title, durationMs),
};
