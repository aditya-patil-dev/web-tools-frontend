'use client'

// ─────────────────────────────────────────────────────────────
//  SectionEngine — Main Engine Component
//  Drop this on any page and feed it a PageConfig JSON.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { PageConfig, SectionConfig } from './types'
import { HeroSideLayout } from './layouts'
import { AccentGridLayout } from './layouts'
import { TwoColLayout } from './layouts'

// ── Route a single section to the right layout ───────────────
function renderSection(section: SectionConfig) {
    switch (section.layout) {
        case 'hero-side':
            return <HeroSideLayout key={section.id} section={section} />
        case 'accent-grid':
            return <AccentGridLayout key={section.id} section={section} />
        case 'two-col':
            return <TwoColLayout key={section.id} section={section} />
        default:
            console.warn(`[SectionEngine] Unknown layout: "${(section as SectionConfig).layout}"`)
            return null
    }
}

// ── Main engine ───────────────────────────────────────────────
interface SectionEngineProps {
    config: PageConfig
    className?: string
}

export default function SectionEngine({ config, className = '' }: SectionEngineProps) {
    return (
        // Uses --bg-primary from your theme instead of hardcoded #0f0f0f
        <div className={`se-engine ${className}`}>
            {config.sections.map(renderSection)}
        </div>
    )
}

// ── Re-export types so consumers import from one place ────────
export type { PageConfig, SectionConfig } from './types'