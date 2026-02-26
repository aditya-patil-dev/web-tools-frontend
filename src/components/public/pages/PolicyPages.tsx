"use client";

import { useState, useEffect, useRef, JSX } from "react";
import styles from "./PolicyPages.module.css";
import { POLICY_PAGES, POLICY_CONTENT } from "./policyData";
import type {
    IconKey,
    PolicyContent,
    PolicySection,
    ContactChannel,
    FormState,
} from "./types";

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

// ─── Helper ──────────────────────────────────────────────────────────────────
function cx(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

// ─── Hook: Scroll-Spy ────────────────────────────────────────────────────────
function useActiveSection(sections: PolicySection[] = []): [string, (id: string) => void] {
    const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

    useEffect(() => {
        if (!sections.length) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
            { rootMargin: "-20% 0px -70% 0px" }
        );
        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [sections]);

    return [activeId, setActiveId];
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
function ContactPage({ data }: { data: PolicyContent }): JSX.Element {
    const [formState, setFormState] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // TODO: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formState) });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormState({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.contactChannels}>
                {data.channels?.map((ch: ContactChannel) => (
                    <a key={ch.id} href={`mailto:${ch.contact}`} className={styles.channelCard}>
                        <span className={styles.channelIcon}>{icons[ch.icon]}</span>
                        <div className={styles.channelBody}>
                            <strong>{ch.title}</strong>
                            <p>{ch.description}</p>
                            <span className={styles.channelEmail}>{ch.contact}</span>
                        </div>
                        <span className={styles.channelArrow}>{icons.chevron}</span>
                    </a>
                ))}
            </div>

            <div className={styles.contactSplit}>
                <div className={styles.contactInfoBlock}>
                    <h3 className={styles.infoHeading}>Get in Touch</h3>
                    <div className={styles.infoItem}>
                        <span>{icons.phone}</span>
                        <div><strong>Phone</strong><p>{data.contactInfo?.phone}</p></div>
                    </div>
                    <div className={styles.infoItem}>
                        <span>{icons.clock}</span>
                        <div><strong>Business Hours</strong><p>{data.contactInfo?.hours}</p></div>
                    </div>
                    <div className={styles.infoItem}>
                        <span>{icons.location}</span>
                        <div><strong>Office Address</strong><p style={{ whiteSpace: "pre-line" }}>{data.contactInfo?.address}</p></div>
                    </div>
                </div>

                <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <h3 className={styles.infoHeading}>Send a Message</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="cf-name">Full Name</label>
                            <input id="cf-name" type="text" placeholder="John Doe" value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="cf-email">Email Address</label>
                            <input id="cf-email" type="email" placeholder="you@example.com" value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })} required />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="cf-subject">Subject</label>
                        <input id="cf-subject" type="text" placeholder="How can we help?" value={formState.subject}
                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="cf-message">Message</label>
                        <textarea id="cf-message" rows={5} placeholder="Tell us more..." value={formState.message}
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })} required />
                    </div>
                    <button type="submit" className={cx(styles.submitBtn, submitted && styles.success)}>
                        {submitted ? "✓ Message Sent!" : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Policy Content View ──────────────────────────────────────────────────────
function PolicyContentView({ data }: { data: PolicyContent }): JSX.Element {
    const [activeSection, setActiveSection] = useActiveSection(data.sections);

    const scrollTo = (id: string): void => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
    };

    if (data.isContactPage) return <ContactPage data={data} />;

    return (
        <div className={styles.policyLayout}>
            {(data.sections?.length ?? 0) > 0 && (
                <nav className={styles.toc}>
                    <p className={styles.tocLabel}>On this page</p>
                    <ul>
                        {data.sections?.map((s) => (
                            <li key={s.id}>
                                <button
                                    className={cx(styles.tocLink, activeSection === s.id && styles.active)}
                                    onClick={() => scrollTo(s.id)}
                                >
                                    {s.heading}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            <div className={styles.policySections}>
                {data.sections?.map((section, i) => (
                    <section
                        key={section.id}
                        id={section.id}
                        className={styles.policySection}
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        <h3>{section.heading}</h3>
                        {section.content && <p>{section.content}</p>}
                        {section.list.length > 0 && (
                            <ul className={styles.policyList}>
                                {section.list.map((item, j) => <li key={j}>{item}</li>)}
                            </ul>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PolicyPages(): JSX.Element {
    const [activePage, setActivePage] = useState<string>(POLICY_PAGES[0].slug);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const contentRef = useRef<HTMLElement>(null);

    const currentMeta = POLICY_PAGES.find((p) => p.slug === activePage);
    const currentData: PolicyContent = POLICY_CONTENT[activePage];

    const handlePageChange = (slug: string): void => {
        if (slug === activePage) return;
        setLoading(true);
        setSidebarOpen(false);
        setTimeout(() => {
            setActivePage(slug);
            setLoading(false);
            contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }, 280);
        // TODO: Replace with real API fetch:
        // const data: PolicyContent = await fetchPolicyContent(slug);
    };

    return (
        <div className={styles.policyRoot}>
            {sidebarOpen && (
                <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            )}

            <aside className={cx(styles.policySidebar, sidebarOpen && styles.open)} aria-label="Policy navigation">
                <div className={styles.sidebarHeader}>
                    <span className={styles.sidebarTitle}>Legal & Support</span>
                    <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                        {icons.close}
                    </button>
                </div>

                <nav className={styles.sidebarNav} aria-label="Policy pages">
                    {POLICY_PAGES.map((page) => (
                        <button
                            key={page.slug}
                            className={cx(styles.sidebarItem, activePage === page.slug && styles.active)}
                            onClick={() => handlePageChange(page.slug)}
                            aria-current={activePage === page.slug ? "page" : undefined}
                        >
                            <span className={styles.sidebarIcon} aria-hidden="true">{icons[page.icon]}</span>
                            <span className={styles.sidebarLabel}>{page.label}</span>
                            {page.badge && <span className={styles.sidebarBadge}>{page.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <p>Need help?</p>
                    <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>
                </div>
            </aside>

            <main className={styles.policyMain} ref={contentRef}>
                <div className={styles.mobileTopbar}>
                    <button className={styles.mobileMenuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
                        {icons.menu}
                    </button>
                    <span>{currentMeta?.label}</span>
                </div>

                <header className={styles.policyHeader}>
                    <div className={styles.headerIcon} aria-hidden="true">
                        {currentMeta?.icon && icons[currentMeta.icon]}
                    </div>
                    <div className={styles.headerMeta}>
                        {currentMeta?.lastUpdated && (
                            <span className={styles.metaChip}>Last updated: {currentMeta.lastUpdated}</span>
                        )}
                        {currentMeta?.effectiveDate && (
                            <span className={styles.metaChip}>Effective: {currentMeta.effectiveDate}</span>
                        )}
                    </div>
                    <h1>{currentData?.title}</h1>
                    <p className={styles.headerSubtitle}>{currentData?.subtitle}</p>
                </header>

                <div className={cx(styles.policyContent, loading && styles.loading)}>
                    {loading ? (
                        <div className={styles.skeletonLoader} aria-label="Loading content">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className={styles.skeletonBlock} style={{ animationDelay: `${i * 80}ms` }}>
                                    <div className={styles.skeletonHeading} />
                                    <div className={styles.skeletonText} />
                                    <div className={cx(styles.skeletonText, styles.short)} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <PolicyContentView data={currentData} />
                    )}
                </div>
            </main>
        </div>
    );
}