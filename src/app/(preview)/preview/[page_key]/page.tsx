import PreviewClient from "./PreviewClient";

async function getPageComponents(pageKey: string) {
    try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        if (!base) return [];

        const res = await fetch(
            `${base}/page-components/page/${pageKey}`,
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
    } catch {
        return [];
    }
}

interface PreviewPageProps {
    params: { page_key: string };
    searchParams: { mode?: string; draft?: string };
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
    const isEditorMode = searchParams?.mode === "editor";

    // In editor mode, skip the API fetch entirely.
    // Canvas will push data via postMessage once the iframe loads.
    if (isEditorMode) {
        return <PreviewClient editorMode components={[]} initialDraft={{}} />;
    }

    // Normal (public) mode — fetch from API as before
    const components = await getPageComponents(params.page_key);

    let initialDraft: Record<number, Record<string, unknown>> = {};
    if (searchParams?.draft) {
        try { initialDraft = JSON.parse(atob(searchParams.draft)); } catch { }
    }

    const active = components
        .filter((c: any) => c.is_active)
        .sort((a: any, b: any) => a.component_order - b.component_order)
        .map((c: any) => ({
            id: c.id,
            type: c.component_type,
            data: c.component_data,
            order: c.component_order,
            active: c.is_active,
        }));

    return <PreviewClient components={active} initialDraft={initialDraft} />;
}