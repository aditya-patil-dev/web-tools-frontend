'use client'

// ─────────────────────────────────────────────────────────────
//  SectionEngine — Shared Sub-Components
//  Styled with CSS theme variables from global stylesheet
// ─────────────────────────────────────────────────────────────

import React from 'react'
import * as LucideIcons from 'lucide-react'
import type { AccentColor, BadgeLabel } from './types'
import AppLink from '@/components/common/AppLink'

// ── Icon resolver ────────────────────────────────────────────
export function ToolIcon({ name, size = 20 }: { name: string; size?: number }) {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name]
    if (!Icon) return <LucideIcons.Wrench size={size} strokeWidth={1.8} />
    return <Icon size={size} strokeWidth={1.8} />
}

// ── Highlighted Standout Badge ────────────────────────────────
function getBadgeClass(label: string): string {
    const l = label.toLowerCase()
    if (l.includes('ai')) return 'highlight-card-badge badge-ai'
    if (l.includes('popular') || l.includes('top')) return 'highlight-card-badge badge-popular'
    if (l.includes('fast') || l.includes('free')) return 'highlight-card-badge badge-fast'
    if (l.includes('secure') || l.includes('private')) return 'highlight-card-badge badge-private'
    if (l.includes('hot') || l.includes('new')) return 'highlight-card-badge badge-hot'
    return 'highlight-card-badge badge-popular'
}

export function Badge({ label }: { label: BadgeLabel }) {
    return (
        <span className={`badge-pill ${getBadgeClass(label)}`}>
            {label}
        </span>
    )
}

// ── Tag pill ─────────────────────────────────────────────────
const TAG_STYLES: Record<string, React.CSSProperties> = {
    PDF: { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' },
    IMAGE: { background: 'rgba(255, 107, 53, 0.12)', color: '#ff6b35', border: '1px solid rgba(255, 107, 53, 0.25)' },
    DEV: { background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.25)' },
    AI: { background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.25)' },
    TEXT: { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' },
    ZIP: { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' },
    EXCEL: { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' },
    VIDEO: { background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' },
    FREE: { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' },
    CONVERT: { background: 'rgba(255, 107, 53, 0.12)', color: '#ff6b35', border: '1px solid rgba(255, 107, 53, 0.25)' },
    SEO: { background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' },
    SOCIAL: { background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.25)' },
}

export function TagPill({ tag }: { tag: string }) {
    const style = TAG_STYLES[tag] ?? {
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
    }
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
                    <div className="se-section-header__eyebrow-wrap">
                        <span className="se-section-header__eyebrow">
                            {label}
                        </span>
                    </div>
                )}
                <h2 className="se-section-header__title">
                    {title}{' '}
                    {titleAccent && <span className="se-section-header__accent">{titleAccent}</span>}
                </h2>
                {subtitle && <p className="se-section-header__subtitle">{subtitle}</p>}
            </div>
            {viewAllHref && (
                <AppLink href={viewAllHref} className="se-view-all-btn">
                    {viewAllLabel} <LucideIcons.ArrowRight size={14} strokeWidth={2} />
                </AppLink>
            )}
        </div>
    )
}
