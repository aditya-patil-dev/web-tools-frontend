// ─────────────────────────────────────────────────────────────
//  SectionEngine — JSON Schema Types
// ─────────────────────────────────────────────────────────────

export type LayoutVariant = 'hero-side' | 'accent-grid' | 'two-col'

export type ToolTag =
    | 'PDF' | 'IMAGE' | 'DEV' | 'AI' | 'TEXT'
    | 'ZIP' | 'EXCEL' | 'VIDEO' | 'FREE'
    | 'CONVERT' | 'SEO' | 'SOCIAL'

export type AccentColor = 'coral' | 'purple' | 'blue' | 'teal' | 'pink' | 'amber'

export type BadgeLabel = 'POPULAR' | 'NEW' | 'AI' | 'FREE' | 'BETA' | 'HOT' | 'FREE & FAST' | 'AI POWERED' | 'SECURE' | 'PRIVATE' | 'LIVE'

export interface ToolItem {
    id: string
    title: string
    description: string
    href: string
    icon: string            // Lucide icon name, e.g. "FileText"
    tag: ToolTag
    badge?: BadgeLabel
    accent?: AccentColor    // used by accent-grid layout per card
}

export interface SectionConfig {
    id: string
    layout: LayoutVariant
    label?: string          // small eyebrow label, e.g. "Image Tools"
    title: string           // plain part of heading
    titleAccent?: string    // colored part, e.g. "Tools"
    subtitle?: string
    viewAllHref?: string
    viewAllLabel?: string
    tools: ToolItem[]
}

export interface PageConfig {
    sections: SectionConfig[]
}