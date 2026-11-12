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
  toolChips?: ToolChip[];
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  badge: "✦ 30+ Free Web Tools · 100% In-Browser Privacy · No Signup Needed",
  title: "Explore All Free Web Tools — <span>Image, PDF, SEO & Developer Utilities</span>",
  subtitle:
    "Browse our complete directory of free online web tools. From PDF converters to developer utilities and SEO generators, find exactly what you need to work faster.",
  primaryCta: {
    text: "Explore All Tools →",
    href: "/tools",
  },
  secondaryCta: {
    text: "AI Background Remover",
    href: "/tools/image-tools/background-remover",
  },
  thirdCta: {
    text: "PDF to Word Converter",
    href: "/tools/pdf-tools/pdf-to-word-converter",
  },
  trustBadges: [
    { icon: "HiShieldCheck", text: "100% In-Browser Private" },
    { icon: "HiLockClosed", text: "No Files Stored on Servers" },
    { icon: "HiSparkles", text: "Free & Limitless" },
    { icon: "HiBolt", text: "Instant WebAssembly Speed" },
  ],
  toolChips: [
    { label: "AI Background Remover", href: "/tools/image-tools/background-remover" },
    { label: "Batch Image Compressor", href: "/tools/image-tools/image-compressor" },
    { label: "PDF to Word Converter", href: "/tools/pdf-tools/pdf-to-word-converter" },
    { label: "Google SERP Simulator", href: "/tools/seo-tools/google-serp-snippet-simulator" },
    { label: "Merge PDF Online", href: "/tools/pdf-tools/merge-pdf" },
    { label: "Device Mockup Generator", href: "/tools/image-tools/screenshot-device-mockup-generator" },
    { label: "JSON Formatter", href: "/tools/developer-tools/json-formatter" },
  ],
};
