// src/features/online-store/registry/types.ts

/* ─────────────────────────────────────────────
   Core DB shape (matches your page_components table)
───────────────────────────────────────────── */
export type ComponentStatus = "active" | "draft" | "archived";

export interface PageComponent {
    id: number;
    page_key: string;
    component_type: string;
    component_order: number;
    component_name: string;
    component_data: Record<string, unknown>;
    is_active: boolean;
    status: ComponentStatus;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/* ─────────────────────────────────────────────
   EditorProps<T>
   Used inside each section file for full type safety.
   e.g.  EditorProps<HeroData>  inside hero/index.tsx
───────────────────────────────────────────── */
export interface EditorProps<T = unknown> {
    /** Current live data (may include unsaved pending changes) */
    data: T;
    /** Called on every keystroke — triggers instant iframe preview */
    onChange: (updated: T) => void;
}

//    SectionDefinition
//    What every sections index tsx must export as default.

export interface SectionDefinition<T = unknown> {
    /** Matches component_type in DB — e.g. "hero" */
    type: string;
    /** Human-readable label shown in the sidebar */
    label: string;
    /** Emoji icon shown in the sidebar */
    icon: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Editor: React.FC<EditorProps<any>>;
    /** Seed data used when creating a new section of this type */
    defaultData: T;
}

/* ─────────────────────────────────────────────
   Reorder payload
───────────────────────────────────────────── */
export interface ReorderItem {
    id: number;
    component_order: number;
}