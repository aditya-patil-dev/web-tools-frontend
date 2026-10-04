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
// Matches website tool-card-badge system and theme variables
const BADGE_STYLES: Record<BadgeLabel, React.CSSProperties> = {
    POPULAR: { background: 'var(--color-primary-popular)', color: '#ffffff' },
    NEW: { background: 'var(--color-primary-new)', color: '#ffffff' },
    AI: { background: 'var(--color-primary-ai)', color: '#ffffff' },
    FREE: { background: 'var(--color-success)', color: '#ffffff' },
    BETA: { background: 'var(--color-primary-beta)', color: '#ffffff' },
    HOT: { background: 'var(--color-primary-pro)', color: '#ffffff' },
    'FREE & FAST': { background: 'var(--color-success)', color: '#ffffff' },
    'AI POWERED': { background: 'var(--color-primary-ai)', color: '#ffffff' },
    SECURE: { background: 'var(--color-info)', color: '#ffffff' },
    PRIVATE: { background: 'var(--color-primary-pro)', color: '#ffffff' },
    LIVE: { background: 'var(--color-success)', color: '#ffffff' },
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
// Clean, crisp category tags matching website design tokens
const TAG_STYLES: Record<string, React.CSSProperties> = {
    PDF: { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' },
    IMAGE: { background: 'rgba(255, 107, 53, 0.12)', color: '#ff6b35', border: '1px solid rgba(255, 107, 53, 0.2)' },
    DEV: { background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' },
    AI: { background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' },
    TEXT: { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
    ZIP: { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' },
    EXCEL: { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
    VIDEO: { background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' },
    FREE: { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
    CONVERT: { background: 'rgba(255, 107, 53, 0.12)', color: '#ff6b35', border: '1px solid rgba(255, 107, 53, 0.2)' },
    SEO: { background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' },
    SOCIAL: { background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' },
}

export function TagPill({ tag }: { tag: string }) {
    const style = TAG_STYLES[tag] ?? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
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
            <LucideIcons.ArrowRight size={15} strokeWidth={2} className="arrow-btn__icon" />
        </div>
    )
}

// ── Icon box ─────────────────────────────────────────────────
export function IconBox({ icon, size = 22 }: { icon: string; size?: number }) {
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