// src/features/online-store/registry/index.ts
//
// ┌─────────────────────────────────────────────────────────────┐
// │  THE REGISTRY — the only file you touch to add a new section │
// │                                                              │
// │  Adding a new section type:                                  │
// │  1. Create src/features/online-store/sections/my-section/    │
// │  2. Export a SectionDefinition from its index.ts             │
// │  3. Import it here and add ONE line to the registry Map      │
// │  4. Add it to COMPONENT_MAP in src/app/preview/[page_key]/   │
// │                                                              │
// │  That's it. No switch statements. No other files to change.  │
// └─────────────────────────────────────────────────────────────┘

import { SectionDefinition } from "./types";

import heroSection from "../sections/hero";
import popularToolsSection from "../sections/popular-tools";
import whyChooseUsSection from "../sections/why-choose-us";
import howItWorksSection from "../sections/how-it-works";
import finalCtaSection from "../sections/final-cta";
import seoContentSection from "../sections/seo-content";
import navbarSection from "../sections/navbar";
import footerSection from "../sections/footer";

const registry = new Map<string, SectionDefinition>([
    ["hero", heroSection],
    ["popular-tools", popularToolsSection],
    ["why-choose-us", whyChooseUsSection],
    ["how-it-works", howItWorksSection],
    ["final-cta", finalCtaSection],
    ["seo-content", seoContentSection],
    ["navbar", navbarSection],
    ["footer", footerSection],
]);

export default registry;

/* ─────────────────────────────────────────────
   Convenience helpers used throughout the editor
───────────────────────────────────────────── */

/** Get the definition for a component type — returns undefined if unregistered */
export function getSectionDef(type: string): SectionDefinition | undefined {
    return registry.get(type);
}

/** Get the icon for a type, with a fallback */
export function getSectionIcon(type: string): string {
    return registry.get(type)?.icon ?? "📦";
}

/** Get the label for a type, with a fallback */
export function getSectionLabel(type: string): string {
    return registry.get(type)?.label ?? type;
}

/** All registered types — useful for "Add Section" dropdowns */
export function getAllSectionTypes(): SectionDefinition[] {
    return Array.from(registry.values());
}