"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ToastItem } from "./toast.types";

export default function ToastViewport({
    toasts,
    onDismiss,
}: {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}) {
    return (
        <div className="toastViewport" aria-live="polite" aria-relevant="additions">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        className={`toastCard toast-${t.variant}`}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                    >
                        <div className="toastIcon" aria-hidden="true">
                            {t.variant === "success" && <i className="bi bi-check-circle-fill" />}
                            {t.variant === "error" && <i className="bi bi-x-circle-fill" />}
                            {t.variant === "info" && <i className="bi bi-info-circle-fill" />}
                            {t.variant === "warning" && <i className="bi bi-exclamation-triangle-fill" />}
                        </div>

                        <div className="toastBody">
                            {t.title && <div className="toastTitle">{t.title}</div>}
                            <div className="toastMsg">{t.message}</div>
                        </div>

                        <button className="toastClose" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
                            <i className="bi bi-x-lg" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
