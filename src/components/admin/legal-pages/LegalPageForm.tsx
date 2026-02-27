"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FiFileText,
    FiLink,
    FiCheckCircle,
    FiKey,
} from "react-icons/fi";

import PageHeader from "@/components/page-header/PageHeader";

import TextInput from "@/components/forms/TextInput";
import Textarea from "@/components/forms/Textarea";
import Select from "@/components/forms/Select";
import Toggle from "@/components/forms/Toggle";
import RichTextEditor from "@/components/forms/RichTextEditor";

import {
    Form,
    FormSection,
    FormGroup,
} from "@/components/forms/FormLayout";

import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";

import {
    legalPagesAdmin,
    type LegalPageData,
    type CreateLegalPagePayload,
    type UpdateLegalPagePayload,
} from "@/lib/api-calls/legalPagesApi";


interface Props {
    id?: number | null;
}


export default function LegalPageForm({ id }: Props) {

    const router = useRouter();

    const isEditMode = !!id;


    /*
    ───────────────────────────────
    State
    ───────────────────────────────
    */

    const [formData, setFormData] =
        useState<CreateLegalPagePayload>({
            page_key: "",
            slug: "",
            title: "",
            content: "",
            meta_title: "",
            meta_description: "",
            canonical_url: "",
            noindex: false,
            status: "draft",
        });


    const [errors, setErrors] =
        useState<Record<string, string>>({});


    const [isFetching, setIsFetching] =
        useState(false);


    const [isSubmitting, setIsSubmitting] =
        useState(false);


    const [slugTouched, setSlugTouched] =
        useState(false);



    /*
    ───────────────────────────────
    Fetch existing page (edit)
    ───────────────────────────────
    */

    useEffect(() => {

        if (!id) return;

        const fetchPage = async () => {

            try {

                setIsFetching(true);

                const page: LegalPageData =
                    await legalPagesAdmin.fetchById(id);

                setFormData({

                    page_key: page.page_key,
                    slug: page.slug,
                    title: page.title,
                    content: page.content,

                    meta_title: page.meta_title || "",
                    meta_description:
                        page.meta_description || "",

                    canonical_url:
                        page.canonical_url || "",

                    noindex: page.noindex,

                    status: page.status,

                });

            }
            catch (err: any) {

                toast.error(
                    err?.message ||
                    "Failed to load legal page"
                );

                router.push("/admin/legal");

            }
            finally {
                setIsFetching(false);
            }

        };

        fetchPage();

    }, [id, router]);



    /*
    ───────────────────────────────
    Auto generate slug
    ───────────────────────────────
    */

    const handleTitleChange = (value: string) => {

        setFormData(prev => ({
            ...prev,
            title: value,
        }));

        if (!isEditMode && !slugTouched) {

            const slug =
                value
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-");

            setFormData(prev => ({
                ...prev,
                slug,
                page_key: slug,
            }));

        }

    };



    /*
    ───────────────────────────────
    Validation
    ───────────────────────────────
    */

    const validate = () => {

        const newErrors:
            Record<string, string> = {};

        if (!formData.title.trim())
            newErrors.title =
                "Title is required";

        if (!formData.slug.trim())
            newErrors.slug =
                "Slug is required";

        if (!formData.page_key.trim())
            newErrors.page_key =
                "Page key required";

        if (!formData.content.trim())
            newErrors.content =
                "Content required";


        setErrors(newErrors);

        if (Object.keys(newErrors).length)
            toast.warning(
                "Fix errors before submit"
            );

        return !Object.keys(newErrors).length;

    };



    /*
    ───────────────────────────────
    Submit
    ───────────────────────────────
    */

    const handleSubmit =
        async (e: React.FormEvent) => {

            e.preventDefault();

            if (!validate())
                return;

            setIsSubmitting(true);

            loading.show({

                message:
                    isEditMode
                        ? "Updating page..."
                        : "Creating page..."

            });

            try {

                if (isEditMode && id) {

                    await legalPagesAdmin.update(
                        id,
                        formData as UpdateLegalPagePayload
                    );

                    toast.success(
                        "Page updated"
                    );

                }
                else {

                    await legalPagesAdmin.create(
                        formData
                    );

                    toast.success(
                        "Page created"
                    );

                }

                router.push(
                    "/admin/legal"
                );

            }
            catch (err: any) {

                toast.error(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed"
                );

            }
            finally {

                setIsSubmitting(false);
                loading.hide();

            }

        };



    /*
    ───────────────────────────────
    Loading UI
    ───────────────────────────────
    */

    if (isFetching)
        return (
            <div className="adminPage">

                <div
                    style={{
                        textAlign: "center",
                        padding: 80
                    }}
                >
                    Loading...
                </div>

            </div>
        );



    /*
    ───────────────────────────────
    Render
    ───────────────────────────────
    */

    return (

        <div className="adminPage">

            <Form onSubmit={handleSubmit}>


                <PageHeader

                    title={
                        isEditMode
                            ? "Edit Legal Page"
                            : "New Legal Page"
                    }

                    subtitle="
Manage privacy policy, terms and other legal content
"

                    showBack

                    onBack={() =>
                        router.back()
                    }

                    actions={[

                        {
                            label: "Cancel",
                            variant: "ghost",
                            onClick: () =>
                                router.back(),
                        },

                        {
                            label:
                                isEditMode
                                    ? "Update Page"
                                    : "Create Page",

                            variant: "primary",

                            type: "submit",

                            leftIcon:
                                <FiCheckCircle size={16} />,

                            isLoading:
                                isSubmitting,

                        },

                    ]}

                    stickyActions

                />


                {/* BASIC */}

                <FormSection
                    title="Basic Information"
                    defaultOpen
                >

                    <FormGroup columns={2}>

                        <TextInput
                            label="Title"
                            required
                            value={formData.title}
                            error={errors.title}
                            onChange={(e) =>
                                handleTitleChange(
                                    e.target.value
                                )
                            }
                            leftIcon={
                                <FiFileText size={16} />
                            }
                        />


                        <TextInput
                            label="Slug"
                            required
                            value={formData.slug}
                            error={errors.slug}
                            disabled={
                                isEditMode
                            }
                            onChange={(e) => {

                                setSlugTouched(
                                    true
                                );

                                setFormData(
                                    prev => ({
                                        ...prev,
                                        slug:
                                            e.target.value
                                    })
                                );

                            }}
                            leftIcon={
                                <FiLink size={16} />
                            }
                        />

                    </FormGroup>


                    <TextInput
                        label="Page Key"
                        required
                        value={formData.page_key}
                        error={errors.page_key}
                        disabled={
                            isEditMode
                        }
                        onChange={(e) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    page_key:
                                        e.target.value
                                })
                            )
                        }
                        leftIcon={
                            <FiKey size={16} />
                        }
                    />


                    <RichTextEditor
                        label="Content"
                        required
                        value={formData.content}
                        error={errors.content}
                        onChange={(html) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    content: html
                                })
                            )
                        }
                    />

                </FormSection>



                {/* SEO */}

                <FormSection
                    title="SEO Metadata"
                    defaultOpen
                >

                    <TextInput
                        label="Meta Title"
                        value={
                            formData.meta_title
                        }
                        onChange={(e) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    meta_title:
                                        e.target.value
                                })
                            )
                        }
                    />


                    <Textarea
                        label="Meta Description"
                        value={
                            formData.meta_description
                        }
                        onChange={(e) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    meta_description:
                                        e.target.value
                                })
                            )
                        }
                    />


                    <TextInput
                        label="Canonical URL"
                        value={
                            formData.canonical_url
                        }
                        onChange={(e) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    canonical_url:
                                        e.target.value
                                })
                            )
                        }
                    />


                    <Select
                        label="Status"
                        value={
                            formData.status
                        }
                        options={[
                            {
                                value: "draft",
                                label: "Draft"
                            },
                            {
                                value:
                                    "published",
                                label:
                                    "Published"
                            },
                        ]}
                        onChange={(e) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    status:
                                        e.target.value as any
                                })
                            )
                        }
                    />


                    <Toggle
                        label="Noindex"
                        description="
Prevent search engines from indexing this page
"
                        checked={
                            formData.noindex
                        }
                        onChange={(val) =>
                            setFormData(
                                prev => ({
                                    ...prev,
                                    noindex: val
                                })
                            )
                        }
                    />

                </FormSection>


            </Form>

        </div>

    );

}