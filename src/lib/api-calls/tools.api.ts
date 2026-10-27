import { ToolItem } from "@/app/(public)/tools/tools.config";
import { api } from "@/lib/api/api";
import { toNumber } from "../api/apiHelpers";
import { Recommendations } from "@/components/tool-sugggestion/ToolSuggestions"

export type AllToolsResponse = {
  categories: {
    slug: string;
    category_name: string | null;
    page_title: string;
    page_description: string;
  }[];
  tools: ToolItem[];
};

export type ToolPageDTO = {
  image_url: any;
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  tool_type: string;
  tags?: string[];
  short_description?: string;
  access_level: "free" | "premium" | "pro" | "enterprise";
  daily_limit: number | null;
  monthly_limit: number | null;
  views: number | string;
  users_count: number | string;
  page_title: string;
  page_intro: string;
  long_content?: string;
  features: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  schema_markup?: Record<string, unknown>;
  noindex?: boolean;
  recommendations?: Recommendations;
};

type ToolPageApiResponse = {
  success: boolean;
  message: string;
  data: ToolPageDTO;
};

// ── Fallback Tool Pages (for client tools before CMS/DB seeding) ───────────
export const FALLBACK_TOOL_PAGES: Record<string, ToolPageDTO> = {
  "svg-to-png": {
    id: "svg-to-png",
    title: "SVG to PNG Converter",
    slug: "svg-to-png",
    category_slug: "image-tools",
    tool_type: "svg-to-png",
    page_title: "SVG to PNG Converter - Free Online Vector to High-Res PNG Tool",
    page_intro: "Convert SVG vector files or raw SVG markup to crisp, high-resolution PNG images. Choose custom resolution multipliers, transparency, or solid backgrounds.",
    short_description: "Convert SVG vector files or raw SVG markup to high-resolution PNG images with transparent or solid backgrounds.",
    tags: ["svg", "png", "converter", "vector", "rasterize", "image"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 1250,
    users_count: 850,
    image_url: null,
    features: [
      { title: "Infinite Crisp Scaling", description: "Export at 1x, 2x (Retina), 4x (4K Ultra HD), 8x (Print), or custom pixel dimensions without pixelation." },
      { title: "Direct SVG Code Paste", description: "Paste raw <svg> markup directly from Figma, Illustrator, or code with instant live preview." },
      { title: "Batch SVG Processing", description: "Convert multiple SVG files in one click and download them all bundled in a single ZIP file." },
      { title: "Custom Backgrounds", description: "Keep vector transparency or apply clean white, dark, or custom hex background colors." },
      { title: "100% Client-Side Privacy", description: "Your files never leave your browser. All conversion happens locally for maximum speed and security." }
    ],
    faqs: [
      { question: "How does SVG to PNG conversion work?", answer: "The tool loads your SVG vector markup into a high-resolution HTML5 Canvas at your chosen scale factor and renders it cleanly into lossless PNG format." },
      { question: "Will my images lose quality when converted?", answer: "No. Because SVG is vector-based, you can scale it up to 2x, 4x, 8x, or custom large pixel dimensions without any loss in clarity or crispness." },
      { question: "Is my data uploaded to any server?", answer: "No. All conversions happen entirely inside your web browser. No files are ever sent over the network." }
    ]
  },
  "image-cropper": {
    id: "image-cropper",
    title: "Image Cropper & Circle Avatar Maker",
    slug: "image-cropper",
    category_slug: "image-tools",
    tool_type: "image-cropper",
    page_title: "Free Online Image Cropper & Circle Avatar Maker",
    page_intro: "Crop pictures with custom aspect ratios (1:1, 16:9, 4:3, 9:16) or generate round profile avatars with stylish gradient rings for LinkedIn, Twitter, Discord, and Instagram.",
    short_description: "Crop photos to exact aspect ratios or create circular profile avatars with borders.",
    tags: ["cropper", "avatar", "circle-crop", "profile-picture", "image-editor"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 2450,
    users_count: 1720,
    image_url: null,
    features: [
      { title: "Circular Avatar Mode", description: "Crop photos into perfect circles with live social media previews (large profile, medium card, small chat bubble)." },
      { title: "Custom Profile Rings", description: "Add solid or vibrant Instagram-style gradient border rings with adjustable thickness." },
      { title: "Popular Aspect Ratios", description: "Instant 1-click crop presets for 1:1 Square, 16:9 Banner, 4:3 Standard, 9:16 Story/Reels, and Freeform." },
      { title: "Rotate, Flip & Zoom", description: "Fix mirrored front-camera selfies with 1-click flip, rotate in 90-degree increments, and zoom in with precision." },
      { title: "Multi-Format Export", description: "Save as transparent circular PNG, compressed WebP, or high-quality JPG directly to your device." }
    ],
    faqs: [
      { question: "Can I create a transparent circular PNG avatar?", answer: "Yes! In Circle Avatar Mode, select the PNG format to export with a transparent background outside the circle." },
      { question: "Which aspect ratio should I use for Instagram Stories or TikTok?", answer: "Select the '9:16 Story/Reels' preset to crop your image to the standard vertical aspect ratio." },
      { question: "Are my photos uploaded to a server?", answer: "No. All cropping and image manipulation is processed 100% locally in your web browser using HTML5 Canvas." }
    ]
  },
  "circle-avatar-maker": {
    id: "circle-avatar-maker",
    title: "Circle Avatar Maker",
    slug: "circle-avatar-maker",
    category_slug: "image-tools",
    tool_type: "circle-avatar-maker",
    page_title: "Circle Avatar Maker - Create Round Profile Pictures with Borders",
    page_intro: "Create circular profile photos with custom border rings for LinkedIn, Twitter, Discord, and Instagram.",
    short_description: "Create round profile pictures with borders and gradient rings.",
    tags: ["avatar", "circle-crop", "profile-picture", "instagram", "discord"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 1890,
    users_count: 1240,
    image_url: null,
    features: [
      { title: "Circular Avatar Mode", description: "Crop photos into perfect circles with live social media previews." },
      { title: "Custom Profile Rings", description: "Add solid or vibrant Instagram-style gradient border rings." },
      { title: "Rotate, Flip & Zoom", description: "Rotate in 90-degree increments, flip horizontally, and zoom in with precision." }
    ],
    faqs: [
      { question: "Can I create a transparent circular PNG avatar?", answer: "Yes! In Circle Avatar Mode, select the PNG format to export with a transparent background outside the circle." }
    ]
  },
  "bulk-image-watermark-adder": {
    id: "bulk-image-watermark-adder",
    title: "Bulk Image Watermark Adder",
    slug: "bulk-image-watermark-adder",
    category_slug: "image-tools",
    tool_type: "bulk-image-watermark-adder",
    page_title: "Bulk Image Watermark Adder - Protect Photos Online for Free",
    page_intro: "Watermark multiple photos at once with custom text or company logos. Choose 9-point placement or repeated diagonal tile patterns, and download everything as a ZIP file.",
    short_description: "Add text or logo watermarks to multiple photos in bulk with 9-point placement or tile patterns.",
    tags: ["watermark", "bulk-watermark", "protect-photos", "logo-watermark", "image-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 3100,
    users_count: 2280,
    image_url: null,
    features: [
      { title: "Dual Watermark Modes", description: "Apply custom typography text watermarks or upload PNG/SVG company logos with transparency." },
      { title: "9-Point Grid & Tile Patterns", description: "Anchor watermarks to corners, center, or edges, or repeat across the whole canvas in a diagonal tile grid." },
      { title: "Batch Processing & ZIP Export", description: "Watermark up to 30 images simultaneously and download them all packaged in a single ZIP file." },
      { title: "Live Real-Time Preview", description: "Instantly see how the watermark looks on every image in your gallery before exporting." },
      { title: "100% Client-Side Privacy", description: "Your original photos and proprietary logos never touch an external server." }
    ],
    faqs: [
      { question: "Can I upload my own company logo as a watermark?", answer: "Yes! Switch to the 'Logo Watermark' tab and upload your transparent PNG or SVG logo." },
      { question: "What is the tile pattern watermark mode?", answer: "Tile pattern mode repeats your watermark diagonally across the entire surface of the image, offering the strongest copyright protection against unauthorized cropping." },
      { question: "How many images can I watermark at once?", answer: "You can upload and process up to 30 images in a single batch and download them all together in a ZIP file." }
    ]
  },
  "exif-data-viewer-and-stripper": {
    id: "exif-data-viewer-and-stripper",
    title: "EXIF Data Viewer & Stripper",
    slug: "exif-data-viewer-and-stripper",
    category_slug: "image-tools",
    tool_type: "exif-data-viewer-and-stripper",
    page_title: "Free EXIF Data Viewer & Stripper Online",
    page_intro: "Inspect hidden camera specifications, exposure settings, and GPS geotags from photos, or strip 100% of metadata with 1-click for ultimate privacy.",
    short_description: "View hidden camera metadata and GPS coordinates, or strip EXIF data before sharing online.",
    tags: ["exif", "metadata", "privacy", "gps", "camera-settings", "image-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 1950,
    users_count: 1420,
    image_url: null,
    features: [
      { title: "Deep EXIF Extraction", description: "Detects camera make, model, lens, ISO, shutter speed, aperture, focal length, flash, and timestamps." },
      { title: "GPS Location & Google Maps", description: "Extracts embedded latitude and longitude coordinates with direct links to Google Maps." },
      { title: "1-Click Privacy Cleaner", description: "Removes all EXIF metadata, camera serial numbers, and device fingerprints." },
      { title: "Bulk Cleaning & ZIP Export", description: "Strip metadata from multiple photos at once and download clean files as a ZIP archive." },
      { title: "100% Client-Side Privacy", description: "Photos are parsed locally in your browser memory — nothing is uploaded to any server." }
    ],
    faqs: [
      { question: "What is EXIF data?", answer: "EXIF (Exchangeable Image File Format) is hidden metadata saved inside photos containing your camera model, exposure settings, capture date, and often exact GPS coordinates." },
      { question: "Why should I strip EXIF data before sharing?", answer: "Photos taken on smartphones and digital cameras frequently embed your home or current GPS location, device serial numbers, and personal identifiers. Stripping EXIF protects your privacy." },
      { question: "Does stripping EXIF reduce image quality?", answer: "No. The visual image pixels remain virtually identical while all non-visual metadata tags are discarded." }
    ]
  },
  "screenshot-device-mockup-generator": {
    id: "screenshot-device-mockup-generator",
    title: "Screenshot Device Mockup Generator",
    slug: "screenshot-device-mockup-generator",
    category_slug: "image-tools",
    tool_type: "screenshot-device-mockup-generator",
    page_title: "Free Screenshot Device Mockup Generator Online",
    page_intro: "Transform everyday screenshots into presentation-ready product mockups. Choose modern macOS browser tabs, iPhones, MacBooks, tablets, or floating glass cards with gradient backdrops.",
    short_description: "Wrap your screenshots inside beautiful browser tabs, iPhones, MacBooks, and gradient backdrops.",
    tags: ["mockup", "screenshot", "device-mockup", "browser-mockup", "product-hunt", "image-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 4200,
    users_count: 2950,
    image_url: null,
    features: [
      { title: "Multiple Device Frames", description: "Wrap screenshots in macOS browser windows with traffic lights, iPhones with Dynamic Island, MacBooks, iPads, or minimal floating cards." },
      { title: "Curated Gradient Backdrops", description: "Select from vibrant gradient palettes, solid minimalist tones, or transparent PNG export." },
      { title: "Customizable Browser Chrome", description: "Add a personalized domain URL, toggle lock icons, and switch between light and dark header bars." },
      { title: "Social Aspect Ratio Presets", description: "Instant 1-click export for 16:9 Twitter/Dribbble, 1:1 Instagram, 4:3 Product Hunt, or Auto-fit." },
      { title: "Retina PNG Export", description: "Renders super-crisp 2x high-resolution mockups directly in your browser." }
    ],
    faqs: [
      { question: "What formats can I export my mockup in?", answer: "You can download ultra-crisp lossless PNG images with high pixel density, or copy directly to your clipboard for instant pasting into Twitter, Figma, or Slack." },
      { question: "Can I export a mockup with a transparent background?", answer: "Yes! In the Backdrop Canvas section, select 'transparent' to export just the framed device without any background." },
      { question: "Are my screenshots private?", answer: "Yes, 100%. All mockup framing, gradient generation, and canvas rendering happens directly inside your web browser. No screenshots are ever sent to an external server." }
    ]
  },
  "online-meme-generator": {
    id: "online-meme-generator",
    title: "Online Meme Generator",
    slug: "online-meme-generator",
    category_slug: "image-tools",
    tool_type: "online-meme-generator",
    page_title: "Free Online Meme Generator - Create Classic & Modern Memes",
    page_intro: "Create hilarious viral memes with classic top and bottom text overlays or modern Twitter/Reddit header style captions. Choose starter templates or upload any photo.",
    short_description: "Create classic top/bottom memes or modern Twitter/Reddit header memes with templates or custom photos.",
    tags: ["meme", "meme-generator", "funny", "impact-font", "viral-content", "image-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 5600,
    users_count: 4120,
    image_url: null,
    features: [
      { title: "Classic & Modern Styles", description: "Switch between classic bold Impact text on image overlays or modern Twitter/Instagram white header captions." },
      { title: "Built-in Popular Templates", description: "Start instantly with Drake, Two Buttons, and Dramatic Look templates, or upload any custom photo." },
      { title: "Customizable Typography", description: "Select from Impact, Arial, Comic Sans, or Montserrat fonts with color pickers and adjustable outline stroke widths." },
      { title: "Real-time Instant Preview", description: "See your meme update in real-time on every keystroke and font slider adjustment." },
      { title: "1-Click Download & Clipboard", description: "Download high-resolution PNGs or copy directly to your clipboard for quick sharing." }
    ],
    faqs: [
      { question: "What is the difference between Classic and Modern meme styles?", answer: "Classic style places bold white text with black outlines directly on top and bottom of the picture. Modern style creates a clean white or dark header box above the image (like Twitter/Instagram screenshots)." },
      { question: "Can I use my own photos to make memes?", answer: "Yes! Click '+ Upload Custom Photo' to upload any JPG, PNG, or WebP picture from your device." },
      { question: "Is this meme generator completely free and watermark-free?", answer: "Yes, 100% free with no annoying watermarks added to your memes." }
    ]
  },
  "google-serp-snippet-simulator": {
    id: "google-serp-snippet-simulator",
    title: "Google SERP Snippet Simulator",
    slug: "google-serp-snippet-simulator",
    category_slug: "seo-tools",
    tool_type: "google-serp-snippet-simulator",
    page_title: "Free Google SERP Snippet Simulator & Pixel Width Calculator",
    page_intro: "Simulate how your meta titles and descriptions will look in Google Search on desktop and mobile. Calculate exact pixel widths, prevent snippet truncation, and preview rich star ratings.",
    short_description: "Simulate Google search results for desktop and mobile with live pixel width counters and rich snippets.",
    tags: ["serp", "google-simulator", "meta-tags", "pixel-width", "ctr", "seo-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 3800,
    users_count: 2640,
    image_url: null,
    features: [
      { title: "Desktop & Mobile Simulation", description: "Accurately preview how your snippet appears on desktop browsers vs mobile search cards." },
      { title: "Pixel Width Calculation", description: "Calculates Google's ~600px desktop title limit and ~960px description limit in real-time." },
      { title: "Query Keyword Highlighting", description: "Bolds matched search query keywords within the snippet just like Google's live search algorithm." },
      { title: "Rich Star Rating Previews", description: "Test review counts and 5-star ratings to optimize click-through rates (CTR)." },
      { title: "1-Click HTML Meta Export", description: "Generates formatted <title>, <meta description>, and canonical tags ready to paste into your website." }
    ],
    faqs: [
      { question: "What is Google's pixel limit for title tags?", answer: "Google truncates titles at approximately 600 pixels on desktop (around 55 to 60 characters). On mobile devices, the limit is slightly narrower around 560 pixels." },
      { question: "Why do pixel widths matter more than character counts?", answer: "Characters like 'W' and 'M' take up significantly more horizontal space than 'I' or 'l'. Measuring pixel width gives the true representation of when Google will cut off your snippet." },
      { question: "Does this simulator support Google Dark Mode?", answer: "Yes! You can toggle between Google Light Mode (#ffffff) and Google Dark Mode (#202124) to see how your snippet looks in both themes." }
    ]
  },
  "schema-org-structured-data-generator": {
    id: "schema-org-structured-data-generator",
    title: "Schema.org Structured Data Generator",
    slug: "schema-org-structured-data-generator",
    category_slug: "seo-tools",
    tool_type: "schema-org-structured-data-generator",
    page_title: "Free Schema.org Structured Data Generator - JSON-LD Rich Snippets",
    page_intro: "Generate Google-compliant JSON-LD structured data markups for FAQPage, Articles, Products, Local Businesses, How-To guides, Breadcrumbs, and Events. Boost CTR with rich search snippets.",
    short_description: "Generate valid Google JSON-LD structured data for FAQs, Articles, Products, Local Business, How-To, and Events.",
    tags: ["schema", "structured-data", "json-ld", "rich-snippets", "faq-schema", "seo-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 4500,
    users_count: 3100,
    image_url: null,
    features: [
      { title: "7 Core Schema Types", description: "Generate JSON-LD markup for FAQPage, Article/Blog, Product, LocalBusiness, HowTo, BreadcrumbList, and Event." },
      { title: "Live Real-Time Syntax Builder", description: "Instant formatted JSON output updates as you type, with syntax validation." },
      { title: "Google Rich Snippet Visualizer", description: "Preview how your rich result (stars, pricing, FAQs, breadcrumbs) will look directly in Google Search." },
      { title: "1-Click Direct Testing", description: "Direct one-click launch into Google Rich Results Test and Schema.org Validator." },
      { title: "Script & Raw JSON Export", description: "Copy ready-to-paste <script type='application/ld+json'> tags, raw JSON, or download .jsonld files." }
    ],
    faqs: [
      { question: "What is Schema.org JSON-LD?", answer: "JSON-LD (JavaScript Object Notation for Linked Data) is Google's recommended format for adding structured data to web pages. It communicates the context and meaning of your content directly to search engine crawlers." },
      { question: "Where should I embed the generated JSON-LD code?", answer: "Paste the generated <script type=\"application/ld+json\"> snippet into either the <head> or <body> section of your page's HTML template." },
      { question: "How long does it take for Google to show rich snippets?", answer: "After publishing and submitting your URL to Google Search Console, Google typically indexes the structured data and displays rich snippets within a few days to a couple of weeks, provided your content complies with Google's Quality Guidelines." }
    ]
  },
  "keyword-density-n-gram-analyzer": {
    id: "keyword-density-n-gram-analyzer",
    title: "Keyword Density & N-Gram Analyzer",
    slug: "keyword-density-n-gram-analyzer",
    category_slug: "seo-tools",
    tool_type: "keyword-density-n-gram-analyzer",
    page_title: "Free Keyword Density & N-Gram Analyzer - Avoid Keyword Stuffing",
    page_intro: "Analyze 1-gram single words, 2-gram, 3-gram, and 4-gram keyphrases in your articles and copy. Filter stop words, detect over-optimization warnings, and export keyword CSV reports.",
    short_description: "Analyze keyword frequency and N-Gram density across 1 to 4 word phrases with stop-word filters.",
    tags: ["keyword-density", "n-gram", "keyword-stuffing", "seo-content", "content-optimization", "seo-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 4200,
    users_count: 2850,
    image_url: null,
    features: [
      { title: "1-Gram to 4-Gram Analysis", description: "Breaks down your text into single words, two-word, three-word, and four-word keyphrase clusters." },
      { title: "Stop Words Filtering", description: "Automatically excludes non-informative English stop-words like 'the', 'is', 'at', and 'and'." },
      { title: "Keyword Stuffing Warnings", description: "Color-coded alerts flag over-optimized words exceeding the recommended 2.5% to 3.5% density thresholds." },
      { title: "Interactive In-Text Highlighting", description: "Click any keyword in the results table to instantly highlight every occurrence in the editor." },
      { title: "CSV Data Export", description: "Export complete keyword counts and density percentages into CSV spreadsheets." }
    ],
    faqs: [
      { question: "What is an ideal keyword density for SEO?", answer: "Most SEO experts recommend maintaining a primary keyword density between 1.0% and 2.5%. Anything consistently exceeding 3.5% risks being flagged as keyword stuffing by Google's spam algorithms." },
      { question: "What are N-Grams in keyword analysis?", answer: "An N-gram is a continuous sequence of n items from a given text. A 1-gram is a single word, a 2-gram is a 2-word phrase (e.g. 'search engine'), and a 3-gram is a 3-word phrase (e.g. 'search engine optimization')." },
      { question: "Why is stop word filtering important?", answer: "Stop words like 'is', 'the', and 'in' naturally occur with high frequency. Filtering them out lets you focus on high-intent thematic keywords that search engines actually rank." }
    ]
  },
  "social-media-share-card-simulator": {
    id: "social-media-share-card-simulator",
    title: "Social Media Share Card Simulator",
    slug: "social-media-share-card-simulator",
    category_slug: "seo-tools",
    tool_type: "social-media-share-card-simulator",
    page_title: "Free Social Media Share Card Simulator - Open Graph & Twitter Cards",
    page_intro: "Preview how your links appear when shared on X (Twitter), Facebook, LinkedIn, Discord, and Slack. Test 1.91:1 image cropping, title character cutoffs, and export copy-paste meta tags.",
    short_description: "Simulate and design social share preview cards for Twitter/X, Facebook, LinkedIn, Discord, and Slack.",
    tags: ["open-graph", "twitter-card", "social-media", "facebook-og", "meta-tags", "seo-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 4800,
    users_count: 3250,
    image_url: null,
    features: [
      { title: "10 Major Platform Simulators", description: "Authentic real-time preview cards for Twitter/X, WhatsApp, Facebook, LinkedIn, Telegram, Reddit, Pinterest, Threads, Discord, and Slack." },
      { title: "Large & Summary Twitter Cards", description: "Toggle between 1200x630 summary_large_image and square 1:1 summary thumbnail layouts." },
      { title: "Local Image Upload & Aspect Ratio Meter", description: "Upload local image files or enter image URLs with live aspect ratio and dimension verification." },
      { title: "Truncation Warnings", description: "Character length monitors warn if titles exceed 70 characters or descriptions exceed 200 characters." },
      { title: "1-Click HTML Meta Export", description: "Instant copy-paste Open Graph and Twitter Card tags ready for your website <head>." }
    ],
    faqs: [
      { question: "What is the recommended size for an Open Graph image?", answer: "The optimal dimension for Facebook and Twitter/X large cards is 1200 × 630 pixels, which maintains an aspect ratio of approximately 1.91:1. This guarantees your image won't be cropped awkwardly." },
      { question: "Why doesn't my updated share image show up on social media immediately?", answer: "Social networks cache link previews. To force them to scrape the newest image, use Facebook's Sharing Debugger, Twitter's Card Validator, or LinkedIn's Post Inspector to refresh their cache." },
      { question: "Can I test local images before publishing my website?", answer: "Yes! Use the 'Upload Local Image' button to preview your graphic directly in the simulator without uploading it to an external server." }
    ]
  },
  "http-security-cache-headers-analyzer": {
    id: "http-security-cache-headers-analyzer",
    title: "HTTP Security & Cache Headers Analyzer",
    slug: "http-security-cache-headers-analyzer",
    category_slug: "seo-tools",
    tool_type: "http-security-cache-headers-analyzer",
    page_title: "Free HTTP Security & Cache Headers Analyzer - A+ Security Score",
    page_intro: "Inspect live HTTP response headers, evaluate Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), Cache-Control, ETag, and generate hardened server configurations.",
    short_description: "Audit HTTP response headers, security ratings (A+ to F), and caching policies with config generators.",
    tags: ["http-headers", "security-headers", "hsts", "csp", "cache-control", "seo-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 4100,
    users_count: 2780,
    image_url: null,
    features: [
      { title: "Security Rating (Grade A+ to F)", description: "Automated scoring of 6 critical security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy." },
      { title: "Cache & CDN Directives Audit", description: "Evaluates Cache-Control max-age, ETag, Last-Modified, and edge caching status (Cloudflare, Fastly, Vercel)." },
      { title: "Information Leakage Detection", description: "Flags vulnerable server version disclosures like Server and X-Powered-By." },
      { title: "Raw Headers & Manual Paste Mode", description: "Audit live URLs or paste raw HTTP response headers directly from DevTools or cURL." },
      { title: "1-Click Server Config Generator", description: "Generates hardened, copy-paste configurations for Nginx, Apache (.htaccess), Vercel, and Next.js." }
    ],
    faqs: [
      { question: "What are HTTP security headers and why do they matter for SEO?", answer: "HTTP security headers instruct web browsers how to handle your website's content securely. Google considers HTTPS, user safety, and protection against malicious script injection (XSS/Clickjacking) as essential ranking and trust signals." },
      { question: "What is HSTS (Strict-Transport-Security)?", answer: "HSTS tells browsers that your website must only be accessed over secure HTTPS connections. It protects your users against man-in-the-middle attacks and cookie hijacking." },
      { question: "How do cache headers affect SEO performance?", answer: "Effective Cache-Control and ETag headers allow returning visitors and search engine crawlers to load pages instantly from cache (or via lightweight 304 Not Modified responses), drastically improving Core Web Vitals (LCP/INP)." }
    ]
  },
  "hreflang-and-canonical-tag-generator": {
    id: "hreflang-and-canonical-tag-generator",
    title: "Hreflang & Canonical Tag Generator",
    slug: "hreflang-and-canonical-tag-generator",
    category_slug: "seo-tools",
    tool_type: "hreflang-and-canonical-tag-generator",
    page_title: "Free Hreflang & Canonical Tag Generator - Multi-Language SEO",
    page_intro: "Generate Google-compliant multi-language and multi-regional hreflang tags with self-referential canonical tags. Export in HTML head, XML sitemap, or HTTP response header formats.",
    short_description: "Build multi-language hreflang tags, self-referential canonicals, and XML sitemaps with ISO language codes.",
    tags: ["hreflang", "canonical", "international-seo", "multi-language", "xml-sitemap", "seo-tools"],
    access_level: "free",
    daily_limit: null,
    monthly_limit: null,
    views: 3900,
    users_count: 2650,
    image_url: null,
    features: [
      { title: "ISO 639-1 & ISO 3166-1 Selectors", description: "Built-in dropdown library for global languages and regional country codes (e.g., en-US, es-MX, de-DE)." },
      { title: "Automatic x-default Fallback", description: "Designate fallback default URLs for unhandled countries or language preferences." },
      { title: "Self-Referential Canonical Tagging", description: "Ensures every regional version maintains an aligned self-referential canonical tag to avoid duplicate penalties." },
      { title: "3 Output Formats", description: "Export as HTML <link rel='alternate'> tags, XML Sitemap <url> annotations, or HTTP response headers." },
      { title: "Real-Time Validation & Warnings", description: "Checks for duplicate hreflang codes, missing x-default tags, and invalid URL protocols." }
    ],
    faqs: [
      { question: "What is the purpose of the hreflang attribute?", answer: "The hreflang attribute tells search engines like Google which language and regional version of a webpage to serve to users based on their location and language preferences." },
      { question: "Why do I need a self-referential canonical tag with hreflang?", answer: "Google guidelines state that each language/regional page should point its canonical tag to itself (self-referential). If all regional versions point to the English page, Google may ignore your hreflang alternate tags." },
      { question: "What is the difference between HTML tags and XML Sitemap hreflang?", answer: "HTML link tags are embedded directly in the <head> of each page, which is ideal for smaller sites. XML Sitemap hreflang annotations keep your HTML lightweight and clean by moving all language mappings into your sitemap file." }
    ]
  }
};

// Client-side version (axios) — used by ToolPageClient and other client components
export async function fetchToolPage(
  category: string,
  slug: string,
): Promise<ToolPageDTO> {
  try {
    const res = await api.get<ToolPageApiResponse>(`/tools/${category}/${slug}`);
    if (res.success && res.data) {
      return normalizeToolPage(res.data);
    }
  } catch {
    // API failed or tool not yet in DB
  }
  if (FALLBACK_TOOL_PAGES[slug]) {
    return FALLBACK_TOOL_PAGES[slug];
  }
  throw new Error("Tool not found");
}

// Server component version — used in page.tsx for SSR/ISR
export async function fetchToolPageServer(
  category: string,
  slug: string,
): Promise<ToolPageDTO | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    if (base) {
      const res = await fetch(`${base}/tools/${category}/${slug}`, {
        next: { revalidate: 300 }, // 5 minutes
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return normalizeToolPage(json.data);
        }
      }
    }
  } catch (e) {
    console.error("[Server] fetchToolPageServer failed:", e);
  }

  // Return fallback if available
  return FALLBACK_TOOL_PAGES[slug] || null;
}

// ── Shared normalizer — keeps both versions consistent
function normalizeToolPage(data: ToolPageApiResponse["data"]): ToolPageDTO {
  return {
    ...data,
    views: Number(data.views) || 0,
    users_count: Number(data.users_count) || 0,
    tags: data.tags || [],
    features: data.features || [],
    faqs: data.faqs || [],
    meta_keywords: data.meta_keywords || [],
  };
}

// Redirect Checker Types
interface RedirectHop {
  url: string;
  statusCode: number;
  statusText: string;
  redirectType: string;
  responseTime: number;
  headers: Record<string, string>;
}

interface RedirectResult {
  originalUrl: string;
  finalUrl: string;
  redirectChain: RedirectHop[];
  totalRedirects: number;
  totalTime: number;
  hasIssues: boolean;
  issues: string[];
  timestamp: string;
}

export const checkRedirect = async (url: string): Promise<RedirectResult> => {
  return api
    .post<{
      success: boolean;
      data: RedirectResult;
    }>("/redirect-checker/check", { url })
    .then((res) => res.data);
};

// Fetch ALL tools across every category
export async function fetchAllTools(): Promise<AllToolsResponse> {
  let categories: AllToolsResponse["categories"] = [];
  let tools: ToolItem[] = [];

  try {
    const res = await api.get<{
      success: boolean;
      message: string;
      data: AllToolsResponse;
    }>("/tools/all");

    categories = res.data?.categories || [];
    tools = (res.data?.tools || []).map((tool: ToolItem) => ({
      ...tool,
      users_count: toNumber(tool.users_count),
      views: toNumber(tool.views),
      rating: toNumber(tool.rating),
    }));
  } catch (err) {
    console.warn("[fetchAllTools] API unavailable, using fallback list.", err);
  }

  // Merge client-registered fallback tools
  Object.values(FALLBACK_TOOL_PAGES).forEach((fb) => {
    if (!tools.some((t) => t.slug === fb.slug)) {
      tools.push({
        id: fb.id,
        title: fb.title,
        short_description: fb.short_description || "",
        slug: fb.slug,
        category_slug: fb.category_slug,
        badge: "new",
        tags: fb.tags || [],
        views: toNumber(fb.views),
        users_count: toNumber(fb.users_count),
        rating: 4.9,
        tool_url: `/tools/${fb.category_slug}/${fb.slug}`,
      });
    }
  });

  return {
    categories,
    tools,
  };
}

// Speed Test Types
export interface SpeedTestRequest {
  url: string;
}

export interface CWVMetric {
  value: number;
  display: string;
  score: number | null;
}

export interface DiagnosticMetric {
  value: number;
  display: string;
  score: number | null;
}

export interface SpeedRecommendation {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  savingsMs?: number;
  savingsBytes?: number;
  savingsDisplay?: string;
}

export interface SpeedTestResponse {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  totalSize: number;
  requests: number;
  imageSize: number;
  scriptSize: number;
  styleSize: number;
  score: number;
  grade: string;
  coreWebVitals: {
    lcp: CWVMetric;
    cls: CWVMetric;
    tbt: CWVMetric;
    fcp: CWVMetric;
    speedIndex: CWVMetric;
  };
  diagnostics: {
    ttfb: DiagnosticMetric;
    domSize: DiagnosticMetric;
    bootupTime: DiagnosticMetric;
    mainThreadWork: DiagnosticMetric;
    thirdPartyBytes: DiagnosticMetric;
  };
  recommendations: SpeedRecommendation[];
  passedAuditsCount: number;
}

export const toolsApi = {
  testWebsiteSpeed: async (
    data: SpeedTestRequest,
  ): Promise<SpeedTestResponse> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SpeedTestResponse;
    }>("/tools/speed-test", data);
    return response.data;
  },

  protectPdf: async (opts: {
    file: File;
    password: string;
    ownerPassword: string;
    allowPrint: boolean;
    allowCopy: boolean;
    allowModify: boolean;
  }): Promise<{ blob: Blob; fileName: string }> => {
    const { default: apiClient } = await import("@/lib/api/api");
    const formData = new FormData();
    formData.append("pdf", opts.file);
    formData.append("password", opts.password);
    formData.append("ownerPassword", opts.ownerPassword);
    formData.append("allowPrint", String(opts.allowPrint));
    formData.append("allowCopy", String(opts.allowCopy));
    formData.append("allowModify", String(opts.allowModify));

    const response = await apiClient.post("/tools/protect-pdf", formData, {
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"] || "";
    const nameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    const fileName = nameMatch
      ? nameMatch[1]
      : opts.file.name.replace(/\.pdf$/i, "_protected.pdf");

    const blob = new Blob([response.data], { type: "application/pdf" });
    return { blob, fileName };
  },

  unlockPdf: async (opts: {
    file: File;
    password: string;
  }): Promise<{ blob: Blob; fileName: string }> => {
    const { default: apiClient } = await import("@/lib/api/api");
    const formData = new FormData();
    formData.append("pdf", opts.file);
    formData.append("password", opts.password);

    const response = await apiClient.post("/tools/unlock-pdf", formData, {
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"] || "";
    const nameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    const fileName = nameMatch
      ? nameMatch[1]
      : opts.file.name.replace(/\.pdf$/i, "_unlocked.pdf");

    const blob = new Blob([response.data], { type: "application/pdf" });
    return { blob, fileName };
  },
};
