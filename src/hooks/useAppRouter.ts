"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/components/loading/LoadingProvider";

export function useAppRouter() {
  const router = useRouter(); // ← capture the real router first
  const { show } = useLoading();

  // Return plain object — do NOT spread router
  return {
    push: (href: string, options?: Parameters<typeof router.push>[1]) => {
      show();
      router.push(href, options); // calls the captured original, not itself
    },
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
      show();
      router.replace(href, options);
    },
    back: () => {
      show();
      router.back();
    },
    forward: () => router.forward(),
    refresh: () => router.refresh(),
    prefetch: (href: string) => router.prefetch(href),
  };
}
