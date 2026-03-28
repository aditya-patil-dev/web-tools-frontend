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
  trustBadges: {
    icon: string;
    text: string;
  }[];
  toolChips?: ToolChip[]; // optional — API can send it or not
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  badge: "✦ 10,000+ tasks completed today",
  title: "Stop doing things the <span>slow way.</span>",
  subtitle:
    "Compress images, generate meta tags, format JSON, convert files — instantly. No sign-up, no limits, no friction.",
  primaryCta: {
    text: "Explore 40+ free tools →",
    href: "/tools",
  },
  secondaryCta: {
    text: "View Pricing",
    href: "/pricing",
  },
  trustBadges: [
    { icon: "BiSolidBolt", text: "Lightning Fast" },
    { icon: "FcUnlock", text: "100% Private (No Uploads)" },
    { icon: "PiLaptopFill", text: "No Account Required" },
  ],
  toolChips: [
    { label: "AI Background Remover", href: "/tools/image-tools/background-remover"},
    { label: "Image Compressor", href: "/tools/image-tools/image-compressor" },
    { label: "Meta Tag Generator", href: "/tools/seo-tools/meta-tag-generator" },
    { label: "JSON Formatter", href: "/tools/developer-tools/json-formatter" },
    { label: "PDF to Word", href: "/tools/pdf-tools/pdf-to-word-converter" },
    { label: "Website Speed Test", href: "/tools/seo-tools/website-speed-test" }
  ],
};
