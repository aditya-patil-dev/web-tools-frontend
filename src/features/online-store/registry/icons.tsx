// src/features/online-store/registry/icons.tsx
//
// ALL React Icons imports live here — nowhere else.
// Usage: <SectionIcon name="hero" size={16} />
//
// ADDING A NEW ICON:
//   1. Import it here
//   2. Add one line to ICON_MAP
//   3. Use the key string in your section definition: icon: "my-key"

import React from "react";

import { BiHomeAlt2, BiInfoCircle, BiLayer, BiStar, BiArrowBack } from "react-icons/bi";
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineQuestionMarkCircle, HiOutlineLightningBolt } from "react-icons/hi";
import { MdOutlineContactPage, MdOutlinePriceChange, MdOutlineNavigation } from "react-icons/md";
import { RiFootprintLine, RiSeoLine, RiToolsLine } from "react-icons/ri";
import { TbBrandSpeedtest } from "react-icons/tb";
import { BsBoxSeam } from "react-icons/bs";

// ── Map: string key → icon component ─────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
    // ── Section types (match your registry keys exactly) ──────────────────────
    "hero": BiHomeAlt2,
    "popular-tools": BiStar,
    "why-choose-us": HiOutlineSparkles,
    "how-it-works": HiOutlineLightningBolt,
    "final-cta": HiOutlineChartBar,
    "seo-content": RiSeoLine,
    "navbar": MdOutlineNavigation,
    "footer": RiFootprintLine,

    // ── Page icons (for PageSwitcher tabs) ────────────────────────────────────
    "home": BiHomeAlt2,
    "about": BiInfoCircle,
    "pricing": MdOutlinePriceChange,
    "contact": MdOutlineContactPage,

    // ── Generic / utility ─────────────────────────────────────────────────────
    "tools": RiToolsLine,
    "layers": BiLayer,
    "stats": HiOutlineChartBar,
    "faq": HiOutlineQuestionMarkCircle,
    "speed": TbBrandSpeedtest,
    "arrow-left": BiArrowBack,
    "default": BsBoxSeam,
};

// ── Component ─────────────────────────────────────────────────────────────────
interface SectionIconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
}

export function SectionIcon({ name, size = 16, color, className }: SectionIconProps) {
    const Icon = ICON_MAP[name] ?? ICON_MAP["default"];
    return <Icon size={size} color={color} className={className} />;
}