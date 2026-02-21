"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiFileText, FiGlobe, FiCheckCircle } from "react-icons/fi";
import PageHeader from "@/components/page-header/PageHeader";
import TextInput from "@/components/forms/TextInput";
import Textarea from "@/components/forms/Textarea";
import Select from "@/components/forms/Select";
import Toggle from "@/components/forms/Toggle";
import { Form, FormSection, FormGroup } from "@/components/forms/FormLayout";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";
import RepeatableField from "@/components/forms/RepeatableField";
import type { FieldDefinition } from "@/components/forms/RepeatableField";
import { useToolPageDetail } from "@/hooks/useToolPages";
import { useToolsList } from "@/hooks/useTools";
import { toolPagesApi } from "@/services/tool-pages.service";
import type { ToolPageFormData, ToolPageStatus } from "@/types/tool-page.types";

// ─────────────────────────────────────────────
// Item types
// ─────────────────────────────────────────────
type FeatureItem = { title: string; description: string };
type FaqItem = { question: string; answer: string };

// ─────────────────────────────────────────────
// Field definitions — defined outside component
// so they're stable references (no re-creation on render)
// ─────────────────────────────────────────────
const FEATURE_FIELDS: FieldDefinition<FeatureItem>[] = [
    {
        key: "title",
        label: "Feature Title",
        type: "input",
        placeholder: "e.g., Real-time Responses",
        required: true,
        maxLength: 120,
    },
    {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe what makes this feature valuable...",
        minRows: 2,
        maxLength: 500,
    },
];

const FAQ_FIELDS: FieldDefinition<FaqItem>[] = [
    {
        key: "question",
        label: "Question",
        type: "input",
        placeholder: "e.g., Is this tool free to use?",
        required: true,
        maxLength: 200,
    },
    {
        key: "answer",
        label: "Answer",
        type: "textarea",
        placeholder: "Provide a clear and helpful answer...",
        minRows: 3,
        maxLength: 1000,
    },
];

// ─────────────────────────────────────────────
// Default factory functions
// ─────────────────────────────────────────────
const defaultFeature = (): FeatureItem => ({ title: "", description: "" });
const defaultFaq = (): FaqItem => ({ question: "", answer: "" });

// ─────────────────────────────────────────────
// Safely parse JSON arrays from DB
// ─────────────────────────────────────────────
function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
    if (!value) return fallback;
    if (Array.isArray(value)) return value as T[];
    if (typeof value === "string") {
        try { return JSON.parse(value) as T[]; } catch { return fallback; }
    }
    return fallback;
}

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────
export default function ToolPageFormPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const isEditMode = !!(slug && slug !== "new");

    const { toolPage, isLoading: isFetching } = useToolPageDetail(isEditMode ? slug : null);
    const { tools } = useToolsList({ limit: 200 });

    // ── Form state ──
    const [formData, setFormData] = useState<ToolPageFormData>({
        tool_slug: "",
        page_title: "",
        page_intro: "",
        long_content: "",
        features: null,
        faqs: null,
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        noindex: false,
        schema_markup: null,
        status: "draft",
    });

    // ── Repeatable state ──
    const [features, setFeatures] = useState<FeatureItem[]>([defaultFeature()]);
    const [faqs, setFaqs] = useState<FaqItem[]>([defaultFaq()]);

    const [errors, setErrors] = useState<Partial<Record<keyof ToolPageFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Populate when editing ──
    useEffect(() => {
        if (toolPage && isEditMode) {
            setFormData({
                tool_slug: toolPage.tool_slug,
                page_title: toolPage.page_title,
                page_intro: toolPage.page_intro ?? "",
                long_content: toolPage.long_content ?? "",
                features: toolPage.features ?? null,
                faqs: toolPage.faqs ?? null,
                meta_title: toolPage.meta_title ?? "",
                meta_description: toolPage.meta_description ?? "",
                meta_keywords: toolPage.meta_keywords ?? "",
                canonical_url: toolPage.canonical_url ?? "",
                noindex: toolPage.noindex ?? false,
                schema_markup: toolPage.schema_markup ?? null,
                status: toolPage.status,
            });

            const parsedFeatures = parseJsonArray<FeatureItem>(toolPage.features, [defaultFeature()]);
            const parsedFaqs = parseJsonArray<FaqItem>(toolPage.faqs, [defaultFaq()]);

            setFeatures(parsedFeatures.length ? parsedFeatures : [defaultFeature()]);
            setFaqs(parsedFaqs.length ? parsedFaqs : [defaultFaq()]);
        }
    }, [toolPage, isEditMode]);

    // ── Validation ──
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ToolPageFormData, string>> = {};
        if (!formData.tool_slug.trim()) newErrors.tool_slug = "Tool is required";
        if (!formData.page_title.trim()) newErrors.page_title = "Page title is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.warning("Please fix the errors before submitting");
        }
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        // Filter empty rows
        const filteredFeatures = features.filter((f) => f.title.trim() || f.description.trim());
        const filteredFaqs = faqs.filter((f) => f.question.trim() || f.answer.trim());

        // PostgreSQL json/jsonb columns require a JSON string, not a plain JS object.
        // JSON.stringify converts arrays → valid JSON string the DB accepts.
        const payload: ToolPageFormData = {
            ...formData,
            features: filteredFeatures.length ? JSON.stringify(filteredFeatures) : null,
            faqs: filteredFaqs.length ? JSON.stringify(filteredFaqs) : null,
            // schema_markup may also be a parsed object — stringify it too
            schema_markup: formData.schema_markup
                ? (typeof formData.schema_markup === "string"
                    ? formData.schema_markup
                    : JSON.stringify(formData.schema_markup))
                : null,
        };

        setIsSubmitting(true);
        loading.show({ message: isEditMode ? "Updating tool page…" : "Creating tool page…" });

        try {
            if (isEditMode) {
                await toolPagesApi.update(slug!, payload);
                toast.success("Tool page updated successfully");
            } else {
                await toolPagesApi.create(payload);
                toast.success("Tool page created successfully");
            }
            router.push("/admin/tools/tool-pages");
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || err?.message || "Failed to save tool page";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    // ── Options ──
    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
    ];

    const toolOptions = tools.map((tool) => ({
        value: tool.slug,
        label: `${tool.title} (${tool.slug})`,
    }));

    // ── Section title counters ──
    const featureCount = features.filter((f) => f.title.trim()).length;
    const faqCount = faqs.filter((f) => f.question.trim()).length;

    if (isFetching && isEditMode) {
        return (
            <div className="adminPage">
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div className="spinner" />
                    <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
                        Loading tool page...
                    </p>
                </div>
            </div>
        );
    }

    const headerActions = [
        {
            label: "Cancel",
            variant: "ghost" as const,
            onClick: () => router.back(),
            disabled: isSubmitting,
        },
        {
            label: isEditMode ? "Update Page" : "Create Page",
            variant: "primary" as const,
            type: "submit" as const,
            leftIcon: <FiCheckCircle size={16} />,
            isLoading: isSubmitting,
            loadingText: isEditMode ? "Updating..." : "Creating...",
        },
    ];

    return (
        <div className="adminPage">
            <Form onSubmit={handleSubmit}>
                <PageHeader
                    title={isEditMode ? "Edit Tool Page" : "New Tool Page"}
                    subtitle={
                        isEditMode
                            ? `Update page for ${toolPage?.page_title || slug}`
                            : "Create SEO content for a tool"
                    }
                    breadcrumbs={[
                        { label: "Admin", href: "/admin" },
                        { label: "Tools", href: "/admin/tools" },
                        { label: "Tool Pages", href: "/admin/tools/tool-pages" },
                        { label: isEditMode ? "Edit" : "New" },
                    ]}
                    showBack
                    onBack={() => router.back()}
                    actions={headerActions}
                    stickyActions={true}
                    variant="flat"
                />

                {/* ── BASIC INFORMATION ── */}
                <FormSection
                    title="Basic Information"
                    description="Page title and tool association"
                    collapsible
                    defaultOpen
                >
                    <FormGroup columns={2}>
                        <Select
                            label="Tool"
                            options={toolOptions}
                            value={formData.tool_slug}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, tool_slug: e.target.value }))
                            }
                            error={errors.tool_slug}
                            required
                            placeholder="Select tool"
                            helperText="Which tool is this page for?"
                            disabled={!!isEditMode}
                        />
                        <Select
                            label="Status"
                            options={statusOptions}
                            value={formData.status}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value as ToolPageStatus,
                                }))
                            }
                            helperText="Page visibility"
                        />
                    </FormGroup>

                    <TextInput
                        label="Page Title"
                        placeholder="e.g., ChatGPT - AI Chatbot Tool"
                        value={formData.page_title}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, page_title: e.target.value }))
                        }
                        error={errors.page_title}
                        required
                        leftIcon={<FiFileText size={16} />}
                        helperText="Main heading for the tool page"
                    />

                    <Textarea
                        label="Page Intro"
                        placeholder="Introduction text for the tool page..."
                        value={formData.page_intro ?? ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, page_intro: e.target.value }))
                        }
                        showCharCount
                        maxLength={2000}
                        minRows={4}
                        autoResize
                        helperText="Opening paragraph for the page"
                    />
                </FormSection>

                {/* ── CONTENT ── */}
                <FormSection
                    title="Content"
                    description="Main body content for the tool page"
                    collapsible
                    defaultOpen
                >
                    <Textarea
                        label="Long Content"
                        placeholder="Main detailed content about the tool..."
                        value={formData.long_content ?? ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, long_content: e.target.value }))
                        }
                        minRows={8}
                        autoResize
                        helperText="Full article content (HTML or Markdown supported)"
                    />
                </FormSection>

                {/* ── FEATURES ── */}
                <FormSection
                    title={`Features${featureCount > 0 ? ` (${featureCount})` : ""}`}
                    description="Highlight what this tool does well"
                    collapsible
                    defaultOpen
                >
                    <RepeatableField<FeatureItem>
                        items={features}
                        onChange={setFeatures}
                        defaultItem={defaultFeature}
                        fields={FEATURE_FIELDS}
                        addLabel="Add Feature"
                        maxItems={20}
                    />
                </FormSection>

                {/* ── FAQs ── */}
                <FormSection
                    title={`FAQs${faqCount > 0 ? ` (${faqCount})` : ""}`}
                    description="Answer common questions about this tool"
                    collapsible
                    defaultOpen
                >
                    <RepeatableField<FaqItem>
                        items={faqs}
                        onChange={setFaqs}
                        defaultItem={defaultFaq}
                        fields={FAQ_FIELDS}
                        addLabel="Add FAQ"
                        maxItems={30}
                    />
                </FormSection>

                {/* ── SEO METADATA ── */}
                <FormSection
                    title="SEO Metadata"
                    description="Search engine optimization"
                    collapsible
                    defaultOpen
                >
                    <TextInput
                        label="Meta Title"
                        placeholder="Leave blank to use Page Title"
                        value={formData.meta_title ?? ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                        }
                        leftIcon={<FiGlobe size={16} />}
                        showCharCount
                        maxLength={60}
                        helperText="Ideal length: 50-60 characters"
                    />

                    <Textarea
                        label="Meta Description"
                        placeholder="Brief summary for search results..."
                        value={formData.meta_description ?? ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_description: e.target.value }))
                        }
                        showCharCount
                        maxLength={160}
                        minRows={2}
                        autoResize
                        helperText="Ideal length: 150-160 characters"
                    />

                    <TextInput
                        label="Meta Keywords"
                        placeholder="keyword1, keyword2, keyword3"
                        value={formData.meta_keywords ?? ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_keywords: e.target.value }))
                        }
                        helperText="Comma-separated keywords"
                    />

                    <TextInput
                        label="Canonical URL"
                        placeholder="https://example.com/tools/tool-name"
                        value={formData.canonical_url ?? ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, canonical_url: e.target.value }))
                        }
                        leftAddon="https://"
                        helperText="Preferred URL for this page"
                    />

                    <Toggle
                        label="Hide from Search Engines"
                        description="Add noindex meta tag to this page"
                        checked={formData.noindex ?? false}
                        onChange={(val) => setFormData((prev) => ({ ...prev, noindex: val }))}
                    />
                </FormSection>

                {/* ── STRUCTURED DATA ── */}
                <FormSection
                    title="Structured Data (Advanced)"
                    description="Schema markup for rich snippets"
                    collapsible
                >
                    <Textarea
                        label="Schema Markup (JSON-LD)"
                        placeholder='{"@context": "https://schema.org", "@type": "SoftwareApplication", ...}'
                        value={
                            typeof formData.schema_markup === "string"
                                ? formData.schema_markup
                                : formData.schema_markup
                                    ? JSON.stringify(formData.schema_markup, null, 2)
                                    : ""
                        }
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                setFormData((prev) => ({ ...prev, schema_markup: parsed }));
                            } catch {
                                setFormData((prev) => ({ ...prev, schema_markup: e.target.value as any }));
                            }
                        }}
                        minRows={8}
                        helperText="JSON-LD structured data for rich snippets"
                    />
                </FormSection>
            </Form>
        </div>
    );
}