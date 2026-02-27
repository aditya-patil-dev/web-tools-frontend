"use client";

import { useState, useEffect, useRef, JSX, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./PolicyPages.module.css";
import type { IconKey } from "./types";
import type { LegalPageData, LegalPageListItem } from "@/lib/api-calls/legalPagesApi";

// ─── Icon Map ────────────────────────────────────────────────────────────────
const icons: Record<IconKey, JSX.Element> = {
    shield: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
    scroll: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>),
    cookie: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="8" cy="9" r="1" fill="currentColor" /><circle cx="14" cy="14" r="1" fill="currentColor" /><circle cx="10" cy="15" r="1" fill="currentColor" /></svg>),
    refund: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" /></svg>),
    mail: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>),
    headset: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>),
    briefcase: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M2 12h20" /></svg>),
    scale: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-7M12 2v3M3 7l9 2 9-2M6 17H3l3-9M18 17h3l-3-9M12 5l-3 9M12 5l3 9" /></svg>),
    chevron: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>),
    menu: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>),
    close: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
    phone: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>),
    location: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>),
    clock: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>),
};

// ─── Slug → Icon mapping ──────────────────────────────────────────────────────
const SLUG_ICON_MAP: Record<string, IconKey> = {
    "privacy-policy": "shield",
    "terms-and-conditions": "scroll",
    "cookie-policy": "cookie",
    "refund-policy": "refund",
    "contact": "mail",
};

function getIconForSlug(slug: string): IconKey {
    return SLUG_ICON_MAP[slug] ?? "briefcase";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cx(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// ─── HTML Content ─────────────────────────────────────────────────────────────
function HtmlContentView({ html }: { html: string }): JSX.Element {
    return (
        <div
            className={styles.htmlContent}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonLoader(): JSX.Element {
    return (
        <div className={styles.skeletonLoader} aria-label="Loading content">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonBlock} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={styles.skeletonHeading} />
                    <div className={styles.skeletonText} />
                    <div className={cx(styles.skeletonText, styles.short)} />
                </div>
            ))}
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PolicyPagesProps {
    activePage: LegalPageData;
    allPages: LegalPageListItem[];
    currentSlug: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PolicyPages({
    activePage,
    allPages,
    currentSlug,
}: PolicyPagesProps): JSX.Element {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const contentRef = useRef<HTMLElement>(null);

    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentSlug]);

    const handlePageChange = (slug: string): void => {
        if (slug === currentSlug) return;
        setSidebarOpen(false);
        startTransition(() => {
            router.push(`/pages/${slug}`);
        });
    };

    const icon = getIconForSlug(currentSlug);

    return (
        <div className={styles.policyRoot}>
            {sidebarOpen && (
                <div
                    className={styles.mobileOverlay}
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={cx(styles.policySidebar, sidebarOpen && styles.open)} aria-label="Policy navigation">
                <div className={styles.sidebarHeader}>
                    <span className={styles.sidebarTitle}>Legal & Support</span>
                    <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                        {icons.close}
                    </button>
                </div>

                <nav className={styles.sidebarNav} aria-label="Policy pages">
                    {allPages.map((page) => (
                        <button
                            key={page.slug}
                            className={cx(styles.sidebarItem, currentSlug === page.slug && styles.active)}
                            onClick={() => handlePageChange(page.slug)}
                            aria-current={currentSlug === page.slug ? "page" : undefined}
                        >
                            <span className={styles.sidebarIcon} aria-hidden="true">
                                {icons[getIconForSlug(page.slug)]}
                            </span>
                            <span className={styles.sidebarLabel}>{page.title}</span>
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <p>Need help?</p>
                    <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.policyMain} ref={contentRef}>
                <div className={styles.mobileTopbar}>
                    <button className={styles.mobileMenuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
                        {icons.menu}
                    </button>
                    <span>{activePage.title}</span>
                </div>

                <header className={styles.policyHeader}>
                    <div className={styles.headerIcon} aria-hidden="true">{icons[icon]}</div>
                    <div className={styles.headerMeta}>
                        <span className={styles.metaChip}>Last updated: {formatDate(activePage.updated_at)}</span>
                    </div>
                    <h1>{activePage.title}</h1>
                    {activePage.meta_description && (
                        <p className={styles.headerSubtitle}>{activePage.meta_description}</p>
                    )}
                </header>

                <div className={cx(styles.policyContent, isPending && styles.loading)}>
                    {isPending ? <SkeletonLoader /> : <HtmlContentView html={activePage.content} />}
                </div>
            </main>
        </div>
    );
}