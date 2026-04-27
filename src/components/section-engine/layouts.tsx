'use client'

// ─────────────────────────────────────────────────────────────
//  SectionEngine — Layout Variants
//  D: hero-side  |  E: accent-grid  |  F: two-col
//  All hardcoded hex colors replaced with CSS theme variables
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { SectionConfig } from './types'
import {
    IconBox, TagPill, ArrowBtn, Badge,
    CardMotion, SectionHeader,
    ACCENT_MAP,
} from './components'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────
//  LAYOUT D — Featured Hero + Side Cards
// ─────────────────────────────────────────────────────────────
function HeroCard({ tool }: { tool: import('./types').ToolItem }) {
    return (
        <Link href={tool.href} className="no-underline">
            <CardMotion className="se-hero-card">
                {tool.badge && <Badge label={tool.badge} />}
                <IconBox icon={tool.icon} size={20} />
                <div className="se-hero-card__body">
                    <h3 className="se-hero-card__title">{tool.title}</h3>
                    <p className="se-hero-card__desc">{tool.description}</p>
                </div>
                <div className="se-card__footer">
                    <TagPill tag={tool.tag} />
                    <ArrowBtn />
                </div>
            </CardMotion>
        </Link>
    )
}

function CompactCard({ tool }: { tool: import('./types').ToolItem }) {
    return (
        <Link href={tool.href} className="no-underline">
            <CardMotion className="se-compact-card">
                {tool.badge && <Badge label={tool.badge} />}
                <IconBox icon={tool.icon} />
                <div className="se-compact-card__body">
                    <div className="se-compact-card__title">{tool.title}</div>
                    <div className="se-compact-card__desc">{tool.description}</div>
                </div>
                <div className="se-compact-card__right">
                    <TagPill tag={tool.tag} />
                    <ArrowBtn />
                </div>
            </CardMotion>
        </Link>
    )
}

export function HeroSideLayout({ section }: { section: SectionConfig }) {
    const [hero, ...rest] = section.tools
    return (
        <section className="se-section">
            <div className="se-container">
                <SectionHeader
                    label={section.label}
                    title={section.title}
                    titleAccent={section.titleAccent}
                    subtitle={section.subtitle}
                    viewAllHref={section.viewAllHref}
                    viewAllLabel={section.viewAllLabel}
                />
                <div className="se-hero-grid">
                    <div>
                        <HeroCard tool={hero} />
                    </div>
                    <div className="se-hero-side">
                        {rest.map((tool) => (
                            <div key={tool.id}>
                                <CompactCard tool={tool} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────
//  LAYOUT E — Colored Accent Bar Grid
// ─────────────────────────────────────────────────────────────
function AccentCard({ tool }: { tool: import('./types').ToolItem }) {
    const accentClass = ACCENT_MAP[tool.accent ?? 'coral']
    return (
        <Link href={tool.href} className="no-underline">
            <CardMotion className="se-accent-card">
                <div className={`se-accent-bar ${accentClass}`} />
                <div className="se-accent-card__body">
                    {tool.badge && <Badge label={tool.badge} />}
                    <IconBox icon={tool.icon} />
                    <h3 className="se-accent-card__title">{tool.title}</h3>
                    <p className="se-accent-card__desc">{tool.description}</p>
                    <div className="se-card__footer">
                        <TagPill tag={tool.tag} />
                        <ArrowBtn />
                    </div>
                </div>
            </CardMotion>
        </Link>
    )
}

export function AccentGridLayout({ section }: { section: SectionConfig }) {
    return (
        <section className="se-section">
            <div className="se-container">
                <SectionHeader
                    label={section.label}
                    title={section.title}
                    titleAccent={section.titleAccent}
                    subtitle={section.subtitle}
                />
                <div className="se-accent-grid">
                    {section.tools.map((tool) => (
                        <div key={tool.id} className="se-accent-grid__item">
                            <AccentCard tool={tool} />
                        </div>
                    ))}
                </div>
                {section.viewAllHref && (
                    <div className="se-view-all-center">
                        <a href={section.viewAllHref} className="se-view-all-btn">
                            {section.viewAllLabel ?? 'View All'} →
                        </a>
                    </div>
                )}
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────
//  LAYOUT F — 2-Col Horizontal Cards
// ─────────────────────────────────────────────────────────────
function HorizontalCard({ tool }: { tool: import('./types').ToolItem }) {
    return (
        <Link href={tool.href} className="no-underline">
            <CardMotion className="se-horiz-card">
                {tool.badge && <Badge label={tool.badge} />}
                <div className="se-horiz-card__top">
                    <div className="se-horiz-card__icon-wrap">
                        <IconBox icon={tool.icon} />
                    </div>
                    <div>
                        <div className="se-horiz-card__title">{tool.title}</div>
                        <div className="se-horiz-card__desc">{tool.description}</div>
                    </div>
                </div>
                <div className="se-card__footer">
                    <TagPill tag={tool.tag} />
                    <ArrowBtn />
                </div>
            </CardMotion>
        </Link>
    )
}

export function TwoColLayout({ section }: { section: SectionConfig }) {
    return (
        <section className="se-section">
            <div className="se-container">
                <SectionHeader
                    label={section.label}
                    title={section.title}
                    titleAccent={section.titleAccent}
                    subtitle={section.subtitle}
                />
                <div className="se-two-col-grid">
                    {section.tools.map((tool) => (
                        <div key={tool.id}>
                            <HorizontalCard tool={tool} />
                        </div>
                    ))}
                </div>
                {section.viewAllHref && (
                    <div className="se-view-all-center">
                        <a href={section.viewAllHref} className="se-view-all-btn">
                            {section.viewAllLabel ?? 'View All'} →
                        </a>
                    </div>
                )}
            </div>
        </section>
    )
}