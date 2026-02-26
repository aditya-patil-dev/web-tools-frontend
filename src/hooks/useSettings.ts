/**
 * src/hooks/useSettings.ts
 * ─────────────────────────────────────────────────────────
 * Hooks for the Settings › SEO and Robots panels.
 *
 * useStaticSeo(pageKey)
 *   • Fetches existing record by page_key on mount
 *   • save() → PUT if record exists, POST if new (404 case)
 *   • Exposes flat form values ready to bind to inputs
 *
 * useRobots()
 *   • Fetches all rules + public preview text on mount
 *   • Exposes createRule / updateRule / deleteRule / toggleStatus
 *   • derivePreview() rebuilds the robots.txt preview locally
 *     so the admin sees changes instantly without a refetch
 *
 * ─── Scalability contract ─────────────────────────────────
 *   • Drop-in replace internals with SWR/React Query at any
 *     time — the hook return shape stays identical, so all
 *     consuming components need zero changes.
 *   • Adding a new SEO page: just call useStaticSeo("new-key")
 *     in a new SeoPanel — nothing else to touch.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/components/toast/toast";
import { loading } from "@/components/loading/loading";
import {
    staticSeoService,
    robotsService,
    type StaticSeoRecord,
    type StaticSeoPayload,
    type RobotsRule,
    type RobotsRulePayload,
} from "@/services/seo.service";

// ═══════════════════════════════════════════════════════════
// A.  STATIC SEO HOOK
// ═══════════════════════════════════════════════════════════

// ── A-1.  Form shape (flat strings — easy to bind to inputs)
export type SeoFormValues = {
    // Basic
    meta_title: string;
    meta_description: string;
    meta_keywords: string;   // CSV string; split on save
    canonical_url: string;
    // Open Graph
    og_title: string;
    og_description: string;
    og_image: string;
    og_type: string;
    og_site_name: string;
    twitter_card: string;
    // Advanced
    noindex: boolean;
    nofollow: boolean;
    schema_markup: string;
    // Meta
    status: "active" | "inactive";
};

export const BLANK_SEO: SeoFormValues = {
    meta_title: "", meta_description: "", meta_keywords: "",
    canonical_url: "", og_title: "", og_description: "", og_image: "",
    og_type: "website", og_site_name: "", twitter_card: "summary_large_image",
    noindex: false, nofollow: false, schema_markup: "", status: "active",
};

// ── A-2.  Converters
function recordToForm(r: StaticSeoRecord): SeoFormValues {
    return {
        meta_title: r.meta_title ?? "",
        meta_description: r.meta_description ?? "",
        meta_keywords: (r.meta_keywords ?? []).join(", "),
        canonical_url: r.canonical_url ?? "",
        og_title: r.og_title ?? "",
        og_description: r.og_description ?? "",
        og_image: r.og_image ?? "",
        og_type: r.og_type ?? "website",
        og_site_name: r.og_site_name ?? "",
        twitter_card: r.twitter_card ?? "summary_large_image",
        noindex: r.noindex,
        nofollow: r.nofollow,
        schema_markup: r.schema_markup ?? "",
        status: r.status,
    };
}

function formToPayload(pageKey: string, f: SeoFormValues): StaticSeoPayload {
    return {
        page_key: pageKey,
        meta_title: f.meta_title || null,
        meta_description: f.meta_description || null,
        meta_keywords: f.meta_keywords
            ? f.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)
            : null,
        canonical_url: f.canonical_url || null,
        og_title: f.og_title || null,
        og_description: f.og_description || null,
        og_image: f.og_image || null,
        og_type: f.og_type || null,
        og_site_name: f.og_site_name || null,
        twitter_card: f.twitter_card || null,
        noindex: f.noindex,
        nofollow: f.nofollow,
        schema_markup: f.schema_markup || null,
        status: f.status,
        priority: 1.0,
        changefreq: "weekly",
    };
}

// ── A-3.  Hook return type
export type UseStaticSeoReturn = {
    /** Flat form values — bind directly to inputs */
    form: SeoFormValues;
    /** Set a single field */
    setField: <K extends keyof SeoFormValues>(key: K, value: SeoFormValues[K]) => void;
    /** True while fetching initial data */
    isLoading: boolean;
    /** True while the save request is in flight */
    isSaving: boolean;
    /** True if no record exists in the DB yet (first save will POST) */
    isNew: boolean;
    /** Persist changes — POST or PUT depending on isNew */
    save: () => Promise<void>;
};

// ── A-4.  Hook
export function useStaticSeo(pageKey: string): UseStaticSeoReturn {
    const [record, setRecord] = useState<StaticSeoRecord | null>(null);
    const [form, setForm] = useState<SeoFormValues>(BLANK_SEO);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Abort stale fetches when pageKey changes
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setIsLoading(true);
        setForm(BLANK_SEO);   // reset while loading
        setRecord(null);

        staticSeoService
            .getByPageKey(pageKey)
            .then((res) => {
                setRecord(res.data);
                setForm(recordToForm(res.data));
            })
            .catch((err) => {
                // 404 = no record yet → first save will POST
                if (err?.response?.status !== 404) {
                    toast.error(`Failed to load SEO for "${pageKey}"`);
                }
                setRecord(null);
                setForm({ ...BLANK_SEO });
            })
            .finally(() => setIsLoading(false));

        return () => abortRef.current?.abort();
    }, [pageKey]);

    const setField = useCallback(
        <K extends keyof SeoFormValues>(key: K, value: SeoFormValues[K]) =>
            setForm((prev) => ({ ...prev, [key]: value })),
        []
    );

    const save = useCallback(async () => {
        setIsSaving(true);
        loading.show({ message: "Saving SEO settings…" });
        try {
            const payload = formToPayload(pageKey, form);
            if (record) {
                // Record exists → update
                const res = await staticSeoService.update(record.id, payload);
                setRecord(res.data);
                setForm(recordToForm(res.data));
                toast.success("SEO settings updated");
            } else {
                // No record yet → create
                const res = await staticSeoService.create(payload);
                setRecord(res.data);
                setForm(recordToForm(res.data));
                toast.success("SEO settings created");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to save SEO settings";
            toast.error(msg);
        } finally {
            setIsSaving(false);
            loading.hide();
        }
    }, [pageKey, form, record]);

    return { form, setField, isLoading, isSaving, isNew: record === null, save };
}

// ═══════════════════════════════════════════════════════════
// B.  ROBOTS HOOK
// ═══════════════════════════════════════════════════════════

// ── B-1.  Form shape for add / edit modal
export type RobotsRuleForm = {
    user_agent: string;
    rule_type: RobotsRule["rule_type"];
    path: string;         // empty string → null on save
    crawl_delay: string;         // numeric string → number|null on save
    status: RobotsRule["status"];
    environment: RobotsRule["environment"];
};

export const BLANK_ROBOTS_FORM: RobotsRuleForm = {
    user_agent: "*",
    rule_type: "disallow",
    path: "",
    crawl_delay: "",
    status: "active",
    environment: "production",
};

// ── B-2.  Preview builder (runs client-side → instant feedback)
function buildPreview(rules: RobotsRule[]): string {
    const active = rules.filter((r) => r.status === "active");
    if (!active.length) return "# No active rules";

    // Group by user_agent, preserve insertion order
    const map = new Map<string, RobotsRule[]>();
    active.forEach((r) => {
        if (!map.has(r.user_agent)) map.set(r.user_agent, []);
        map.get(r.user_agent)!.push(r);
    });

    const lines: string[] = [];
    map.forEach((agentRules, agent) => {
        lines.push(`User-agent: ${agent}`);
        agentRules.forEach((r) => {
            if (r.rule_type === "allow" && r.path) lines.push(`Allow: ${r.path}`);
            if (r.rule_type === "disallow" && r.path) lines.push(`Disallow: ${r.path}`);
            if (r.rule_type === "sitemap" && r.path) lines.push(`Sitemap: ${r.path}`);
            if (r.rule_type === "crawl-delay" && r.crawl_delay) lines.push(`Crawl-delay: ${r.crawl_delay}`);
        });
        lines.push("");   // blank line between agent blocks
    });

    return lines.join("\n").trim();
}

function ruleFormToPayload(f: RobotsRuleForm): RobotsRulePayload {
    return {
        user_agent: f.user_agent.trim(),
        rule_type: f.rule_type,
        path: f.path.trim() || null,
        crawl_delay: f.crawl_delay.trim() ? parseInt(f.crawl_delay, 10) : null,
        status: f.status,
        environment: f.environment,
    };
}

// ── B-3.  Hook return type
export type UseRobotsReturn = {
    rules: RobotsRule[];
    isLoading: boolean;
    /** Live preview of the robots.txt that will be served */
    preview: string;
    refetch: () => void;
    createRule: (form: RobotsRuleForm) => Promise<boolean>;
    updateRule: (id: number, form: RobotsRuleForm) => Promise<boolean>;
    deleteRule: (id: number) => Promise<boolean>;
    /** Optimistic toggle: flips status locally + persists */
    toggleStatus: (rule: RobotsRule) => Promise<void>;
};

// ── B-4.  Hook
export function useRobots(): UseRobotsReturn {
    const [rules, setRules] = useState<RobotsRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRules = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await robotsService.getAll();
            setRules(res.data);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load robots rules");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchRules(); }, [fetchRules]);

    // ── CRUD ──────────────────────────────────────────────

    const createRule = useCallback(async (form: RobotsRuleForm): Promise<boolean> => {
        loading.show({ message: "Adding rule…" });
        try {
            const res = await robotsService.create(ruleFormToPayload(form));
            setRules((prev) => [...prev, res.data]);
            toast.success("Rule added");
            return true;
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Failed to add rule");
            return false;
        } finally {
            loading.hide();
        }
    }, []);

    const updateRule = useCallback(async (id: number, form: RobotsRuleForm): Promise<boolean> => {
        loading.show({ message: "Updating rule…" });
        try {
            const res = await robotsService.update(id, ruleFormToPayload(form));
            setRules((prev) => prev.map((r) => (r.id === id ? res.data : r)));
            toast.success("Rule updated");
            return true;
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Failed to update rule");
            return false;
        } finally {
            loading.hide();
        }
    }, []);

    const deleteRule = useCallback(async (id: number): Promise<boolean> => {
        loading.show({ message: "Deleting rule…" });
        try {
            await robotsService.delete(id);
            setRules((prev) => prev.filter((r) => r.id !== id));
            toast.success("Rule deleted");
            return true;
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Failed to delete rule");
            return false;
        } finally {
            loading.hide();
        }
    }, []);

    const toggleStatus = useCallback(async (rule: RobotsRule): Promise<void> => {
        // Optimistic local update first
        const newStatus = rule.status === "active" ? "inactive" : "active";
        setRules((prev) =>
            prev.map((r) => (r.id === rule.id ? { ...r, status: newStatus } : r))
        );
        try {
            const res = await robotsService.update(rule.id, { status: newStatus });
            // Reconcile with server response
            setRules((prev) => prev.map((r) => (r.id === rule.id ? res.data : r)));
        } catch (err: any) {
            // Revert on failure
            setRules((prev) =>
                prev.map((r) => (r.id === rule.id ? { ...r, status: rule.status } : r))
            );
            toast.error("Failed to toggle rule status");
        }
    }, []);

    return {
        rules,
        isLoading,
        preview: buildPreview(rules),
        refetch: fetchRules,
        createRule,
        updateRule,
        deleteRule,
        toggleStatus,
    };
}