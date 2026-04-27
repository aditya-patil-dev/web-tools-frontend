'use client'

// ─────────────────────────────────────────────────────────────
//  SectionEngine — Shared Sub-Components
//  Styled with CSS theme variables from global stylesheet
// ─────────────────────────────────────────────────────────────

import React from 'react'
import * as LucideIcons from 'lucide-react'
import type { ToolItem, AccentColor, BadgeLabel } from './types'

// ── Icon resolver ────────────────────────────────────────────
export function ToolIcon({ name, size = 18 }: { name: string; size?: number }) {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name]
    if (!Icon) return <LucideIcons.Wrench size={size} strokeWidth={1.6} />
    return <Icon size={size} strokeWidth={1.6} />
}

// ── Badge ────────────────────────────────────────────────────
// Uses CSS custom properties from --color-primary-* gradients in the theme
const BADGE_STYLES: Record<BadgeLabel, React.CSSProperties> = {
    POPULAR: { background: 'var(--color-primary-popular)', color: '#fff' },
    NEW: { background: 'var(--color-primary-new)', color: '#fff' },
    AI: { background: 'var(--color-primary-ai)', color: '#fff' },
    FREE: { background: 'var(--color-success)', color: '#fff' },
    BETA: { background: 'var(--color-primary-beta)', color: '#fff' },
    HOT: { background: 'var(--color-primary-pro)', color: '#fff' },
    'FREE & FAST': { background: 'var(--color-success)', color: '#fff' },
    'AI POWERED': { background: 'var(--color-primary-ai)', color: '#fff' },
    SECURE: { background: 'var(--color-info)', color: '#fff' },
    PRIVATE: { background: 'var(--color-primary-pro)', color: '#fff' },
    LIVE: { background: 'var(--color-success)', color: '#fff' },
}

export function Badge({ label }: { label: BadgeLabel }) {
    return (
        <span
            style={BADGE_STYLES[label]}
            className="badge-pill"
        >
            {label}
        </span>
    )
}

// ── Tag pill ─────────────────────────────────────────────────
const TAG_STYLES: Record<string, React.CSSProperties> = {
    PDF: { background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' },
    IMAGE: { background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' },
    DEV: { background: 'rgba(102,126,234,0.12)', color: '#667eea' },
    AI: { background: 'rgba(102,126,234,0.12)', color: '#667eea' },
    TEXT: { background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' },
    ZIP: { background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' },
    EXCEL: { background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' },
    VIDEO: { background: 'rgba(59,130,246,0.12)', color: 'var(--color-info)' },
    FREE: { background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' },
    CONVERT: { background: 'rgba(255,107,53,0.1)', color: '#ff6b35' },
    SEO: { background: 'rgba(102,126,234,0.12)', color: '#667eea' },
    SOCIAL: { background: 'rgba(59,130,246,0.12)', color: 'var(--color-info)' },
}

export function TagPill({ tag }: { tag: string }) {
    const style = TAG_STYLES[tag] ?? { background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }
    return (
        <span className="tag-pill" style={style}>
            {tag}
        </span>
    )
}

// ── Arrow button ─────────────────────────────────────────────
export function ArrowBtn() {
    return (
        <div className="arrow-btn">
            <LucideIcons.ArrowRight size={13} strokeWidth={2} className="arrow-btn__icon" />
        </div>
    )
}

// ── Icon box ─────────────────────────────────────────────────
export function IconBox({ icon, size = 18 }: { icon: string; size?: number }) {
    return (
        <div className="icon-box">
            <ToolIcon name={icon} size={size} />
        </div>
    )
}

// ── Accent bar colors ────────────────────────────────────────
export const ACCENT_MAP: Record<AccentColor, string> = {
    coral: 'accent-bar--coral',
    purple: 'accent-bar--purple',
    blue: 'accent-bar--blue',
    teal: 'accent-bar--teal',
    pink: 'accent-bar--pink',
    amber: 'accent-bar--amber',
}

// ── Card hover animation wrapper ─────────────────────────────
export function CardMotion({
    children,
    className = '',
    onClick,
}: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}) {
    return (
        <div
            className={`se-card ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

// ── Stagger container ─────────────────────────────────────────
// (Animations removed, using native CSS transitions)

// (Animations removed, using native CSS transitions)

// ── Section header ────────────────────────────────────────────
export function SectionHeader({
    label,
    title,
    titleAccent,
    subtitle,
    viewAllHref,
    viewAllLabel = 'View All',
}: {
    label?: string
    title: string
    titleAccent?: string
    subtitle?: string
    viewAllHref?: string
    viewAllLabel?: string
}) {
    return (
        <div className="se-section-header">
            <div>
                {label && (
                    <p className="se-section-header__eyebrow">
                        {label}
                    </p>
                )}
                <h2 className="se-section-header__title">
                    {title}{' '}
                    {titleAccent && <span className="se-section-header__accent">{titleAccent}</span>}
                </h2>
                {subtitle && <p className="se-section-header__subtitle">{subtitle}</p>}
            </div>
            {viewAllHref && (
                <a href={viewAllHref} className="se-view-all-btn">
                    {viewAllLabel} <LucideIcons.ArrowRight size={13} strokeWidth={2} />
                </a>
            )}
        </div>
    )
}