'use client';

import Link from 'next/link';
import { useLoading } from '@/components/loading/LoadingProvider';
import type { ComponentProps } from 'react';

export default function AppLink({
    href,
    children,
    onClick,
    ...props
}: ComponentProps<typeof Link>) {
    const { show } = useLoading();

    return (
        <Link
            href={href}
            onClick={(e) => {
                show(); // triggers your LoadingOverlay immediately
                onClick?.(e); // preserve any existing onClick
            }}
            {...props}
        >
            {children}
        </Link>
    );
}