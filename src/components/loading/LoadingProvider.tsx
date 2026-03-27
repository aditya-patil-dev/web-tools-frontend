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
  const [finishing, setFinishing] = useState(false);
  const [options, setOptions] = useState<LoadingOptions | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((opts?: LoadingOptions) => {
    // Cancel any in-flight finish animation
    if (finishTimer.current) clearTimeout(finishTimer.current);
    setFinishing(false);
    setOptions(opts ?? null);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    // Trigger finish: shoot bar to 100%, then fade out
    setFinishing(true);
    finishTimer.current = setTimeout(() => {
      setVisible(false);
      setFinishing(false);
      setOptions(null);
    }, 400); // matches CSS transition duration
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  useEffect(() => {
    bindLoading({ show, hide });
  }, [show, hide]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {(visible || finishing) && (
        <LoadingOverlay message={options?.message} finishing={finishing} />
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
  return ctx;
}
