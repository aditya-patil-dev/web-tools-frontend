"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    useForm,
    useFieldArray,
    type UseFormRegister,
    type FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";

import PageHeader from "@/components/page-header/PageHeader";
import { toast } from "@/components/toast/toast";
import {
    useToolDetail,
    useToolMutations,
    useSlugChecker,
} from "@/hooks/useTools";

// ==================== VALIDATION SCHEMA ====================

const FeatureSchema = z.object({
    title: z.string().min(1, "Feature title is required"),
    description: z.string().min(1, "Feature description is required"),
});

const FaqSchema = z.object({
    question: z.string().min(1, "FAQ question is required"),
    answer: z.string().min(1, "FAQ answer is required"),
});

const ToolEditorSchema = z.object({
    category: z.object({
        category_slug: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-]+$/),
        page_title: z.string().min(1).max(255),
        page_description: z.string().min(1).max(5000),
        page_intro: z.string().optional().nullable(),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
        meta_keywords: z.string().optional().nullable(),
        canonical_url: z
            .string()
            .url("Invalid URL")
            .optional()
            .nullable()
            .or(z.literal("")),
        noindex: z.boolean().default(false),
        status: z.enum(["active", "draft", "disabled"]).default("active"),
    }),
    tool: z.object({
        title: z.string().min(1).max(255),
        slug: z
            .string()
            .min(1)
            .max(255)
            .regex(/^[a-z0-9-]+$/),
        category_slug: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-]+$/),
        tool_type: z.string().min(1).max(50),
        tags: z.array(z.string().min(1)).default([]),
        short_description: z.string().min(1),
        badge: z.enum(["new", "popular", "pro"]).optional().nullable(),
        sort_order: z.number().int().min(0).default(0),
        is_featured: z.boolean().default(false),
        access_level: z
            .enum(["free", "premium", "pro", "enterprise"])
            .default("free"),
        daily_limit: z.number().int().min(1).optional().nullable(),
        monthly_limit: z.number().int().min(1).optional().nullable(),
        tool_url: z.string().min(1).max(255),
        status: z
            .enum(["active", "draft", "disabled", "deprecated"])
            .default("draft"),
    }),
    page: z.object({
        tool_slug: z
            .string()
            .min(1)
            .max(255)
            .regex(/^[a-z0-9-]+$/),
        page_title: z.string().min(1).max(255),
        page_intro: z.string().optional().nullable(),
        long_content: z.string().optional().nullable(),
        features: z.array(FeatureSchema).default([]),
        faqs: z.array(FaqSchema).default([]),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
        meta_keywords: z.array(z.string().min(1)).default([]),
        canonical_url: z
            .string()
            .url("Invalid URL")
            .optional()
            .nullable()
            .or(z.literal("")),
        noindex: z.boolean().default(false),
        schema_markup: z.string().optional().nullable(),
        status: z.enum(["active", "draft", "disabled"]).default("active"),
    }),
});

type ToolEditorForm = z.infer<typeof ToolEditorSchema>;

// ==================== SHARED COMPONENTS ====================

const Field = ({ label, hint, error, children, required }: any) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>
            {label}
            {required && (
                <span style={{ color: "var(--color-error)", marginLeft: 4 }}>*</span>
            )}
        </label>
        {hint && (
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                {hint}
            </span>
        )}
        {children}
        {error && (
            <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                <i className="bi bi-exclamation-circle" /> {error}
            </div>
        )}
    </div>
);

const TextInput = (props: any) => (
    <input
        {...props}
        style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            ...props.style,
        }}
    />
);

const TextArea = (props: any) => (
    <textarea
        {...props}
        style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            minHeight: 110,
            fontSize: 14,
            fontFamily: "inherit",
            ...props.style,
        }}
    />
);

const Select = (props: any) => (
    <select
        {...props}
        style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            ...props.style,
        }}
    />
);

const CollapsibleSection = ({
    title,
    description,
    icon,
    children,
    defaultOpen = true,
}: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
            }}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "100%",
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isOpen ? "#f9fafb" : "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {icon && (
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                background: "#dbeafe",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3b82f6",
                            }}
                        >
                            <i className={icon} />
                        </div>
                    )}
                    <div style={{ textAlign: "left" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
                        {description && (
                            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                <i className={`bi bi-chevron-${isOpen ? "up" : "down"}`} />
            </button>
            {isOpen && (
                <div style={{ padding: 20, borderTop: "1px solid #e5e7eb" }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const TabNav = ({ tabs, activeTab, onChange, getTabErrors }: any) => (
    <div
        style={{
            display: "flex",
            gap: 4,
            padding: 8,
            background: "#f9fafb",
            borderRadius: 12,
            position: "sticky",
            top: 0,
            zIndex: 10,
        }}
    >
        {tabs.map((tab: any) => {
            const hasError = getTabErrors && getTabErrors(tab.id);
            return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: hasError ? "2px solid #ef4444" : "none",
                        background: activeTab === tab.id ? "white" : "transparent",
                        color: activeTab === tab.id ? "#3b82f6" : hasError ? "#ef4444" : "#6b7280",
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        cursor: "pointer",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        position: "relative",
                    }}
                >
                    <i className={tab.icon} />
                    {tab.label}
                    {hasError && (
                        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: 12, color: "#ef4444" }} />
                    )}
                </button>
            );
        })}
    </div>
);

// ==================== MAIN COMPONENT ====================

export default function ToolFormPage() {
    const router = useRouter();
    const params = useParams();
    const toolId = params?.id ? parseInt(params.id as string) : null;
    const isEditMode = toolId !== null;

    const [activeTab, setActiveTab] = useState("basic");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [slugValidation, setSlugValidation] = useState<any>(null);

    const { toolData, isLoading: isLoadingTool } = useToolDetail(toolId);
    const { createTool, updateTool, isSubmitting } = useToolMutations();
    const { checkSlug, isChecking } = useSlugChecker();

    const defaultValues: ToolEditorForm = useMemo(
        () => ({
            category: {
                category_slug: "",
                page_title: "",
                page_description: "",
                page_intro: null,
                meta_title: null,
                meta_description: null,
                meta_keywords: null,
                canonical_url: null,
                noindex: false,
                status: "active",
            },
            tool: {
                title: "",
                slug: "",
                category_slug: "",
                tool_type: "",
                tags: [],
                short_description: "",
                badge: null,
                sort_order: 0,
                is_featured: false,
                access_level: "free",
                daily_limit: null,
                monthly_limit: null,
                tool_url: "",
                status: "draft",
            },
            page: {
                tool_slug: "",
                page_title: "",
                page_intro: null,
                long_content: null,
                features: [],
                faqs: [],
                meta_title: null,
                meta_description: null,
                meta_keywords: [],
                canonical_url: null,
                noindex: false,
                schema_markup: null,
                status: "active",
            },
        }),
        [],
    );

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm<ToolEditorForm>({
        resolver: zodResolver(ToolEditorSchema),
        defaultValues,
        mode: "onBlur",
    });

    useEffect(() => {
        if (isEditMode && toolData) {
            reset({
                category: toolData.category,
                tool: toolData.tool as any,
                page: toolData.page,
            });
        }
    }, [isEditMode, toolData, reset]);

    useEffect(() => {
        setHasUnsavedChanges(isDirty);
    }, [isDirty]);

    // Auto-sync slugs
    const toolSlug = watch("tool.slug");
    const categorySlug = watch("category.category_slug");

    useEffect(() => {
        if (toolSlug)
            setValue("page.tool_slug", toolSlug, { shouldValidate: true });
    }, [toolSlug, setValue]);

    useEffect(() => {
        if (categorySlug)
            setValue("tool.category_slug", categorySlug, { shouldValidate: true });
    }, [categorySlug, setValue]);

    // Slug validation
    useEffect(() => {
        const slug = watch("tool.slug");
        if (!slug || (isEditMode && toolData?.tool.slug === slug)) {
            setSlugValidation(null);
            return;
        }
        const timeoutId = setTimeout(async () => {
            const available = await checkSlug(slug);
            setSlugValidation({
                isValid: available,
                message: available ? "✓ Available" : "✗ Taken",
            });
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [watch("tool.slug"), isEditMode, toolData, checkSlug]);

    const tagsArray = useFieldArray({ control, name: "tool.tags" });
    const metaKeywordsArray = useFieldArray({
        control,
        name: "page.meta_keywords",
    });
    const featuresArray = useFieldArray({ control, name: "page.features" });
    const faqsArray = useFieldArray({ control, name: "page.faqs" });

    const onSubmit: SubmitHandler<ToolEditorForm> = async (values) => {
        console.log("Form submitted with values:", values);
        console.log("Current form errors:", errors);

        const success =
            isEditMode && toolId
                ? await updateTool(toolId, values as any)
                : await createTool(values as any);

        if (success) {
            setHasUnsavedChanges(false);
            if (!isEditMode) router.push("/admin/tools");
        }
    };

    const onError = (errors: any) => {
        console.error("Form validation failed:", errors);
        toast.error("Please fix all validation errors before submitting");
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const tabs = [
        { id: "basic", label: "Basic Info", icon: "bi bi-info-circle" },
        { id: "category", label: "Category", icon: "bi bi-folder" },
        { id: "page", label: "Page Content", icon: "bi bi-file-text" },
        { id: "seo", label: "SEO", icon: "bi bi-search" },
        { id: "advanced", label: "Advanced", icon: "bi bi-gear" },
    ];

    // Helper function to check if a tab has errors
    const getTabErrors = (tabId: string) => {
        switch (tabId) {
            case "basic":
                return errors.tool;
            case "category":
                return errors.category;
            case "page":
                return errors.page;
            case "seo":
                return (errors.category?.meta_title || errors.category?.meta_description ||
                    errors.page?.meta_title || errors.page?.meta_description);
            case "advanced":
                return errors.page?.schema_markup;
            default:
                return null;
        }
    };

    const errorCount = Object.keys(errors).length;

    // Debug: Log all errors to console
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("Form validation errors:", errors);
        }
    }, [errors]);

    if (isEditMode && isLoadingTool) {
        return (
            <div
                className="container-fluid"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            border: "4px solid #dbeafe",
                            borderTopColor: "#3b82f6",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 16px",
                        }}
                    />
                    <p>Loading tool data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <PageHeader
                title={
                    isEditMode ? `Edit: ${toolData?.tool.title || "..."}` : "Create Tool"
                }
                subtitle={
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span>Unified form for tool, page, and category</span>
                        {hasUnsavedChanges && (
                            <span
                                style={{
                                    padding: "4px 12px",
                                    borderRadius: 9999,
                                    background: "#f59e0b",
                                    color: "white",
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                <i className="bi bi-exclamation-circle" /> Unsaved
                            </span>
                        )}
                    </span>
                }
                actions={[
                    {
                        label: "Back",
                        icon: "bi-arrow-left",
                        href: "/admin/tools",
                        variant: "primary",
                    },
                ]}
            />

            {errorCount > 0 && (
                <div
                    style={{
                        padding: 16,
                        borderRadius: 12,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        marginBottom: 24,
                    }}
                >
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <i
                            className="bi bi-exclamation-triangle"
                            style={{ fontSize: 20, color: "#ef4444" }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "#ef4444" }}>
                                {errorCount} validation error{errorCount > 1 ? "s" : ""} found
                            </div>
                            <div style={{ fontSize: 13, color: "#991b1b", marginTop: 2 }}>
                                Please fix the errors below to continue
                            </div>
                        </div>
                    </div>

                    {/* Display all errors in detail */}
                    <div style={{
                        marginTop: 16,
                        padding: 12,
                        background: "white",
                        borderRadius: 8,
                        fontSize: 13
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#991b1b" }}>
                            Error Details:
                        </div>

                        {/* Tool errors */}
                        {errors.tool && Object.keys(errors.tool).length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                                    📌 Basic Info / Tool:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 20, color: "#991b1b" }}>
                                    {errors.tool.title && <li><strong>Title:</strong> {errors.tool.title.message}</li>}
                                    {errors.tool.slug && <li><strong>Slug:</strong> {errors.tool.slug.message}</li>}
                                    {errors.tool.tool_type && <li><strong>Tool Type:</strong> {errors.tool.tool_type.message}</li>}
                                    {errors.tool.tool_url && <li><strong>Tool URL:</strong> {errors.tool.tool_url.message}</li>}
                                    {errors.tool.short_description && <li><strong>Description:</strong> {errors.tool.short_description.message}</li>}
                                    {errors.tool.category_slug && <li><strong>Category Slug:</strong> {errors.tool.category_slug.message}</li>}
                                    {errors.tool.tags && <li><strong>Tags:</strong> Please check tag entries</li>}
                                </ul>
                            </div>
                        )}

                        {/* Category errors */}
                        {errors.category && Object.keys(errors.category).length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                                    📁 Category:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 20, color: "#991b1b" }}>
                                    {errors.category.category_slug && <li><strong>Slug:</strong> {errors.category.category_slug.message}</li>}
                                    {errors.category.page_title && <li><strong>Title:</strong> {errors.category.page_title.message}</li>}
                                    {errors.category.page_description && <li><strong>Description:</strong> {errors.category.page_description.message}</li>}
                                    {errors.category.meta_title && <li><strong>Meta Title:</strong> {errors.category.meta_title.message}</li>}
                                    {errors.category.meta_description && <li><strong>Meta Description:</strong> {errors.category.meta_description.message}</li>}
                                    {errors.category.canonical_url && <li><strong>Canonical URL:</strong> {errors.category.canonical_url.message}</li>}
                                </ul>
                            </div>
                        )}

                        {/* Page errors */}
                        {errors.page && Object.keys(errors.page).length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                                    📄 Page Content:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 20, color: "#991b1b" }}>
                                    {errors.page.tool_slug && <li><strong>Tool Slug:</strong> {errors.page.tool_slug.message}</li>}
                                    {errors.page.page_title && <li><strong>Page Title:</strong> {errors.page.page_title.message}</li>}
                                    {errors.page.page_intro && <li><strong>Page Intro:</strong> {errors.page.page_intro.message}</li>}
                                    {errors.page.long_content && <li><strong>Long Content:</strong> {errors.page.long_content.message}</li>}
                                    {errors.page.features && <li><strong>Features:</strong> Please check feature entries for errors</li>}
                                    {errors.page.faqs && <li><strong>FAQs:</strong> Please check FAQ entries for errors</li>}
                                    {errors.page.meta_title && <li><strong>Meta Title:</strong> {errors.page.meta_title.message}</li>}
                                    {errors.page.meta_description && <li><strong>Meta Description:</strong> {errors.page.meta_description.message}</li>}
                                    {errors.page.meta_keywords && <li><strong>Meta Keywords:</strong> Please check keyword entries</li>}
                                    {errors.page.canonical_url && <li><strong>Canonical URL:</strong> {errors.page.canonical_url.message}</li>}
                                    {errors.page.schema_markup && <li><strong>Schema Markup:</strong> {errors.page.schema_markup.message}</li>}
                                </ul>
                            </div>
                        )}

                        {/* If no specific errors found, show generic message */}
                        {!errors.tool && !errors.category && !errors.page && (
                            <div style={{ color: "#991b1b", fontStyle: "italic" }}>
                                Unable to determine specific field errors. Please check all required fields.
                                <br />
                                <button
                                    type="button"
                                    onClick={() => console.log("All errors:", JSON.stringify(errors, null, 2))}
                                    style={{
                                        marginTop: 8,
                                        padding: "6px 12px",
                                        background: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontSize: 12,
                                    }}
                                >
                                    📋 Log Full Error Details to Console
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} getTabErrors={getTabErrors} />

            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                style={{ marginTop: 24, paddingBottom: 100 }}
            >
                {/* BASIC TAB */}
                {activeTab === "basic" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <CollapsibleSection title="Tool Identity" icon="bi bi-info-circle">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(12, 1fr)",
                                    gap: 16,
                                }}
                            >
                                <div style={{ gridColumn: "span 8" }}>
                                    <Field
                                        label="Title"
                                        error={errors.tool?.title?.message}
                                        required
                                    >
                                        <TextInput
                                            {...register("tool.title")}
                                            placeholder="Favicon Generator"
                                        />
                                    </Field>
                                </div>
                                <div style={{ gridColumn: "span 4" }}>
                                    <Field
                                        label="Slug"
                                        hint="Auto-syncs"
                                        error={errors.tool?.slug?.message}
                                        required
                                    >
                                        <TextInput
                                            {...register("tool.slug")}
                                            placeholder="favicon-generator"
                                        />
                                        {slugValidation && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: slugValidation.isValid ? "#10b981" : "#ef4444",
                                                    marginTop: 4,
                                                }}
                                            >
                                                {slugValidation.message}
                                            </div>
                                        )}
                                    </Field>
                                </div>
                                <div style={{ gridColumn: "span 6" }}>
                                    <Field
                                        label="Tool Type"
                                        error={errors.tool?.tool_type?.message}
                                        required
                                    >
                                        <TextInput {...register("tool.tool_type")} />
                                    </Field>
                                </div>
                                <div style={{ gridColumn: "span 6" }}>
                                    <Field
                                        label="URL"
                                        error={errors.tool?.tool_url?.message}
                                        required
                                    >
                                        <TextInput {...register("tool.tool_url")} />
                                    </Field>
                                </div>
                                <div style={{ gridColumn: "span 12" }}>
                                    <Field
                                        label="Description"
                                        error={errors.tool?.short_description?.message}
                                        required
                                    >
                                        <TextArea {...register("tool.short_description")} />
                                    </Field>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Settings" icon="bi bi-sliders">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: 16,
                                }}
                            >
                                <Field label="Badge">
                                    <Select {...register("tool.badge")}>
                                        <option value="">None</option>
                                        <option value="new">New</option>
                                        <option value="popular">Popular</option>
                                        <option value="pro">Pro</option>
                                    </Select>
                                </Field>
                                <Field label="Access">
                                    <Select {...register("tool.access_level")}>
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </Select>
                                </Field>
                                <Field label="Status">
                                    <Select {...register("tool.status")}>
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="disabled">Disabled</option>
                                    </Select>
                                </Field>
                                <Field label="Sort">
                                    <TextInput
                                        type="number"
                                        {...register("tool.sort_order", { valueAsNumber: true })}
                                    />
                                </Field>
                            </div>
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 16,
                                    background: "#f9fafb",
                                    borderRadius: 8,
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        cursor: "pointer",
                                    }}
                                >
                                    <input type="checkbox" {...register("tool.is_featured")} />
                                    <span>Mark as Featured</span>
                                </label>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Tags" icon="bi bi-tags">
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    marginBottom: 16,
                                }}
                            >
                                {tagsArray.fields.map((f, i) => (
                                    <div
                                        key={f.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "6px 12px",
                                            background: "#dbeafe",
                                            borderRadius: 9999,
                                        }}
                                    >
                                        <input
                                            {...register(`tool.tags.${i}`)}
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                width: 100,
                                                fontSize: 13,
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => tagsArray.remove(i)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="bi bi-x" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="dtBtn"
                                onClick={() => tagsArray.append("")}
                            >
                                <i className="bi bi-plus" /> Add Tag
                            </button>
                        </CollapsibleSection>
                    </div>
                )}

                {/* CATEGORY TAB */}
                {activeTab === "category" && (
                    <CollapsibleSection title="Category" icon="bi bi-folder">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(12, 1fr)",
                                gap: 16,
                            }}
                        >
                            <div style={{ gridColumn: "span 4" }}>
                                <Field
                                    label="Slug"
                                    error={errors.category?.category_slug?.message}
                                    required
                                >
                                    <TextInput {...register("category.category_slug")} />
                                </Field>
                            </div>
                            <div style={{ gridColumn: "span 8" }}>
                                <Field
                                    label="Title"
                                    error={errors.category?.page_title?.message}
                                    required
                                >
                                    <TextInput {...register("category.page_title")} />
                                </Field>
                            </div>
                            <div style={{ gridColumn: "span 12" }}>
                                <Field
                                    label="Description"
                                    error={errors.category?.page_description?.message}
                                    required
                                >
                                    <TextArea
                                        {...register("category.page_description")}
                                        rows={4}
                                    />
                                </Field>
                            </div>
                            <div style={{ gridColumn: "span 12" }}>
                                <Field label="Intro">
                                    <TextArea {...register("category.page_intro")} rows={3} />
                                </Field>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}

                {/* PAGE TAB */}
                {activeTab === "page" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <CollapsibleSection title="Page Content" icon="bi bi-file-text">
                            <div
                                style={{ display: "flex", flexDirection: "column", gap: 16 }}
                            >
                                <Field
                                    label="Page Title"
                                    error={errors.page?.page_title?.message}
                                    required
                                >
                                    <TextInput {...register("page.page_title")} />
                                </Field>
                                <Field label="Intro">
                                    <TextArea {...register("page.page_intro")} rows={3} />
                                </Field>
                                <Field label="Long Content">
                                    <TextArea {...register("page.long_content")} rows={8} />
                                </Field>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title={`Features (${featuresArray.fields.length})`}
                            icon="bi bi-stars"
                            defaultOpen={false}
                        >
                            {featuresArray.fields.map((f, i) => (
                                <div
                                    key={f.id}
                                    style={{
                                        padding: 16,
                                        background: "#f9fafb",
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <span>Feature {i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => featuresArray.remove(i)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                    <Field label="Title" required>
                                        <TextInput {...register(`page.features.${i}.title`)} />
                                    </Field>
                                    <Field label="Description" required>
                                        <TextArea
                                            {...register(`page.features.${i}.description`)}
                                            rows={2}
                                        />
                                    </Field>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="dtBtn"
                                onClick={() =>
                                    featuresArray.append({ title: "", description: "" })
                                }
                            >
                                <i className="bi bi-plus" /> Add Feature
                            </button>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title={`FAQs (${faqsArray.fields.length})`}
                            icon="bi bi-question-circle"
                            defaultOpen={false}
                        >
                            {faqsArray.fields.map((f, i) => (
                                <div
                                    key={f.id}
                                    style={{
                                        padding: 16,
                                        background: "#f9fafb",
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <span>FAQ {i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => faqsArray.remove(i)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                    <Field label="Question" required>
                                        <TextInput {...register(`page.faqs.${i}.question`)} />
                                    </Field>
                                    <Field label="Answer" required>
                                        <TextArea {...register(`page.faqs.${i}.answer`)} rows={3} />
                                    </Field>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="dtBtn"
                                onClick={() => faqsArray.append({ question: "", answer: "" })}
                            >
                                <i className="bi bi-plus" /> Add FAQ
                            </button>
                        </CollapsibleSection>
                    </div>
                )}

                {/* SEO TAB */}
                {activeTab === "seo" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <CollapsibleSection title="Category SEO" icon="bi bi-search">
                            <div style={{ display: "grid", gap: 16 }}>
                                <Field label="Meta Title">
                                    <TextInput {...register("category.meta_title")} />
                                </Field>
                                <Field label="Meta Description">
                                    <TextArea
                                        {...register("category.meta_description")}
                                        rows={3}
                                    />
                                </Field>
                                <Field label="Canonical URL">
                                    <TextInput {...register("category.canonical_url")} />
                                </Field>
                                <label style={{ display: "flex", gap: 8 }}>
                                    <input type="checkbox" {...register("category.noindex")} />{" "}
                                    Hide from search engines
                                </label>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Page SEO" icon="bi bi-search">
                            <div style={{ display: "grid", gap: 16 }}>
                                <Field label="Meta Title">
                                    <TextInput {...register("page.meta_title")} />
                                </Field>
                                <Field label="Meta Description">
                                    <TextArea {...register("page.meta_description")} rows={3} />
                                </Field>
                                <Field label="Canonical URL">
                                    <TextInput {...register("page.canonical_url")} />
                                </Field>
                                <Field label="Keywords">
                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 8,
                                            marginBottom: 12,
                                        }}
                                    >
                                        {metaKeywordsArray.fields.map((f, i) => (
                                            <div
                                                key={f.id}
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    padding: "6px 12px",
                                                    background: "#f9fafb",
                                                    borderRadius: 9999,
                                                }}
                                            >
                                                <input
                                                    {...register(`page.meta_keywords.${i}`)}
                                                    style={{
                                                        border: "none",
                                                        background: "transparent",
                                                        width: 100,
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => metaKeywordsArray.remove(i)}
                                                    style={{
                                                        border: "none",
                                                        background: "none",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <i className="bi bi-x" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="dtBtn"
                                        onClick={() => metaKeywordsArray.append("")}
                                    >
                                        <i className="bi bi-plus" /> Add Keyword
                                    </button>
                                </Field>
                                <label style={{ display: "flex", gap: 8 }}>
                                    <input type="checkbox" {...register("page.noindex")} /> Hide
                                    from search engines
                                </label>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* ADVANCED TAB */}
                {activeTab === "advanced" && (
                    <CollapsibleSection title="Schema Markup" icon="bi bi-code-square">
                        <Field label="JSON-LD Schema">
                            <TextArea
                                {...register("page.schema_markup")}
                                rows={12}
                                style={{ fontFamily: "monospace" }}
                            />
                        </Field>
                    </CollapsibleSection>
                )}

                {/* FOOTER */}
                <div
                    style={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 20,
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(8px)",
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {hasUnsavedChanges && (
                            <span style={{ fontSize: 13, color: "#6b7280" }}>
                                <i className="bi bi-clock-history" /> Unsaved changes
                            </span>
                        )}
                        {errorCount > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("=== FORM ERRORS DEBUG ===");
                                    console.log("Error count:", errorCount);
                                    console.log("All errors:", errors);
                                    console.log("Stringified:", JSON.stringify(errors, null, 2));
                                    alert(`${errorCount} error(s) logged to console. Press F12 to view.`);
                                }}
                                style={{
                                    padding: "6px 12px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    fontSize: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <i className="bi bi-bug" /> Debug Errors
                            </button>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button
                            type="button"
                            className="dtBtn"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="dtBtn"
                            disabled={isSubmitting || isChecking}
                            style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                fontWeight: 600,
                            }}
                        >
                            {isSubmitting
                                ? isEditMode
                                    ? "Updating..."
                                    : "Creating..."
                                : isEditMode
                                    ? "Update Tool"
                                    : "Create Tool"}
                        </button>
                    </div>
                </div>
            </form>

            <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}