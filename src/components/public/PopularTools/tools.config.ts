export type ToolItem = {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  category?: string;
};

export const POPULAR_TOOLS: ToolItem[] = [
  {
    "title": "AI Background Remover",
    "description": "Remove image backgrounds instantly with AI. High-precision cutout for transparent PNGs.",
    "href": "/tools/image-tools/background-remover",
    "icon": "LuEraser",
    "category": "AI",
    "badge": "AI POWERED",
  },
  {
    "title": "Batch Image Compressor",
    "description": "Reduce image file size up to 80% without losing quality. Optimized for WebP, PNG, and JPG.",
    "href": "/tools/image-tools/image-compressor",
    "icon": "LuImage",
    "category": "IMAGE",
    "badge": "FAST",
  },
  {
    "title": "PDF to Word Converter",
    "description": "Convert PDF to editable DOCX online. Maintain formatting and layout with 100% accuracy.",
    "href": "/tools/pdf-tools/pdf-to-word-converter",
    "icon": "LuFileType",
    "category": "PDF",
    "badge": "POPULAR",
  },
  {
    "title": "SEO Meta Tag Generator",
    "description": "Create high-CTR meta titles and descriptions. Includes Open Graph and Twitter Card previews.",
    "href": "/tools/seo-tools/meta-tag-generator",
    "icon": "LuTags",
    "category": "SEO",
    "badge": "TOP RATED",
  },
  {
    "title": "XML Sitemap Generator",
    "description": "Automatically crawl your site and generate a valid sitemap.xml for faster Google indexing.",
    "href": "/tools/seo-tools/sitemap-generator",
    "icon": "LuMap",
    "category": "SEO",
    "badge": "FREE",
  },
  {
    "title": "Privacy Robots.txt Generator",
    "description": "Guide search crawlers and protect private folders with a custom-built robots.txt file.",
    "href": "/tools/seo-tools/robots-txt-generator",
    "icon": "LuBot",
    "category": "SEO",
  }
];
