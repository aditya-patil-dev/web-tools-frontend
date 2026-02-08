"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ToastItem, ToastVariant } from "./toast.types";
import ToastViewport from "./ToastViewport";
import { bindToast } from "./toast";

type ToastInput = {
    title?: string;
    message: string;
    variant?: ToastVariant;
    durationMs?: number;
};

type ToastContextValue = {
    push: (input: ToastInput) => string;
    dismiss: (id: string) => void;
    clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timersRef = useRef<Record<string, number>>({});

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const t = timersRef.current[id];
        if (t) {
            window.clearTimeout(t);
            delete timersRef.current[id];
        }
    }, []);

    const clear = useCallback(() => {
        setToasts([]);
        Object.values(timersRef.current).forEach((t) => window.clearTimeout(t));
        timersRef.current = {};
    }, []);

    const push = useCallback(
        (input: ToastInput) => {
            const id = makeId();

            const toast: ToastItem = {
                id,
                title: input.title,
                message: input.message,
                variant: input.variant ?? "info",
                durationMs: input.durationMs ?? 3500,
            };

            setToasts((prev) => {
                const next = [toast, ...prev];
                return next.slice(0, 4); // max visible toasts
            });

            if (toast.durationMs && toast.durationMs > 0) {
                timersRef.current[id] = window.setTimeout(
                    () => dismiss(id),
                    toast.durationMs
                );
            }

            return id;
        },
        [dismiss]
    );

    useEffect(() => {
        bindToast(push);
    }, [push]);

    const value = useMemo(
        () => ({ push, dismiss, clear }),
        [push, dismiss, clear]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return ctx;
}
