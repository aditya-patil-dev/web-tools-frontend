'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from './LoadingProvider';

function NavigationLoaderInner() {
    const { show, hide } = useLoading();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRender = useRef(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // Route changed = navigation complete
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        hide();
    }, [pathname, searchParams]);

    // Safety fallback — auto-hide after 8s in case navigation silently fails
    const showWithFallback = (opts?: Parameters<typeof show>[0]) => {
        show(opts);
        timeoutRef.current = setTimeout(() => hide(), 8000);
    };

    return null;
}

export default function NavigationLoader() {
    return (
        <Suspense fallback={null}>
            <NavigationLoaderInner />
        </Suspense>
    );
}