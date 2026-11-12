'use client'

// ─────────────────────────────────────────────────────────────
//  SectionEngine — Modern Layout Variants
//  Hero-Side | Accent-Grid | Two-Col
//  Elevated, rich glassmorphism UI/UX matching website theme
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { SectionConfig, ToolItem } from './types'
import {
    IconBox, TagPill, ArrowBtn, Badge,
    CardMotion, SectionHeader,
    ACCENT_MAP,
} from './components'
import AppLink from '@/components/common/AppLink'
import { LuArrowRight } from 'react-icons/lu'
// import { LuStar } from 'react-icons/lu'

// ─────────────────────────────────────────────────────────────
//  LAYOUT D — Featured Hero + Side Cards
// ─────────────────────────────────────────────────────────────
function HeroCard({ tool }: { tool: ToolItem }) {
    return (
        <AppLink href={tool.href} className="no-underline se-card-link">
            <CardMotion className="se-hero-card">
                <div className="se-card-ambient-glow" />
                <div className="se-hero-card__top">
                    <IconBox icon={tool.icon} size={28} />
                    {tool.badge && <Badge label={tool.badge} />}
                </div>

                <div className="se-hero-card__body">
                    {/* Rating commented out:
                    <div className="se-card-rating">
                        <LuStar size={12} fill="#f59e0b" color="#f59e0b" />
                        <span>4.95 Rating · Verified Free</span>
                    </div>
                    */}
                    <h3 className="se-hero-card__title">{tool.title}</h3>
                    <p className="se-hero-card__desc">{tool.description}</p>
                </div>

                <div className="se-card__footer">
                    <TagPill tag={tool.tag} />
                    <div className="se-hero-card__launch">
                        <span>Launch Tool</span>
                        <LuArrowRight size={15} className="launch-arrow" />
                    </div>
                </div>
            </CardMotion>
        </AppLink>
    )
}

function CompactCard({ tool }: { tool: ToolItem }) {
    return (
        <AppLink href={tool.href} className="no-underline se-card-link">
            <CardMotion className="se-compact-card">
                <div className="se-card-ambient-glow" />
                <div className="se-compact-card__icon-wrap">
                    <IconBox icon={tool.icon} size={22} />
                </div>
                <div className="se-compact-card__body">
                    <div className="se-compact-card__title-row">
                        <div className="se-compact-card__title">{tool.title}</div>
                        {tool.badge && <Badge label={tool.badge} />}
                    </div>
                    <div className="se-compact-card__desc">{tool.description}</div>
                </div>
                <div className="se-compact-card__right">
                    <TagPill tag={tool.tag} />
                    <ArrowBtn />
                </div>
            </CardMotion>
        </AppLink>
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
                    <div className="se-hero-main-col">
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
function AccentCard({ tool }: { tool: ToolItem }) {
    const accentClass = ACCENT_MAP[tool.accent ?? 'coral']
    return (
        <AppLink href={tool.href} className="no-underline se-card-link">
            <CardMotion className="se-accent-card">
                <div className={`se-accent-bar ${accentClass}`} />
                <div className="se-card-ambient-glow" />
                <div className="se-accent-card__body">
                    <div className="se-accent-card__top">
                        <IconBox icon={tool.icon} size={24} />
                        {tool.badge && <Badge label={tool.badge} />}
                    </div>

                    {/* Rating commented out:
                    <div className="se-card-rating">
                        <LuStar size={11} fill="#f59e0b" color="#f59e0b" />
                        <span>4.9★</span>
                    </div>
                    */}

                    <h3 className="se-accent-card__title">{tool.title}</h3>
                    <p className="se-accent-card__desc">{tool.description}</p>

                    <div className="se-card__footer">
                        <TagPill tag={tool.tag} />
                        <ArrowBtn />
                    </div>
                </div>
            </CardMotion>
        </AppLink>
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
                    viewAllHref={section.viewAllHref}
                    viewAllLabel={section.viewAllLabel}
                />
                <div className="se-accent-grid">
                    {section.tools.map((tool) => (
                        <div key={tool.id} className="se-accent-grid__item">
                            <AccentCard tool={tool} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────
//  LAYOUT F — 2-Col Horizontal Cards
// ─────────────────────────────────────────────────────────────
function HorizontalCard({ tool }: { tool: ToolItem }) {
    return (
        <AppLink href={tool.href} className="no-underline se-card-link">
            <CardMotion className="se-horiz-card">
                <div className="se-card-ambient-glow" />
                <div className="se-horiz-card__top">
                    <div className="se-horiz-card__icon-wrap">
                        <IconBox icon={tool.icon} size={24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="se-horiz-card__title-row">
                            <div className="se-horiz-card__title">{tool.title}</div>
                            {tool.badge && <Badge label={tool.badge} />}
                        </div>
                        <div className="se-horiz-card__desc">{tool.description}</div>
                    </div>
                </div>
                <div className="se-card__footer">
                    <TagPill tag={tool.tag} />
                    {/* Rating commented out:
                    <div className="se-card-rating">
                        <LuStar size={11} fill="#f59e0b" color="#f59e0b" />
                        <span>4.9★</span>
                    </div>
                    */}
                    <ArrowBtn />
                </div>
            </CardMotion>
        </AppLink>
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
                    viewAllHref={section.viewAllHref}
                    viewAllLabel={section.viewAllLabel}
                />
                <div className="se-two-col-grid">
                    {section.tools.map((tool) => (
                        <div key={tool.id}>
                            <HorizontalCard tool={tool} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
