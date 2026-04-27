export interface ToolChip {
  label: string;
  href: string;
}

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
  thirdCta: {
    text: string;
    href: string;
  };
  trustBadges: {
    icon: string;
    text: string;
  }[];
  toolChips?: ToolChip[]; // optional — API can send it or not
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  badge: "✦ Upload Your Image to Compress Instantly",
  title: "Compress, Convert & Optimize Files Instantly — <span>No Signup Needed</span>",
  subtitle:
    "Free AI-powered tools to help you work faster, smarter, and more efficiently. No limits, no friction.",
  primaryCta: {
    text: "Try Image Compressor →",
    href: "/tools/image-tools/image-compressor",
  },
  secondaryCta: {
    text: "Explore All Tools",
    href: "/tools",
  },
  thirdCta: {
    text: "Background Remover →",
    href: "/tools/image-tools/background-remover",
  },
  trustBadges: [
    { icon: "HiUsers", text: "No Signup" },
    { icon: "HiLockClosed", text: "100% Private" },
    { icon: "HiSparkles", text: "Free" },
  ],
  toolChips: [
    { label: "AI Background Remover", href: "/tools/image-tools/background-remover" },
    { label: "Image Compressor", href: "/tools/image-tools/image-compressor" },
    { label: "Meta Tag Generator", href: "/tools/seo-tools/meta-tag-generator" },
    { label: "JSON Formatter", href: "/tools/developer-tools/json-formatter" },
    { label: "PDF to Word", href: "/tools/pdf-tools/pdf-to-word-converter" },
    { label: "Website Speed Test", href: "/tools/seo-tools/website-speed-test" }
  ],
};
