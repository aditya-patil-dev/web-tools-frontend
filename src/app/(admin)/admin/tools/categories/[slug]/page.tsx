"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiTag, FiFileText, FiGlobe, FiCheckCircle } from "react-icons/fi";
import PageHeader from "@/components/page-header/PageHeader";
import TextInput from "@/components/forms/TextInput";
import Textarea from "@/components/forms/Textarea";
import Select from "@/components/forms/Select";
import Toggle from "@/components/forms/Toggle";
import { Form, FormSection, FormGroup } from "@/components/forms/FormLayout";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";
import { useToolCategory } from "@/hooks/useToolCategories";
import { toolCategoriesApi } from "@/services/tool-categories.service";
import type { ToolCategoryFormData, ToolCategoryStatus } from "@/types/tool-category.types";

export default function CategoryFormPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const isEditMode = slug && slug !== "new";

    // ── Fetch existing category if editing ──
    const { category, isLoading: isFetching } = useToolCategory(isEditMode ? slug : null);

    // ── Form State ──
    const [formData, setFormData] = useState<ToolCategoryFormData>({
        category_slug: "",
        page_title: "",
        page_description: "",
        page_intro: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        noindex: false,
        status: "draft",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ToolCategoryFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);

    // ── Populate form when editing ──
    useEffect(() => {
        if (category && isEditMode) {
            setFormData({
                category_slug: category.category_slug,
                page_title: category.page_title,
                page_description: category.page_description,
                page_intro: category.page_intro || "",
                meta_title: category.meta_title || "",
                meta_description: category.meta_description || "",
                meta_keywords: category.meta_keywords || "",
                canonical_url: category.canonical_url || "",
                noindex: category.noindex,
                status: category.status,
            });
        }
    }, [category, isEditMode]);

    // ── Auto-generate slug from title ──
    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, page_title: value }));

        if (!isEditMode && !slugTouched) {
            const autoSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setFormData((prev) => ({ ...prev, category_slug: autoSlug }));
        }
    };

    // ── Validation ──
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ToolCategoryFormData, string>> = {};

        if (!formData.category_slug.trim()) {
            newErrors.category_slug = "Category slug is required";
        } else if (!/^[a-z0-9-]+$/.test(formData.category_slug)) {
            newErrors.category_slug = "Slug must contain only lowercase letters, numbers, and hyphens";
        }

        if (!formData.page_title.trim()) {
            newErrors.page_title = "Page title is required";
        }

        if (!formData.page_description.trim()) {
            newErrors.page_description = "Page description is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.warning("Please fix the errors before submitting");
        }

        return Object.keys(newErrors).length === 0;
    };

    // ── Submit Handler ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        loading.show({ message: isEditMode ? "Updating category…" : "Creating category…" });

        try {
            if (isEditMode) {
                await toolCategoriesApi.update(slug, formData);
                toast.success("Category updated successfully");
            } else {
                await toolCategoriesApi.create(formData);
                toast.success("Category created successfully");
            }

            router.push("/admin/tools/categories");
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || err?.message || "Failed to save category";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            loading.hide();
        }
    };

    // ── Save as Draft Handler ──
    const handleSaveAsDraft = async () => {
        setFormData((prev) => ({ ...prev, status: "draft" }));
        setTimeout(() => {
            const form = document.querySelector("form") as HTMLFormElement;
            form?.requestSubmit();
        }, 0);
    };

    // ── Status Options ──
    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
    ];

    // ── Loading state while fetching for edit ──
    if (isFetching && isEditMode) {
        return (
            <div className="adminPage">
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div className="spinner" />
                    <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
                        Loading category...
                    </p>
                </div>
            </div>
        );
    }

    // ── Header Actions ──
    const headerActions = [
        {
            label: "Cancel",
            variant: "ghost" as const,
            onClick: () => router.back(),
            disabled: isSubmitting,
        },
        ...(!isEditMode
            ? [
                {
                    label: "Save as Draft",
                    variant: "secondary" as const,
                    onClick: handleSaveAsDraft,
                    disabled: isSubmitting,
                },
            ]
            : []),
        {
            label: isEditMode ? "Update Category" : "Create Category",
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
                    title={isEditMode ? "Edit Category" : "New Category"}
                    subtitle={
                        isEditMode
                            ? `Update category page for ${category?.page_title || slug}`
                            : "Create a new tool category page"
                    }
                    breadcrumbs={[
                        { label: "Admin", href: "/admin" },
                        { label: "Tools", href: "/admin/tools" },
                        { label: "Categories", href: "/admin/tools/categories" },
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
                    description="Category name, slug, and description"
                    collapsible
                    defaultOpen
                >
                    <FormGroup columns={2}>
                        <TextInput
                            label="Page Title"
                            placeholder="e.g., AI Tools"
                            value={formData.page_title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            error={errors.page_title}
                            required
                            leftIcon={<FiFileText size={16} />}
                            helperText="Display name for this category"
                        />
                        <TextInput
                            label="Category Slug"
                            placeholder="ai-tools"
                            value={formData.category_slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setFormData((prev) => ({
                                    ...prev,
                                    category_slug: e.target.value.toLowerCase(),
                                }));
                            }}
                            error={errors.category_slug}
                            required
                            leftIcon={<FiTag size={16} />}
                            helperText="URL-friendly identifier (lowercase, hyphens only)"
                            disabled={!!isEditMode}
                        />
                    </FormGroup>

                    <Textarea
                        label="Page Description"
                        placeholder="Brief description of this category..."
                        value={formData.page_description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, page_description: e.target.value }))
                        }
                        error={errors.page_description}
                        required
                        showCharCount
                        maxLength={500}
                        minRows={3}
                        autoResize
                        helperText="Short description shown in category cards"
                    />

                    <Textarea
                        label="Page Intro (Optional)"
                        placeholder="Longer introduction text for the category page..."
                        value={formData.page_intro}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, page_intro: e.target.value }))
                        }
                        showCharCount
                        maxLength={1000}
                        minRows={4}
                        autoResize
                        helperText="Appears at the top of the category page"
                    />

                    <FormGroup columns={2}>
                        <Select
                            label="Status"
                            options={statusOptions}
                            value={formData.status}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value as ToolCategoryStatus,
                                }))
                            }
                            helperText="Controls visibility on the site"
                        />
                        <div style={{ paddingTop: "28px" }}>
                            <Toggle
                                label="Hide from Search Engines"
                                description="Add noindex meta tag to this page"
                                checked={formData.noindex}
                                onChange={(val) =>
                                    setFormData((prev) => ({ ...prev, noindex: val }))
                                }
                            />
                        </div>
                    </FormGroup>
                </FormSection>

                {/* ── SEO METADATA ── */}
                <FormSection
                    title="SEO Metadata"
                    description="Optimize for search engines"
                    collapsible
                    defaultOpen
                >
                    <TextInput
                        label="Meta Title (Optional)"
                        placeholder="Leave blank to use Page Title"
                        value={formData.meta_title}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                        }
                        leftIcon={<FiGlobe size={16} />}
                        showCharCount
                        maxLength={60}
                        helperText="Ideal length: 50-60 characters"
                    />

                    <Textarea
                        label="Meta Description (Optional)"
                        placeholder="Brief summary for search results..."
                        value={formData.meta_description}
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
                        label="Meta Keywords (Optional)"
                        placeholder="keyword1, keyword2, keyword3"
                        value={formData.meta_keywords}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_keywords: e.target.value }))
                        }
                        helperText="Comma-separated keywords (less important for modern SEO)"
                    />

                    <TextInput
                        label="Canonical URL (Optional)"
                        placeholder="https://example.com/tools/category"
                        value={formData.canonical_url}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, canonical_url: e.target.value }))
                        }
                        leftAddon="https://"
                        helperText="Set if this page has a preferred URL"
                    />
                </FormSection>
            </Form>
        </div>
    );
}