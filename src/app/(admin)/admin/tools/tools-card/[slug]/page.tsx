"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiTag, FiFileText, FiLink, FiCheckCircle } from "react-icons/fi";
import PageHeader from "@/components/page-header/PageHeader";
import TextInput from "@/components/forms/TextInput";
import Textarea from "@/components/forms/Textarea";
import Select from "@/components/forms/Select";
import Toggle from "@/components/forms/Toggle";
import { Form, FormSection, FormGroup } from "@/components/forms/FormLayout";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";

// ✅ FIXED: Import from consolidated useTools hook
import { useToolDetail, useToolMutations } from "@/hooks/useTools";

// ✅ Categories from correct hook
import { useToolCategories } from "@/hooks/useToolCategories";

// ✅ FIXED: Import correct types
import type { ToolFormData, ToolStatus, AccessLevel, ToolBadge } from "@/types/tool-cards.types";

export default function ToolFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.slug as string | undefined;
    const isEditMode = id && id !== "new";
    const toolId = isEditMode ? parseInt(id) : null;

    // ✅ FIXED: Use useToolDetail hook (not useTool)
    const { toolData, isLoading: isFetching } = useToolDetail(toolId);

    // ✅ FIXED: Use useToolMutations hook
    const { createTool, updateTool, isSubmitting } = useToolMutations();

    // ── Fetch categories for dropdown ──
    const { data: categoriesData } = useToolCategories({ limit: 100 });

    // ── Form State ──
    const [formData, setFormData] = useState<ToolFormData>({
        title: "",
        slug: "",
        category_slug: "",
        tool_type: "",
        tags: [],
        short_description: "",
        badge: null,
        access_level: "free",
        tool_url: "",
        status: "draft",
        is_featured: false,
        sort_order: 0,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ToolFormData, string>>>({});
    const [slugTouched, setSlugTouched] = useState(false);
    const [tagsInput, setTagsInput] = useState("");

    // ── Populate form when editing ──
    useEffect(() => {
        if (toolData && isEditMode) {
            const tool = toolData.tool;
            setFormData({
                title: tool.title,
                slug: tool.slug,
                category_slug: tool.category_slug,
                tool_type: tool.tool_type,
                tags: tool.tags || [],
                short_description: tool.short_description || "",
                badge: tool.badge,
                access_level: tool.access_level,
                tool_url: tool.tool_url,
                status: tool.status,
                is_featured: tool.is_featured,
                sort_order: tool.sort_order,
            });
            setTagsInput((tool.tags || []).join(", "));
        }
    }, [toolData, isEditMode]);

    // ── Auto-generate slug from title ──
    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, title: value }));

        if (!isEditMode && !slugTouched) {
            const autoSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setFormData((prev) => ({ ...prev, slug: autoSlug }));
        }
    };

    // ── Handle tags input ──
    const handleTagsChange = (value: string) => {
        setTagsInput(value);
        const tagsArray = value
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        setFormData((prev) => ({ ...prev, tags: tagsArray }));
    };

    // ── Validation ──
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ToolFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Tool title is required";
        }

        if (!formData.slug.trim()) {
            newErrors.slug = "Tool slug is required";
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
        }

        if (!formData.category_slug.trim()) {
            newErrors.category_slug = "Category is required";
        }

        if (!formData.tool_type.trim()) {
            newErrors.tool_type = "Tool type is required";
        }

        if (!formData.tool_url.trim()) {
            newErrors.tool_url = "Tool URL is required";
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

        // Prepare data in the format expected by API
        const submitData = {
            tool: formData,
            page: {
                tool_slug: formData.slug,
                page_title: formData.title,
            },
        };

        if (isEditMode && toolId) {
            const success = await updateTool(toolId, submitData);
            if (success) {
                router.push("/admin/tools/tools-card");
            }
        } else {
            const success = await createTool(submitData);
            // createTool already redirects on success
        }
    };

    // ── Status Options ──
    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
    ];

    const badgeOptions = [
        { value: "", label: "None" },
        { value: "new", label: "New" },
        { value: "popular", label: "Popular" },
        { value: "pro", label: "Pro" },
    ];

    const accessLevelOptions = [
        { value: "free", label: "Free" },
        { value: "pro", label: "Pro" },
        { value: "premium", label: "Premium" },
    ];

    const categoryOptions =
        categoriesData?.categories.map((cat) => ({
            value: cat.category_slug,
            label: cat.page_title,
        })) || [];

    // ── Loading state ──
    if (isFetching && isEditMode) {
        return (
            <div className="adminPage">
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div className="spinner" />
                    <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
                        Loading tool...
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
        {
            label: isEditMode ? "Update Tool" : "Create Tool",
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
                    title={isEditMode ? "Edit Tool" : "New Tool"}
                    subtitle={
                        isEditMode
                            ? `Update tool: ${toolData?.tool?.title || id}`
                            : "Add a new tool to your directory"
                    }
                    breadcrumbs={[
                        { label: "Admin", href: "/admin" },
                        { label: "Tools", href: "/admin/tools" },
                        { label: "Tools Card", href: "/admin/tools/tools-card" },
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
                    description="Tool name, category, and description"
                    collapsible
                    defaultOpen
                >
                    <FormGroup columns={2}>
                        <TextInput
                            label="Tool Title"
                            placeholder="e.g., ChatGPT"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            error={errors.title}
                            required
                            leftIcon={<FiFileText size={16} />}
                            helperText="Display name for this tool"
                        />
                        <TextInput
                            label="Tool Slug"
                            placeholder="chatgpt"
                            value={formData.slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setFormData((prev) => ({
                                    ...prev,
                                    slug: e.target.value.toLowerCase(),
                                }));
                            }}
                            error={errors.slug}
                            required
                            leftIcon={<FiTag size={16} />}
                            helperText="URL-friendly identifier"
                            disabled={!!isEditMode}
                        />
                    </FormGroup>

                    <FormGroup columns={2}>
                        <Select
                            label="Category"
                            options={categoryOptions}
                            value={formData.category_slug}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    category_slug: e.target.value,
                                }))
                            }
                            error={errors.category_slug}
                            required
                            placeholder="Select category"
                            helperText="Tool category"
                        />
                        <TextInput
                            label="Tool Type"
                            placeholder="e.g., AI Chat, Image Generator"
                            value={formData.tool_type}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, tool_type: e.target.value }))
                            }
                            error={errors.tool_type}
                            required
                            helperText="Type of tool"
                        />
                    </FormGroup>

                    <Textarea
                        label="Short Description"
                        placeholder="Brief description of the tool..."
                        value={formData.short_description}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                short_description: e.target.value,
                            }))
                        }
                        showCharCount
                        maxLength={300}
                        minRows={3}
                        autoResize
                        helperText="Shown in tool cards"
                    />

                    <TextInput
                        label="Tool URL"
                        placeholder="https://example.com/tool"
                        value={formData.tool_url}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, tool_url: e.target.value }))
                        }
                        error={errors.tool_url}
                        required
                        leftIcon={<FiLink size={16} />}
                        leftAddon="https://"
                        helperText="External link to the tool"
                    />

                    <TextInput
                        label="Tags (comma-separated)"
                        placeholder="ai, chatbot, productivity"
                        value={tagsInput}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        helperText="Comma-separated list of tags"
                    />
                </FormSection>

                {/* ── SETTINGS ── */}
                <FormSection
                    title="Settings"
                    description="Status, access level, and visibility"
                    collapsible
                    defaultOpen
                >
                    <FormGroup columns={3}>
                        <Select
                            label="Status"
                            options={statusOptions}
                            value={formData.status}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value as ToolStatus,
                                }))
                            }
                            helperText="Tool visibility"
                        />
                        <Select
                            label="Badge"
                            options={badgeOptions}
                            value={formData.badge || ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    badge: (e.target.value || null) as ToolBadge,
                                }))
                            }
                            helperText="Optional badge"
                        />
                        <Select
                            label="Access Level"
                            options={accessLevelOptions}
                            value={formData.access_level}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    access_level: e.target.value as AccessLevel,
                                }))
                            }
                            helperText="User access level"
                        />
                    </FormGroup>

                    <FormGroup columns={2}>
                        <TextInput
                            label="Sort Order"
                            type="number"
                            value={String(formData.sort_order || 0)}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    sort_order: parseInt(e.target.value) || 0,
                                }))
                            }
                            helperText="Lower numbers appear first"
                        />
                        <div style={{ paddingTop: "28px" }}>
                            <Toggle
                                label="Featured Tool"
                                description="Show in featured section"
                                checked={formData.is_featured}
                                onChange={(val) =>
                                    setFormData((prev) => ({ ...prev, is_featured: val }))
                                }
                            />
                        </div>
                    </FormGroup>
                </FormSection>
            </Form>
        </div>
    );
}