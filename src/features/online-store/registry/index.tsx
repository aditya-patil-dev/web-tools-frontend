// src/features/online-store/registry/index.ts
import React from "react";
import { SectionDefinition } from "./types";
import { SectionIcon } from "./icons";

import heroSection from "../sections/hero";
import popularToolsSection from "../sections/popular-tools";
import whyChooseUsSection from "../sections/why-choose-us";
import howItWorksSection from "../sections/how-it-works";
import finalCtaSection from "../sections/final-cta";
import seoContentSection from "../sections/seo-content";
import navbarSection from "../sections/navbar";
import footerSection from "../sections/footer";

const registry = new Map<string, SectionDefinition>([
    ["hero",            heroSection],
    ["popular-tools",   popularToolsSection],
    ["why-choose-us",   whyChooseUsSection],
    ["how-it-works",    howItWorksSection],
    ["final-cta",       finalCtaSection],
    ["seo-content",     seoContentSection],
    ["navbar",          navbarSection],
    ["footer",          footerSection],
]);

export default registry;

/** Get the definition for a component type */
export function getSectionDef(type: string): SectionDefinition<unknown> | undefined {
    return registry.get(type);
}

/**
 * Get the icon for a type as a rendered React element.
 * SectionRow renders this directly — no emoji, real React Icons.
 */
export function getSectionIcon(type: string, size = 15, color = "#6366f1"): React.ReactNode {
    const iconKey = registry.get(type)?.icon ?? type; // fallback to type key itself
    return <SectionIcon name={iconKey} size={size} color={color} />;
}

/** Get the label for a type */
export function getSectionLabel(type: string): string {
    return registry.get(type)?.label ?? type;
}

/** All registered types — useful for "Add Section" dropdowns */
export function getAllSectionTypes(): SectionDefinition[] {
    return Array.from(registry.values());
}