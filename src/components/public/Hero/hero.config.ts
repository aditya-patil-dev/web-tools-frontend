export interface HeroConfig {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: {
        text: string;
        href: string;
    };
    secondaryCta: {
        text: string;
        href: string;
    };
    trustBadges: {
        icon: string;
        text: string;
    }[];
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
    badge: "🚀 Free & Fast Web Tools",
    title: "Powerful <span>Web Tools</span> for<br />Developers & Marketers",
    subtitle: "Convert images, optimize SEO, generate content, and get things done faster — no sign-up, no limits.",
    primaryCta: {
        text: "Try Tools",
        href: "/tools",
    },
    secondaryCta: {
        text: "View Pricing",
        href: "/pricing",
    },
    trustBadges: [
        {
            icon: "⚡",
            text: "Instant results",
        },
        {
            icon: "🔒",
            text: "Privacy-friendly",
        },
        {
            icon: "💻",
            text: "Built for productivity",
        },
    ],
};