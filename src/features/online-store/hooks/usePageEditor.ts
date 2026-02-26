// src/features/online-store/hooks/usePageEditor.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { pageComponentsApi } from "../api/page-components.api";
import { PageComponent } from "../registry/types";

/**
 * usePageEditor
 *
 * Single source of truth for the entire editor's state and actions.
 * The page component stays thin — it just consumes this hook.
 */
export function usePageEditor(pageKey: string) {
    const [components, setComponents] = useState<PageComponent[]>([]);
    const [pending, setPending] = useState<Map<number, Record<string, unknown>>>(new Map());
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [savingAll, setSavingAll] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

    /* ── helpers ── */
    const sortedComponents = [...components].sort((a, b) => a.component_order - b.component_order);

    /** Data for a component — prefers pending (unsaved) over DB data */
    const getLiveData = (id: number) => pending.get(id) ?? components.find(c => c.id === id)?.component_data ?? {};

    const hasPending = pending.size > 0;
    const pendingCount = pending.size;

    /* ─────────────────────────────────────────────────────
       LOAD  →  GET /page-components/admin?page_key=...
    ───────────────────────────────────────────────────── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await pageComponentsApi.getAll(pageKey);
            if (res.success) {
                setComponents((res.data ?? []).sort((a, b) => a.component_order - b.component_order));
                setPending(new Map()); // clear any pending on reload
            } else {
                toast.error(res.message ?? "Failed to load sections");
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Server error loading sections");
        } finally {
            setLoading(false);
        }
    }, [pageKey]);

    /* ─────────────────────────────────────────────────────
       LOCAL FIELD CHANGE  →  instant preview, no API yet
    ───────────────────────────────────────────────────── */
    const onFieldChange = (id: number, data: Record<string, unknown>) => {
        setPending(prev => new Map(prev).set(id, data));
    };

    const discardChanges = (id: number) => {
        setPending(prev => { const m = new Map(prev); m.delete(id); return m; });
    };

    /* ─────────────────────────────────────────────────────
       SAVE ONE  →  PUT /page-components/admin/:id
    ───────────────────────────────────────────────────── */
    const saveOne = async (id: number) => {
        const newData = pending.get(id);
        if (!newData) return;

        const comp = components.find(c => c.id === id);
        if (!comp) return;

        setSavingId(id);
        try {
            const res = await pageComponentsApi.update(id, { component_data: newData });
            if (res.success) {
                setComponents(prev => prev.map(c => c.id === id ? { ...c, component_data: newData } : c));
                setPending(prev => { const m = new Map(prev); m.delete(id); return m; });
                toast.success(`"${comp.component_name}" saved!`);
            } else {
                toast.error(res.message ?? "Save failed");
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Failed to save section");
        } finally {
            setSavingId(null);
        }
    };

    /* ─────────────────────────────────────────────────────
       SAVE ALL  →  PUT for each dirty component in parallel
    ───────────────────────────────────────────────────── */
    const saveAll = async () => {
        if (!pending.size) { toast.info("Nothing to save"); return; }

        setSavingAll(true);
        const entries = Array.from(pending.entries());

        const results = await Promise.allSettled(
            entries.map(([id, data]) =>
                pageComponentsApi.update(id, { component_data: data })
                    .then(res => ({ id, data, ok: res.success, message: res.message }))
            )
        );

        const saved: number[] = [];
        results.forEach(r => {
            if (r.status === "fulfilled" && r.value.ok) saved.push(r.value.id);
        });

        if (saved.length) {
            setComponents(prev =>
                prev.map(c => saved.includes(c.id) ? { ...c, component_data: pending.get(c.id)! } : c)
            );
            setPending(prev => { const m = new Map(prev); saved.forEach(id => m.delete(id)); return m; });
            toast.success(`Saved ${saved.length} section${saved.length > 1 ? "s" : ""}!`);
        }

        const failed = entries.length - saved.length;
        if (failed) toast.error(`${failed} section${failed > 1 ? "s" : ""} failed to save`);

        setSavingAll(false);
    };

    /* ─────────────────────────────────────────────────────
       TOGGLE VISIBILITY  →  PUT /page-components/admin/:id
    ───────────────────────────────────────────────────── */
    const toggleVisibility = async (id: number) => {
        const comp = components.find(c => c.id === id);
        if (!comp) return;
        try {
            const res = await pageComponentsApi.update(id, { is_active: !comp.is_active });
            if (res.success) {
                setComponents(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
            } else {
                toast.error(res.message ?? "Failed to update visibility");
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Failed to update visibility");
        }
    };

    /* ─────────────────────────────────────────────────────
       DUPLICATE  →  POST /page-components/admin/:id/duplicate
    ───────────────────────────────────────────────────── */
    const duplicate = async (id: number) => {
        setDuplicatingId(id);
        try {
            const res = await pageComponentsApi.duplicate(id);
            if (res.success) {
                toast.success("Section duplicated as draft");
                await load(); // reload to pick up the new row
            } else {
                toast.error(res.message ?? "Duplicate failed");
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Failed to duplicate");
        } finally {
            setDuplicatingId(null);
        }
    };

    /* ─────────────────────────────────────────────────────
       DELETE  →  DELETE /page-components/admin/:id
    ───────────────────────────────────────────────────── */
    const deleteSection = async (id: number) => {
        setDeletingId(id);
        try {
            const res = await pageComponentsApi.remove(id);
            if (res.success) {
                setComponents(prev => prev.filter(c => c.id !== id));
                setPending(prev => { const m = new Map(prev); m.delete(id); return m; });
                toast.success("Section deleted");
            } else {
                toast.error(res.message ?? "Delete failed");
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    /* ─────────────────────────────────────────────────────
       REORDER  →  POST /page-components/admin/reorder
       Uses optimistic update — UI moves instantly
    ───────────────────────────────────────────────────── */
    const moveSection = async (id: number, direction: "up" | "down") => {
        const sorted = [...components].sort((a, b) => a.component_order - b.component_order);
        const idx = sorted.findIndex(c => c.id === id);
        if (idx === -1) return;

        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= sorted.length) return;

        // swap
        const reordered = [...sorted];
        [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
        const withOrder = reordered.map((c, i) => ({ ...c, component_order: i + 1 }));

        setComponents(withOrder); // optimistic

        try {
            await pageComponentsApi.reorder(
                withOrder.map(c => ({ id: c.id, component_order: c.component_order }))
            );
        } catch {
            toast.error("Reorder failed — refreshing…");
            await load();
        }
    };

    /* ── expose everything the UI needs ── */
    return {
        /* state */
        components: sortedComponents,
        pending,
        loading,
        savingId,
        savingAll,
        deletingId,
        duplicatingId,
        hasPending,
        pendingCount,
        /* derived */
        getLiveData,
        /* actions */
        load,
        onFieldChange,
        discardChanges,
        saveOne,
        saveAll,
        toggleVisibility,
        duplicate,
        deleteSection,
        moveSection,
    };
}

export type PageEditorState = ReturnType<typeof usePageEditor>;