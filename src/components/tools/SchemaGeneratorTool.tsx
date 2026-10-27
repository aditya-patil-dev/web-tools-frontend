"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
  FiCode,
  FiCopy,
  FiCheck,
  FiDownload,
  FiExternalLink,
  FiRefreshCw,
  FiPlus,
  FiTrash2,
  FiHelpCircle,
  FiFileText,
  FiShoppingBag,
  FiMapPin,
  FiList,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";

type SchemaType =
  | "faq"
  | "article"
  | "product"
  | "local-business"
  | "howto"
  | "breadcrumb"
  | "event";

interface FaqItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export default function SchemaGeneratorTool() {
  const [activeSchema, setActiveSchema] = useState<SchemaType>("faq");
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // ── FAQ State ─────────────────────────────────────────────────────────────
  const [faqItems, setFaqItems] = useState<FaqItem[]>([
    {
      question: "What is Schema.org structured data?",
      answer:
        "Schema.org is a collaborative, community activity with a mission to create, maintain, and promote schemas for structured data on the Internet. It helps search engines like Google understand your content.",
    },
    {
      question: "How does JSON-LD structured data help SEO?",
      answer:
        "JSON-LD structured data enables rich search results (rich snippets) such as FAQs, star ratings, product pricing, and breadcrumbs, which significantly boost organic click-through rates (CTR).",
    },
    {
      question: "Where should I place the generated script tag?",
      answer:
        "Place the generated <script type=\"application/ld+json\"> snippet inside the <head> or at the bottom of the <body> section of your HTML page.",
    },
  ]);

  // ── Article State ─────────────────────────────────────────────────────────
  const [articleSubtype, setArticleSubtype] = useState<string>("BlogPosting");
  const [articleHeadline, setArticleHeadline] = useState<string>(
    "Complete Guide to JSON-LD Structured Data in 2026"
  );
  const [articleDescription, setArticleDescription] = useState<string>(
    "Learn how to implement Schema.org structured data to unlock Google rich snippets and maximize search visibility."
  );
  const [articleUrl, setArticleUrl] = useState<string>(
    "https://fusiontools.in/blog/schema-structured-data-guide"
  );
  const [articleImage, setArticleImage] = useState<string>(
    "https://fusiontools.in/images/schema-guide-banner.jpg"
  );
  const [articleAuthorType, setArticleAuthorType] = useState<"Person" | "Organization">("Person");
  const [articleAuthorName, setArticleAuthorName] = useState<string>("Aditya Sharma");
  const [articleAuthorUrl, setArticleAuthorUrl] = useState<string>("https://fusiontools.in/author/aditya");
  const [articlePublisherName, setArticlePublisherName] = useState<string>("Fusion Tools");
  const [articlePublisherLogo, setArticlePublisherLogo] = useState<string>(
    "https://fusiontools.in/logo.png"
  );
  const [articleDatePublished, setArticleDatePublished] = useState<string>("2026-10-25");
  const [articleDateModified, setArticleDateModified] = useState<string>("2026-10-25");

  // ── Product State ─────────────────────────────────────────────────────────
  const [productName, setProductName] = useState<string>(
    "Ergonomic Wireless Mechanical Keyboard"
  );
  const [productDescription, setProductDescription] = useState<string>(
    "Custom hot-swappable Bluetooth mechanical keyboard with RGB backlighting, low latency, and 80-hour battery life."
  );
  const [productImage, setProductImage] = useState<string>(
    "https://fusiontools.in/images/product-keyboard.jpg"
  );
  const [productBrand, setProductBrand] = useState<string>("Fusion Gear");
  const [productSku, setProductSku] = useState<string>("KB-WL-2026-RGB");
  const [productPrice, setProductPrice] = useState<string>("89.99");
  const [productCurrency, setProductCurrency] = useState<string>("USD");
  const [productAvailability, setProductAvailability] = useState<string>("InStock");
  const [productRating, setProductRating] = useState<string>("4.8");
  const [productReviewCount, setProductReviewCount] = useState<string>("124");
  const [productPriceValidUntil, setProductPriceValidUntil] = useState<string>("2027-12-31");

  // ── Local Business State ──────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState<string>("LocalBusiness");
  const [businessName, setBusinessName] = useState<string>("Fusion Tech Hub");
  const [businessImage, setBusinessImage] = useState<string>(
    "https://fusiontools.in/images/office-storefront.jpg"
  );
  const [businessUrl, setBusinessUrl] = useState<string>("https://fusiontools.in");
  const [businessPhone, setBusinessPhone] = useState<string>("+1-800-555-0199");
  const [businessEmail, setBusinessEmail] = useState<string>("contact@fusiontools.in");
  const [businessPriceRange, setBusinessPriceRange] = useState<string>("$$");
  const [businessStreet, setBusinessStreet] = useState<string>("100 Innovation Way, Suite 400");
  const [businessCity, setBusinessCity] = useState<string>("San Francisco");
  const [businessState, setBusinessState] = useState<string>("CA");
  const [businessPostalCode, setBusinessPostalCode] = useState<string>("94105");
  const [businessCountry, setBusinessCountry] = useState<string>("US");
  const [businessOpeningDays, setBusinessOpeningDays] = useState<string>("Mo,Tu,We,Th,Fr");
  const [businessOpens, setBusinessOpens] = useState<string>("09:00");
  const [businessCloses, setBusinessCloses] = useState<string>("18:00");
  const [businessLat, setBusinessLat] = useState<string>("37.7749");
  const [businessLng, setBusinessLng] = useState<string>("-122.4194");

  // ── HowTo State ───────────────────────────────────────────────────────────
  const [howToName, setHowToName] = useState<string>(
    "How to Implement JSON-LD Structured Data on Your Website"
  );
  const [howToDescription, setHowToDescription] = useState<string>(
    "A step-by-step tutorial on generating Schema.org JSON-LD scripts and pasting them into your website to gain rich snippets in Google."
  );
  const [howToTotalTime, setHowToTotalTime] = useState<string>("PT10M");
  const [howToCost, setHowToCost] = useState<string>("0");
  const [howToCurrency, setHowToCurrency] = useState<string>("USD");
  const [howToSteps, setHowToSteps] = useState<HowToStep[]>([
    {
      name: "Select your schema type",
      text: "Choose the appropriate Schema.org type (FAQ, Article, Product, or Local Business) matching your page's content.",
    },
    {
      name: "Fill in the required information",
      text: "Enter titles, descriptions, URLs, images, and prices in the generator form.",
    },
    {
      name: "Copy and paste into your HTML",
      text: "Copy the generated script tag and embed it into your page head or body.",
    },
  ]);

  // ── Breadcrumb State ──────────────────────────────────────────────────────
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: "Home", url: "https://fusiontools.in" },
    { name: "SEO Tools", url: "https://fusiontools.in/tools/seo-tools" },
    {
      name: "Schema Generator",
      url: "https://fusiontools.in/tools/seo-tools/schema-generator",
    },
  ]);

  // ── Event State ───────────────────────────────────────────────────────────
  const [eventName, setEventName] = useState<string>(
    "SEO & Web Performance Masterclass 2026"
  );
  const [eventDescription, setEventDescription] = useState<string>(
    "Join top industry experts to learn advanced Core Web Vitals optimization, Schema markup, and modern search indexing strategies."
  );
  const [eventStartDate, setEventStartDate] = useState<string>("2026-11-15T10:00");
  const [eventEndDate, setEventEndDate] = useState<string>("2026-11-15T17:00");
  const [eventAttendanceMode, setEventAttendanceMode] = useState<string>(
    "OfflineEventAttendanceMode"
  );
  const [eventStatus, setEventStatus] = useState<string>("EventScheduled");
  const [eventLocationName, setEventLocationName] = useState<string>(
    "Moscone Convention Center"
  );
  const [eventLocationAddress, setEventLocationAddress] = useState<string>(
    "747 Howard St, San Francisco, CA 94103"
  );
  const [eventOrganizerName, setEventOrganizerName] = useState<string>("Fusion Tools Academy");
  const [eventTicketPrice, setEventTicketPrice] = useState<string>("49.00");
  const [eventTicketCurrency, setEventTicketCurrency] = useState<string>("USD");
  const [eventTicketUrl, setEventTicketUrl] = useState<string>(
    "https://fusiontools.in/events/masterclass-2026/tickets"
  );

  // ── Generate JSON-LD Object Based on Schema Type ──────────────────────────
  const generatedSchemaObject = useMemo(() => {
    switch (activeSchema) {
      case "faq":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems
            .filter((item) => item.question.trim())
            .map((item) => ({
              "@type": "Question",
              name: item.question.trim(),
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer.trim(),
              },
            })),
        };

      case "article": {
        const schema: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": articleSubtype,
          headline: articleHeadline,
          description: articleDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },
          author: {
            "@type": articleAuthorType,
            name: articleAuthorName,
            ...(articleAuthorUrl ? { url: articleAuthorUrl } : {}),
          },
          publisher: {
            "@type": "Organization",
            name: articlePublisherName,
            ...(articlePublisherLogo
              ? {
                  logo: {
                    "@type": "ImageObject",
                    url: articlePublisherLogo,
                  },
                }
              : {}),
          },
          datePublished: articleDatePublished,
          dateModified: articleDateModified || articleDatePublished,
        };
        if (articleImage) {
          schema.image = [articleImage];
        }
        return schema;
      }

      case "product": {
        const schema: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: productName,
          description: productDescription,
          ...(productImage ? { image: [productImage] } : {}),
          ...(productBrand
            ? {
                brand: {
                  "@type": "Brand",
                  name: productBrand,
                },
              }
            : {}),
          ...(productSku ? { sku: productSku } : {}),
          offers: {
            "@type": "Offer",
            url: articleUrl || "https://example.com/product",
            priceCurrency: productCurrency,
            price: productPrice,
            priceValidUntil: productPriceValidUntil,
            availability: `https://schema.org/${productAvailability}`,
            itemCondition: "https://schema.org/NewCondition",
          },
        };
        if (productRating && productReviewCount) {
          schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: parseFloat(productRating) || 5,
            reviewCount: parseInt(productReviewCount, 10) || 1,
            bestRating: 5,
            worstRating: 1,
          };
        }
        return schema;
      }

      case "local-business": {
        const schema: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": businessType,
          name: businessName,
          ...(businessImage ? { image: businessImage } : {}),
          ...(businessUrl ? { url: businessUrl } : {}),
          ...(businessPhone ? { telephone: businessPhone } : {}),
          ...(businessEmail ? { email: businessEmail } : {}),
          ...(businessPriceRange ? { priceRange: businessPriceRange } : {}),
          address: {
            "@type": "PostalAddress",
            streetAddress: businessStreet,
            addressLocality: businessCity,
            addressRegion: businessState,
            postalCode: businessPostalCode,
            addressCountry: businessCountry,
          },
        };
        if (businessOpens && businessCloses) {
          schema.openingHoursSpecification = [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: businessOpeningDays.split(",").map((d) => d.trim()),
              opens: businessOpens,
              closes: businessCloses,
            },
          ];
        }
        if (businessLat && businessLng) {
          schema.geo = {
            "@type": "GeoCoordinates",
            latitude: parseFloat(businessLat) || 0,
            longitude: parseFloat(businessLng) || 0,
          };
        }
        return schema;
      }

      case "howto": {
        return {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: howToName,
          description: howToDescription,
          ...(howToTotalTime ? { totalTime: howToTotalTime } : {}),
          ...(howToCost
            ? {
                estimatedCost: {
                  "@type": "MonetaryAmount",
                  currency: howToCurrency,
                  value: howToCost,
                },
              }
            : {}),
          step: howToSteps
            .filter((s) => s.name.trim() || s.text.trim())
            .map((s, idx) => ({
              "@type": "HowToStep",
              position: idx + 1,
              name: s.name.trim(),
              text: s.text.trim(),
              ...(s.image ? { image: s.image } : {}),
              ...(s.url ? { url: s.url } : {}),
            })),
        };
      }

      case "breadcrumb": {
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs
            .filter((b) => b.name.trim() && b.url.trim())
            .map((b, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              name: b.name.trim(),
              item: b.url.trim(),
            })),
        };
      }

      case "event": {
        return {
          "@context": "https://schema.org",
          "@type": "Event",
          name: eventName,
          description: eventDescription,
          startDate: eventStartDate,
          endDate: eventEndDate,
          eventAttendanceMode: `https://schema.org/${eventAttendanceMode}`,
          eventStatus: `https://schema.org/${eventStatus}`,
          location: {
            "@type": "Place",
            name: eventLocationName,
            address: {
              "@type": "PostalAddress",
              streetAddress: eventLocationAddress,
            },
          },
          organizer: {
            "@type": "Organization",
            name: eventOrganizerName,
          },
          offers: {
            "@type": "Offer",
            url: eventTicketUrl,
            price: eventTicketPrice,
            priceCurrency: eventTicketCurrency,
            availability: "https://schema.org/InStock",
            validFrom: new Date().toISOString().split("T")[0],
          },
        };
      }

      default:
        return {};
    }
  }, [
    activeSchema,
    faqItems,
    articleSubtype,
    articleHeadline,
    articleDescription,
    articleUrl,
    articleImage,
    articleAuthorType,
    articleAuthorName,
    articleAuthorUrl,
    articlePublisherName,
    articlePublisherLogo,
    articleDatePublished,
    articleDateModified,
    productName,
    productDescription,
    productImage,
    productBrand,
    productSku,
    productPrice,
    productCurrency,
    productAvailability,
    productRating,
    productReviewCount,
    productPriceValidUntil,
    businessType,
    businessName,
    businessImage,
    businessUrl,
    businessPhone,
    businessEmail,
    businessPriceRange,
    businessStreet,
    businessCity,
    businessState,
    businessPostalCode,
    businessCountry,
    businessOpeningDays,
    businessOpens,
    businessCloses,
    businessLat,
    businessLng,
    howToName,
    howToDescription,
    howToTotalTime,
    howToCost,
    howToCurrency,
    howToSteps,
    breadcrumbs,
    eventName,
    eventDescription,
    eventStartDate,
    eventEndDate,
    eventAttendanceMode,
    eventStatus,
    eventLocationName,
    eventLocationAddress,
    eventOrganizerName,
    eventTicketPrice,
    eventTicketCurrency,
    eventTicketUrl,
  ]);

  // JSON strings
  const jsonString = useMemo(() => {
    return JSON.stringify(generatedSchemaObject, null, 2);
  }, [generatedSchemaObject]);

  const scriptTagString = useMemo(() => {
    return `<script type="application/ld+json">\n${jsonString}\n</script>`;
  }, [jsonString]);

  // Copy Handlers
  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptTagString);
    setCopiedScript(true);
    toast.success("Copied HTML <script> tag to clipboard!", "Copied");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    toast.success("Copied raw JSON-LD to clipboard!", "Copied");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptTagString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema-${activeSchema}.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded schema.jsonld file!", "Downloaded");
  };

  const handleOpenGoogleTester = () => {
    window.open("https://search.google.com/test/rich-results", "_blank");
  };

  const handleOpenSchemaValidator = () => {
    window.open("https://validator.schema.org/", "_blank");
  };

  // Schema Tab Buttons Configuration
  const schemaTabs: { id: SchemaType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "faq", label: "FAQ Page", icon: <FiHelpCircle />, badge: "High CTR" },
    { id: "article", label: "Article / Blog", icon: <FiFileText /> },
    { id: "product", label: "Product & Offer", icon: <FiShoppingBag />, badge: "Rich Star" },
    { id: "local-business", label: "Local Business", icon: <FiMapPin /> },
    { id: "howto", label: "How-To Guide", icon: <FiList /> },
    { id: "breadcrumb", label: "Breadcrumb", icon: <FiLayers /> },
    { id: "event", label: "Event", icon: <FiCalendar /> },
  ];

  return (
    <motion.div
      className="tool-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Info Banner ──────────────────────────────────────────────── */}
      <div className="tool-info-banner">
        <FiCode />
        <p>
          Generate valid Google-approved Schema.org JSON-LD structured data. Choose a schema type,
          fill in your content, and paste the generated script into your website to qualify for rich
          search snippets and higher CTR.
        </p>
      </div>

      {/* ── Schema Type Selector Tabs ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 20,
          marginBottom: 24,
          padding: 6,
          background: "rgba(15, 23, 42, 0.6)",
          borderRadius: 14,
          border: "1px solid #334155",
        }}
      >
        {schemaTabs.map((tab) => {
          const isActive = activeSchema === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSchema(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "#94a3b8",
                background: isActive ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none",
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: isActive ? "rgba(255, 255, 255, 0.25)" : "rgba(59, 130, 246, 0.2)",
                    color: isActive ? "#ffffff" : "#60a5fa",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── Left Column: Schema Form Inputs ─────────────────────────── */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 16,
            border: "1px solid #334155",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #334155",
              paddingBottom: 14,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#f8fafc",
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: 0,
              }}
            >
              <FiFileText style={{ color: "#38bdf8" }} />
              {schemaTabs.find((t) => t.id === activeSchema)?.label} Fields
            </h3>
            <span style={{ fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
              <FiCheckCircle /> Schema.org v15+ Valid
            </span>
          </div>

          {/* ── TAB 1: FAQ FORM ── */}
          {activeSchema === "faq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                FAQPage schema qualifies your page for expandable question dropdowns right in Google
                Search results.
              </p>

              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 12,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>
                      Question #{index + 1}
                    </span>
                    {faqItems.length > 1 && (
                      <button
                        onClick={() => setFaqItems(faqItems.filter((_, i) => i !== index))}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                        }}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#cbd5e1", marginBottom: 4 }}>
                      Question Title *
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...faqItems];
                        updated[index].question = e.target.value;
                        setFaqItems(updated);
                      }}
                      placeholder="e.g. How does this service work?"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#cbd5e1", marginBottom: 4 }}>
                      Answer Text *
                    </label>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...faqItems];
                        updated[index].answer = e.target.value;
                        setFaqItems(updated);
                      }}
                      placeholder="e.g. Enter a comprehensive answer..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  border: "1px dashed #3b82f6",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
              >
                <FiPlus /> Add Another Question
              </button>
            </div>
          )}

          {/* ── TAB 2: ARTICLE FORM ── */}
          {activeSchema === "article" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Article Subtype</label>
                  <select
                    value={articleSubtype}
                    onChange={(e) => setArticleSubtype(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="Article">Standard Article</option>
                    <option value="BlogPosting">Blog Posting</option>
                    <option value="NewsArticle">News Article</option>
                    <option value="TechArticle">Tech Article</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Author Type</label>
                  <select
                    value={articleAuthorType}
                    onChange={(e) => setArticleAuthorType(e.target.value as "Person" | "Organization")}
                    style={inputStyle}
                  >
                    <option value="Person">Person</option>
                    <option value="Organization">Organization</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Headline / Article Title *</label>
                <input
                  type="text"
                  value={articleHeadline}
                  onChange={(e) => setArticleHeadline(e.target.value)}
                  placeholder="e.g. Master Guide to SEO"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description / Summary</label>
                <textarea
                  rows={2}
                  value={articleDescription}
                  onChange={(e) => setArticleDescription(e.target.value)}
                  placeholder="Summary of the article..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Author Name *</label>
                  <input
                    type="text"
                    value={articleAuthorName}
                    onChange={(e) => setArticleAuthorName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Publisher Name *</label>
                  <input
                    type="text"
                    value={articlePublisherName}
                    onChange={(e) => setArticlePublisherName(e.target.value)}
                    placeholder="e.g. Fusion Tools"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Canonical Page URL *</label>
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://example.com/blog/my-post"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Featured Image URL</label>
                <input
                  type="url"
                  value={articleImage}
                  onChange={(e) => setArticleImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date Published *</label>
                  <input
                    type="date"
                    value={articleDatePublished}
                    onChange={(e) => setArticleDatePublished(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Date Modified</label>
                  <input
                    type="date"
                    value={articleDateModified}
                    onChange={(e) => setArticleDateModified(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: PRODUCT FORM ── */}
          {activeSchema === "product" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Ultra HD 4K Monitor"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Key features and details..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Brand Name</label>
                  <input
                    type="text"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                    placeholder="e.g. Sony"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>SKU / MPN</label>
                  <input
                    type="text"
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    placeholder="e.g. SN-4K-2026"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="99.99"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Currency *</label>
                  <select
                    value={productCurrency}
                    onChange={(e) => setProductCurrency(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Stock Availability</label>
                  <select
                    value={productAvailability}
                    onChange={(e) => setProductAvailability(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="InStock">In Stock</option>
                    <option value="OutOfStock">Out of Stock</option>
                    <option value="PreOrder">Pre-Order</option>
                    <option value="BackOrder">Back Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Product Image URL</label>
                <input
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="https://example.com/product.jpg"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Rating Value (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={productRating}
                    onChange={(e) => setProductRating(e.target.value)}
                    placeholder="4.8"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Review Count</label>
                  <input
                    type="number"
                    value={productReviewCount}
                    onChange={(e) => setProductReviewCount(e.target.value)}
                    placeholder="120"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: LOCAL BUSINESS FORM ── */}
          {activeSchema === "local-business" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="LocalBusiness">Local Business (Generic)</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Store">Retail Store</option>
                    <option value="MedicalClinic">Medical / Dental Clinic</option>
                    <option value="LegalService">Legal / Law Firm</option>
                    <option value="AutomotiveBusiness">Auto Repair / Dealership</option>
                    <option value="RealEstateAgent">Real Estate Agency</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price Range</label>
                  <select
                    value={businessPriceRange}
                    onChange={(e) => setBusinessPriceRange(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="$">$ (Inexpensive)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Expensive)</option>
                    <option value="$$$$">$$$$ (Luxury)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Dental Studio"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Website URL</label>
                  <input
                    type="url"
                    value={businessUrl}
                    onChange={(e) => setBusinessUrl(e.target.value)}
                    placeholder="https://example.com"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Street Address</label>
                <input
                  type="text"
                  value={businessStreet}
                  onChange={(e) => setBusinessStreet(e.target.value)}
                  placeholder="123 Market St, Suite 200"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    type="text"
                    value={businessCity}
                    onChange={(e) => setBusinessCity(e.target.value)}
                    placeholder="San Francisco"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>State / Region</label>
                  <input
                    type="text"
                    value={businessState}
                    onChange={(e) => setBusinessState(e.target.value)}
                    placeholder="CA"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Postal Code</label>
                  <input
                    type="text"
                    value={businessPostalCode}
                    onChange={(e) => setBusinessPostalCode(e.target.value)}
                    placeholder="94105"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Opening Time</label>
                  <input
                    type="time"
                    value={businessOpens}
                    onChange={(e) => setBusinessOpens(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Closing Time</label>
                  <input
                    type="time"
                    value={businessCloses}
                    onChange={(e) => setBusinessCloses(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: HOW-TO FORM ── */}
          {activeSchema === "howto" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>How-To Title *</label>
                <input
                  type="text"
                  value={howToName}
                  onChange={(e) => setHowToName(e.target.value)}
                  placeholder="How to bake a sourdough bread"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={2}
                  value={howToDescription}
                  onChange={(e) => setHowToDescription(e.target.value)}
                  placeholder="Short description of the process..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Total Time (ISO 8601, e.g. PT30M)</label>
                  <input
                    type="text"
                    value={howToTotalTime}
                    onChange={(e) => setHowToTotalTime(e.target.value)}
                    placeholder="PT30M"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Estimated Cost</label>
                  <input
                    type="text"
                    value={howToCost}
                    onChange={(e) => setHowToCost(e.target.value)}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>
                  Tutorial Steps ({howToSteps.length})
                </span>
                {howToSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>
                        Step {idx + 1}
                      </span>
                      {howToSteps.length > 1 && (
                        <button
                          onClick={() => setHowToSteps(howToSteps.filter((_, i) => i !== idx))}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <FiTrash2 /> Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        const updated = [...howToSteps];
                        updated[idx].name = e.target.value;
                        setHowToSteps(updated);
                      }}
                      placeholder="Step Title (e.g. Prepare the dough)"
                      style={inputStyle}
                    />
                    <textarea
                      rows={2}
                      value={step.text}
                      onChange={(e) => {
                        const updated = [...howToSteps];
                        updated[idx].text = e.target.value;
                        setHowToSteps(updated);
                      }}
                      placeholder="Step instructions..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                ))}

                <button
                  onClick={() => setHowToSteps([...howToSteps, { name: "", text: "" }])}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#60a5fa",
                    border: "1px dashed #3b82f6",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <FiPlus /> Add Next Step
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 6: BREADCRUMB FORM ── */}
          {activeSchema === "breadcrumb" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                BreadcrumbList displays clickable navigation trails in Google search results (e.g. Home › Category › Page).
              </p>

              {breadcrumbs.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    padding: 12,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#2563eb",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 8 }}>
                    <input
                      type="text"
                      value={b.name}
                      onChange={(e) => {
                        const updated = [...breadcrumbs];
                        updated[idx].name = e.target.value;
                        setBreadcrumbs(updated);
                      }}
                      placeholder="Page Label (e.g. Home)"
                      style={inputStyle}
                    />
                    <input
                      type="url"
                      value={b.url}
                      onChange={(e) => {
                        const updated = [...breadcrumbs];
                        updated[idx].url = e.target.value;
                        setBreadcrumbs(updated);
                      }}
                      placeholder="https://example.com/page"
                      style={inputStyle}
                    />
                  </div>
                  {breadcrumbs.length > 1 && (
                    <button
                      onClick={() => setBreadcrumbs(breadcrumbs.filter((_, i) => i !== idx))}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 6,
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() =>
                  setBreadcrumbs([
                    ...breadcrumbs,
                    { name: "", url: "https://example.com" },
                  ])
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  border: "1px dashed #3b82f6",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <FiPlus /> Add Breadcrumb Item
              </button>
            </div>
          )}

          {/* ── TAB 7: EVENT FORM ── */}
          {activeSchema === "event" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Event Name *</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Tech Innovators Summit 2026"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Event agenda and highlights..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Attendance Mode</label>
                  <select
                    value={eventAttendanceMode}
                    onChange={(e) => setEventAttendanceMode(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="OfflineEventAttendanceMode">In-Person (Offline)</option>
                    <option value="OnlineEventAttendanceMode">Online / Virtual</option>
                    <option value="MixedEventAttendanceMode">Hybrid (In-Person &amp; Online)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Event Status</label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="EventScheduled">Scheduled</option>
                    <option value="EventPostponed">Postponed</option>
                    <option value="EventCancelled">Cancelled</option>
                    <option value="EventMovedOnline">Moved Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Venue Name / Virtual Platform</label>
                <input
                  type="text"
                  value={eventLocationName}
                  onChange={(e) => setEventLocationName(e.target.value)}
                  placeholder="e.g. Convention Center or Zoom"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Venue Physical Address</label>
                <input
                  type="text"
                  value={eventLocationAddress}
                  onChange={(e) => setEventLocationAddress(e.target.value)}
                  placeholder="Street, City, State, Country"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ticket Price</label>
                  <input
                    type="text"
                    value={eventTicketPrice}
                    onChange={(e) => setEventTicketPrice(e.target.value)}
                    placeholder="29.00"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={eventTicketCurrency}
                    onChange={(e) => setEventTicketCurrency(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Live JSON-LD Output & Rich Snippet Preview ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Action Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                Generated JSON-LD
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  fontWeight: 600,
                }}
              >
                Valid
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleCopyScript}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: copiedScript ? "#10b981" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {copiedScript ? <FiCheck /> : <FiCopy />}
                {copiedScript ? "Copied Script!" : "Copy <script> Tag"}
              </button>

              <button
                onClick={handleCopyJson}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "#334155",
                  color: "#e2e8f0",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {copiedJson ? <FiCheck /> : <FiCopy />}
                Raw JSON
              </button>

              <button
                onClick={handleDownload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "#1e293b",
                  color: "#e2e8f0",
                  border: "1px solid #334155",
                  cursor: "pointer",
                }}
              >
                <FiDownload /> .jsonld
              </button>
            </div>
          </div>

          {/* Formatted Code Block Container */}
          <div
            style={{
              background: "#090d16",
              borderRadius: 14,
              border: "1px solid #1e293b",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                background: "#0f172a",
                borderBottom: "1px solid #1e293b",
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              <span>&lt;script type=&quot;application/ld+json&quot;&gt;</span>
              <span>application/ld+json</span>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 16,
                fontSize: 12,
                lineHeight: 1.6,
                color: "#e2e8f0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                maxHeight: 380,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <code>{jsonString}</code>
            </pre>
          </div>

          {/* Direct Validation Links */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              padding: "12px 16px",
              background: "#0f172a",
              borderRadius: 12,
              border: "1px solid #1e293b",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Validate output with Google &amp; Schema:
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleOpenGoogleTester}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  cursor: "pointer",
                }}
              >
                Google Rich Results Test <FiExternalLink />
              </button>
              <button
                onClick={handleOpenSchemaValidator}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  cursor: "pointer",
                }}
              >
                Schema.org Validator <FiExternalLink />
              </button>
            </div>
          </div>

          {/* ── Google Search Rich Result Visualizer Card ────────────── */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 14,
              border: "1px solid #334155",
              padding: 18,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#cbd5e1",
                display: "block",
                marginBottom: 12,
              }}
            >
              Estimated Google Rich Result Appearance
            </span>

            {/* Google Search Card Simulation */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: "16px 20px",
                fontFamily: "Arial, sans-serif",
                color: "#202124",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              }}
            >
              {/* Breadcrumb row */}
              <div
                style={{
                  fontSize: 12,
                  color: "#4d5156",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontWeight: 600 }}>fusiontools.in</span>
                <span>›</span>
                {activeSchema === "breadcrumb" ? (
                  breadcrumbs.map((b, i) => (
                    <span key={i}>
                      {b.name || "..."}
                      {i < breadcrumbs.length - 1 ? " › " : ""}
                    </span>
                  ))
                ) : (
                  <span>tools › seo-tools</span>
                )}
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 400,
                  color: "#1a0dab",
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}
              >
                {activeSchema === "article"
                  ? articleHeadline
                  : activeSchema === "product"
                  ? productName
                  : activeSchema === "local-business"
                  ? businessName
                  : activeSchema === "howto"
                  ? howToName
                  : activeSchema === "event"
                  ? eventName
                  : "Frequently Asked Questions & Answers"}
              </div>

              {/* Rich Star / Product Meta */}
              {activeSchema === "product" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#70757a",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ display: "flex", color: "#e37400" }}>
                    {"★".repeat(Math.round(parseFloat(productRating) || 5))}
                  </span>
                  <span style={{ fontWeight: 700, color: "#202124" }}>
                    Rating: {productRating}/5
                  </span>
                  <span>· {productReviewCount} reviews</span>
                  <span>·</span>
                  <span style={{ fontWeight: 700, color: "#137333" }}>
                    ${productPrice} {productCurrency}
                  </span>
                  <span>· In stock</span>
                </div>
              )}

              {/* Description */}
              <div style={{ fontSize: 13, color: "#4d5156", lineHeight: 1.5 }}>
                {activeSchema === "article"
                  ? articleDescription
                  : activeSchema === "product"
                  ? productDescription
                  : activeSchema === "local-business"
                  ? `${businessStreet}, ${businessCity}, ${businessState}. Phone: ${businessPhone}`
                  : activeSchema === "howto"
                  ? howToDescription
                  : activeSchema === "event"
                  ? `${eventStartDate.replace("T", " ")} · ${eventLocationName} · ${eventDescription}`
                  : "Discover answers to commonly asked questions directly below:"}
              </div>

              {/* FAQ Accordions Simulation in Search */}
              {activeSchema === "faq" && (
                <div
                  style={{
                    marginTop: 12,
                    borderTop: "1px solid #dadce0",
                    paddingTop: 8,
                  }}
                >
                  {faqItems.slice(0, 3).map((item, idx) => {
                    const isExp = expandedFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          borderBottom: "1px solid #f1f3f4",
                          padding: "8px 0",
                        }}
                      >
                        <div
                          onClick={() => setExpandedFaqIndex(isExp ? null : idx)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1a0dab",
                          }}
                        >
                          <span>{item.question || "Question title"}</span>
                          {isExp ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {isExp && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: "#4d5156",
                              lineHeight: 1.5,
                              paddingLeft: 4,
                            }}
                          >
                            {item.answer || "Answer content..."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* HowTo Steps Simulation */}
              {activeSchema === "howto" && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: "1px solid #dadce0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {howToSteps.slice(0, 3).map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 12,
                        color: "#3c4043",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#e8f0fe",
                          color: "#1967d2",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 10,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <strong style={{ color: "#202124" }}>{step.name}:</strong>{" "}
                      {step.text.substring(0, 60)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Shared Inline Styles ───────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#f8fafc",
  fontSize: 13,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#cbd5e1",
  marginBottom: 4,
};
