// about.config.ts - Centralized configuration for About page

export const ABOUT_CONFIG = {
    // SEO & Meta
    seo: {
        title: "About Us - WebTools | Fast & Free Online Tools",
        description:
            "Learn about WebTools - a modern platform offering fast, simple, and reliable online tools for developers, marketers, and creators.",
        keywords: [
            "about webtools",
            "online tools platform",
            "developer tools",
            "free web tools",
            "SEO tools",
        ],
    },

    // Header Section
    header: {
        title: "About",
        titleAccent: "WebTools",
        subtitle:
            "A modern platform offering fast, simple, and reliable online tools for developers, marketers, and creators.",
    },

    // Mission Section
    mission: {
        icon: "🎯",
        title: "Our Mission",
        content:
            "Our mission is to remove friction from everyday digital tasks. Instead of installing heavy software or juggling multiple websites, we provide a single place where useful tools are instantly accessible.",
    },

    // Why Section
    why: {
        icon: "💡",
        title: "Why We Built This",
        content:
            "Many online tools today are cluttered with ads, locked behind paywalls, or overly complex. WebTools was created to offer clean, focused utilities that simply work — without distractions.",
    },

    // Target Audience
    audience: {
        icon: "👥",
        title: "Who It's For",
        items: [
            "Developers who need quick utilities during development",
            "Marketers working on SEO, content, and optimization",
            "Students and creators looking for simple productivity tools",
            "Anyone who values speed and simplicity",
        ],
    },

    // Core Principles
    principles: {
        icon: "⚡",
        title: "Our Core Principles",
        items: [
            {
                icon: "🚀",
                title: "Speed First",
                description: "Every tool is optimized for instant results",
            },
            {
                icon: "🔒",
                title: "Privacy by Default",
                description: "Your data stays private, no tracking",
            },
            {
                icon: "✨",
                title: "Simple Experience",
                description: "Clean, predictable, and intuitive",
            },
            {
                icon: "🎯",
                title: "Real Solutions",
                description: "Tools that solve actual problems",
            },
        ],
    },

    // Technology Stack
    technology: {
        icon: "⚙️",
        title: "How WebTools Is Built",
        content:
            "WebTools is built using modern web technologies with a strong focus on performance, scalability, and maintainability. Every tool is optimized to deliver fast results while keeping the interface clean and intuitive across all devices.",
    },

    // Future Plans
    future: {
        icon: "🚀",
        title: "What's Next",
        content:
            "We're continuously expanding our tool library and improving existing tools based on real usage and feedback. Our goal is to build a reliable toolkit that grows alongside modern workflows.",
        cta: {
            heading: "Ready to get started?",
            subheading: "Explore our growing collection of free tools",
            buttonText: "Browse Tools",
            buttonLink: "/tools",
        },
    },
};

// You can also export individual sections if needed
export const { seo, header, mission, why, audience, principles, technology, future } = ABOUT_CONFIG;