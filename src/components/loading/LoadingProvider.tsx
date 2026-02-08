"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import type { LoadingOptions } from "./loading.types";
import { bindLoading } from "./loading";

type LoadingContextValue = {
    show: (options?: LoadingOptions) => void;
    hide: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<LoadingOptions | null>(null);

    const show = useCallback((opts?: LoadingOptions) => {
        setOptions(opts ?? null);
        setVisible(true);
    }, []);

    const hide = useCallback(() => {
        setVisible(false);
        setOptions(null);
    }, []);

    const value = useMemo(() => ({ show, hide }), [show, hide]);

    // bind global helper so you can call loading.show() anywhere
    useMemo(() => {
        bindLoading({ show, hide });
    }, [show, hide]);

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {visible && <LoadingOverlay message={options?.message} />}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
    return ctx;
}
