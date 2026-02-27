"use client";

/**
 * src/app/(admin)/admin/settings/page.tsx
 * ─────────────────────────────────────────────────────────
 * Navigation:
 *   General   → General, Users & Roles
 *   SEO       → Homepage, About Page, Pricing Page   ← API integrated
 *   Legal     → Legal Pages (table manager)
 *   Technical → Robots.txt, Email / SMTP             ← API integrated
 *
 * ─── Scalability contract ─────────────────────────────────
 *  • Add a nav item  → one object in SECTIONS[]
 *  • Add a panel     → one case in renderPanel()
 *  • Add an SEO page → one entry in SEO_PAGE_KEYS (service file)
 *                      one case in renderPanel() reusing <SeoPanel>
 *  • GROUPS derived  → no manual sync needed
 */

import { useState } from "react";
import {
    FiSettings, FiUsers, FiGlobe, FiFileText,
    FiShield, FiCode, FiMail, FiChevronRight,
    FiSave, FiCheck, FiAlertTriangle, FiPlus,
    FiEdit2, FiTrash2, FiEye, FiEyeOff, FiExternalLink,
    FiLoader, FiRefreshCw,
} from "react-icons/fi";
import PageHeader from "@/components/page-header/PageHeader";
import TextInput from "@/components/forms/TextInput";
import Textarea from "@/components/forms/Textarea";
import Toggle from "@/components/forms/Toggle";
import Select from "@/components/forms/Select";
import { FormSection, FormGroup } from "@/components/forms/FormLayout";

// Hooks (src/hooks/useSettings.ts)
import {
    useStaticSeo,
    useRobots,
    BLANK_ROBOTS_FORM,
    type SeoFormValues,
    type RobotsRuleForm,
    type UseStaticSeoReturn,
    type UseRobotsReturn,
} from "@/hooks/useSettings";

// Service constants (src/services/settings.service.ts)
import { SEO_PAGE_KEYS } from "@/services/seo.service";
import type { RobotsRule } from "@/services/seo.service";

// ═══════════════════════════════════════════════════════════
// 1.  NAV CONFIG — single source of truth
// ═══════════════════════════════════════════════════════════
type NavSection = {
    id: string;
    label: string;
    icon: React.ReactNode;
    group: string;
    description: string;
    badge?: string;
    badgeColor?: string;
};

const SECTIONS: NavSection[] = [
    // General
    { id: "general", label: "General", group: "General", icon: <FiSettings size={15} />, description: "Site identity, contact info, social links and analytics" },
    { id: "users", label: "Users & Roles", group: "General", icon: <FiUsers size={15} />, description: "Registration, authentication, and access control" },
    // SEO — each id maps directly to a page_key via SEO_PAGE_KEYS
    { id: "seo-homepage", label: "Homepage", group: "SEO", icon: <FiGlobe size={15} />, description: "Meta tags and structured data for the homepage" },
    { id: "seo-about", label: "About Page", group: "SEO", icon: <FiFileText size={15} />, description: "Meta tags and structured data for the About page" },
    { id: "seo-pricing", label: "Pricing Page", group: "SEO", icon: <FiFileText size={15} />, description: "Meta tags and structured data for the Pricing page" },
    // Technical
    { id: "robots", label: "Robots.txt", group: "Technical", icon: <FiCode size={15} />, description: "Control how search engines crawl your site" },
    { id: "smtp", label: "Email / SMTP", group: "Technical", icon: <FiMail size={15} />, description: "Outgoing email server configuration" },
];

const GROUPS = SECTIONS.reduce<string[]>((acc, s) => {
    if (!acc.includes(s.group)) acc.push(s.group);
    return acc;
}, []);

// ═══════════════════════════════════════════════════════════
// 2.  SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════

/** Local-only save feedback (used by panels without API yet) */
function useSave() {
    const [saving, setSaving] = useState(false);
    const save = () => { setSaving(true); setTimeout(() => setSaving(false), 1800); };
    return { saving, save };
}

/** Save bar — accepts real isSaving bool from hook OR local state */
function SaveBar({
    onSave,
    saving,
    disabled = false,
}: {
    onSave: () => void;
    saving: boolean;
    disabled?: boolean;
}) {
    return (
        <div style={{
            display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px",
            paddingTop: "var(--space-5)", borderTop: "1px solid var(--border-primary)",
            marginTop: "var(--space-6)",
        }}>
            {saving && (
                <span style={{ fontSize: "var(--font-xs)", color: "var(--color-success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                    <FiCheck size={12} /> Saved successfully
                </span>
            )}
            <button
                onClick={onSave}
                disabled={saving || disabled}
                style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px",
                    borderRadius: "var(--radius-lg)", border: "none",
                    background: (saving || disabled) ? "var(--bg-tertiary)" : "var(--gradient-primary)",
                    color: (saving || disabled) ? "var(--text-tertiary)" : "#fff",
                    fontWeight: 700, fontSize: "var(--font-sm)",
                    cursor: (saving || disabled) ? "not-allowed" : "pointer",
                    boxShadow: (saving || disabled) ? "none" : "0 4px 14px rgba(255,107,53,0.35)",
                    transition: "all var(--transition-fast)",
                }}
            >
                {saving
                    ? <><FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                    : <><FiSave size={14} /> Save Changes</>
                }
            </button>
        </div>
    );
}

/** Panel loading skeleton */
function PanelSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[80, 60, 100, 60].map((w, i) => (
                <div key={i} style={{
                    height: "42px", borderRadius: "var(--radius-lg)",
                    background: "var(--bg-tertiary)",
                    width: `${w}%`,
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: `${i * 150}ms`,
                }} />
            ))}
        </div>
    );
}

/** Info / warning banner */
function Banner({ message, type = "info" }: { message: React.ReactNode; type?: "info" | "warning" }) {
    const c = type === "warning"
        ? { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", text: "#92400e", icon: "#f59e0b" }
        : { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)", text: "var(--text-secondary)", icon: "#3b82f6" };
    return (
        <div style={{
            padding: "12px 16px", borderRadius: "var(--radius-lg)", background: c.bg,
            border: `1px solid ${c.border}`, display: "flex", gap: "12px", marginBottom: "var(--space-4)"
        }}>
            <FiAlertTriangle size={15} style={{ color: c.icon, flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "var(--font-sm)", color: c.text, lineHeight: 1.55, margin: 0 }}>{message}</p>
        </div>
    );
}

/** "New record" info strip shown when no DB record exists yet */
function NewRecordBanner() {
    return (
        <Banner
            type="info"
            message="No SEO record exists for this page yet. Fill in the fields below and click Save — the record will be created automatically."
        />
    );
}

// Shared button style objects
const S = {
    iconBtn: {
        width: "28px", height: "28px", borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-primary)", background: "var(--bg-primary)",
        color: "var(--text-tertiary)", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", transition: "all var(--transition-fast)", flexShrink: 0,
    } as React.CSSProperties,
    iconBtnDanger: {
        color: "var(--color-error)", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.04)",
    } as React.CSSProperties,
    primary: {
        display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px",
        borderRadius: "var(--radius-lg)", border: "none", background: "var(--gradient-primary)",
        color: "#fff", fontWeight: 700, fontSize: "var(--font-sm)", cursor: "pointer",
        boxShadow: "0 4px 14px rgba(255,107,53,0.3)", transition: "all var(--transition-fast)",
    } as React.CSSProperties,
    ghost: {
        padding: "10px 20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-primary)",
        background: "var(--bg-secondary)", color: "var(--text-secondary)", fontWeight: 600,
        fontSize: "var(--font-sm)", cursor: "pointer", transition: "all var(--transition-fast)",
    } as React.CSSProperties,
    danger: {
        display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px",
        borderRadius: "var(--radius-lg)", border: "none", background: "var(--color-error)",
        color: "#fff", fontWeight: 700, fontSize: "var(--font-sm)", cursor: "pointer",
        boxShadow: "0 4px 14px rgba(239,68,68,0.35)", transition: "all var(--transition-fast)",
    } as React.CSSProperties,
};

// ═══════════════════════════════════════════════════════════
// 3.  PANELS
// ═══════════════════════════════════════════════════════════

// ── 3a. General (no API yet — stub save) ───────────────────
function GeneralPanel() {
    const { saving, save } = useSave();
    return (
        <>
            <FormSection className="Form-Section-main" title="Site Identity" description="Core information about your website" collapsible defaultOpen>
                <FormGroup columns={2}>
                    <TextInput label="Site Name" placeholder="Your Website Name" required />
                    <TextInput label="Site Tagline" placeholder="Short tagline or motto" />
                </FormGroup>
                <TextInput label="Site URL" placeholder="yoursite.com" leftAddon="https://" required helperText="Canonical root URL — used in sitemaps and emails" />
                <Textarea label="Site Description" placeholder="Default meta description used when no page-level description is set..." minRows={3} autoResize showCharCount maxLength={160} />
                <FormGroup columns={2}>
                    <TextInput label="Logo URL" placeholder="/logo.png" helperText="Used in header and emails" />
                    <TextInput label="Favicon URL" placeholder="/favicon.ico" helperText="32×32px ICO or PNG" />
                </FormGroup>
            </FormSection>

            <FormSection className="Form-Section-main" title="Analytics & Tracking" description="Search console verification and analytics IDs" collapsible>
                <FormGroup columns={2}>
                    <TextInput label="Google Analytics ID" placeholder="G-XXXXXXXXXX" helperText="GA4 Measurement ID" />
                    <TextInput label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" />
                </FormGroup>
                <FormGroup columns={2}>
                    <TextInput label="Google Search Console" placeholder="google-site-verification=xxxxx" />
                    <TextInput label="Bing Webmaster" placeholder="msvalidate.01=xxxxx" />
                </FormGroup>
                <FormGroup columns={2}>
                    <TextInput label="Facebook Pixel ID" placeholder="123456789" />
                    <TextInput label="Hotjar Site ID" placeholder="1234567" />
                </FormGroup>
            </FormSection>

            <SaveBar onSave={save} saving={saving} />
        </>
    );
}

// ── 3b. Users & Roles (no API yet — stub save) ─────────────
function UsersPanel() {
    const { saving, save } = useSave();
    return (
        <>
            <FormSection className="Form-Section-main" title="Registration" description="Who can create an account and how" collapsible defaultOpen>
                <Toggle label="Allow Public Registration" description="Visitors can create accounts on the site" checked={true} onChange={() => { }} />
                <Toggle label="Email Verification Required" description="New accounts must verify email before using features" checked={true} onChange={() => { }} />
                <Toggle label="Admin Approval Required" description="New accounts need admin approval before they can log in" checked={false} onChange={() => { }} />
                <FormGroup columns={2}>
                    <Select label="Default User Role" value="user" onChange={() => { }} options={[
                        { value: "user", label: "User" },
                        { value: "editor", label: "Editor" },
                    ]} />
                    <TextInput label="Max Accounts Per IP" placeholder="5" type="number" helperText="0 = unlimited" />
                </FormGroup>
            </FormSection>

            <FormSection className="Form-Section-main" title="Authentication" description="Login, session, and lockout settings" collapsible defaultOpen>
                <FormGroup columns={2}>
                    <TextInput label="Session Duration (hours)" placeholder="24" type="number" />
                    <TextInput label="Max Login Attempts" placeholder="5" type="number" helperText="Before account lockout" />
                </FormGroup>
                <FormGroup columns={2}>
                    <TextInput label="Lockout Duration (minutes)" placeholder="30" type="number" />
                    <Select label="2FA Requirement" value="optional" onChange={() => { }} options={[
                        { value: "disabled", label: "Disabled" },
                        { value: "optional", label: "Optional" },
                        { value: "required", label: "Required for all users" },
                        { value: "admin-only", label: "Required for admins" },
                    ]} />
                </FormGroup>
            </FormSection>

            <FormSection className="Form-Section-main" title="OAuth / Social Login" description="Third-party sign-in providers" collapsible defaultOpen>
                <Toggle label="Google Sign-In" description="Allow users to sign in with Google" checked={false} onChange={() => { }} />
                <Toggle label="GitHub Sign-In" description="Allow users to sign in with GitHub" checked={false} onChange={() => { }} />
                <Toggle label="Facebook Sign-In" description="Allow users to sign in with Facebook" checked={false} onChange={() => { }} />
            </FormSection>

            <FormSection className="Form-Section-main" title="User Notifications" description="Automated emails sent to users" collapsible defaultOpen>
                <Toggle label="Welcome Email" description="Send welcome email after registration" checked={true} onChange={() => { }} />
                <Toggle label="Email Verification" description="Send verification link on signup" checked={true} onChange={() => { }} />
                <Toggle label="Password Reset" description="Enable password reset via email" checked={true} onChange={() => { }} />
                <Toggle label="Subscription Confirmation" description="Email receipt on plan purchase" checked={true} onChange={() => { }} />
                <Toggle label="Usage Limit Warnings" description="Notify when approaching plan limits" checked={true} onChange={() => { }} />
                <Toggle label="Plan Expiry Reminder" description="Send reminder 7 days before plan expires" checked={true} onChange={() => { }} />
            </FormSection>

            <FormSection className="Form-Section-main" title="Admin Alerts" description="Notify admins on key site events" collapsible>
                <TextInput label="Admin Alert Email" placeholder="admin@yoursite.com" type="email" helperText="Destination for all admin notifications" />
                <Toggle label="New User Registration" description="Alert when a new user signs up" checked={true} onChange={() => { }} />
                <Toggle label="New Subscription" description="Alert when a plan is purchased" checked={true} onChange={() => { }} />
                <Toggle label="Payment Failure" description="Alert on failed payment attempts" checked={true} onChange={() => { }} />
                <Toggle label="Contact Form Submission" description="Alert on contact form submissions" checked={true} onChange={() => { }} />
            </FormSection>

            <FormSection className="Form-Section-main" title="Account Lifecycle" description="Data retention and self-service deletion" collapsible>
                <Toggle label="Allow Account Self-Deletion" description="Users can permanently delete their own account" checked={true} onChange={() => { }} />
                <TextInput label="Data Retention After Deletion (days)" placeholder="90" type="number" helperText="How long to retain data after account deletion" />
            </FormSection>

            <SaveBar onSave={save} saving={saving} />
        </>
    );
}

// ── 3c. SEO Panel — FULLY API INTEGRATED ───────────────────
/**
 * SeoPanel is a pure presentational component.
 * All data-fetching / saving is owned by the hook passed in via `seo`.
 * To add a new page: create a new wrapper that calls useStaticSeo with
 * the correct page_key — this component needs zero changes.
 */
function SeoPanel({
    pageLabel,
    pagePath,
    seo,
}: {
    pageLabel: string;
    pagePath: string;
    seo: UseStaticSeoReturn;
}) {
    const { form, setField, isLoading, isSaving, isNew, save } = seo;

    if (isLoading) return <PanelSkeleton />;

    return (
        <>
            {isNew && <NewRecordBanner />}

            {/* ── Basic SEO ── */}
            <FormSection className="Form-Section-main" title="Basic SEO" description={`Meta tags for the ${pageLabel}`} collapsible defaultOpen>
                <TextInput
                    label="Page Title"
                    placeholder={`${pageLabel} | YourSite`}
                    value={form.meta_title}
                    onChange={(e) => setField("meta_title", e.target.value)}
                    showCharCount maxLength={60}
                    helperText="Ideal: 50-60 characters. Shown in browser tabs and search results."
                />
                <Textarea
                    label="Meta Description"
                    placeholder="Compelling description for search results..."
                    value={form.meta_description}
                    onChange={(e) => setField("meta_description", e.target.value)}
                    showCharCount maxLength={160} minRows={3} autoResize
                    helperText="Ideal: 150-160 characters"
                />
                <TextInput
                    label="Meta Keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={form.meta_keywords}
                    onChange={(e) => setField("meta_keywords", e.target.value)}
                    helperText="Comma-separated. Converted to array on save."
                />
                <TextInput
                    label="Canonical URL"
                    placeholder={`https://yoursite.com${pagePath}`}
                    value={form.canonical_url}
                    onChange={(e) => setField("canonical_url", e.target.value)}
                    leftAddon="https://"
                    helperText="Preferred canonical URL for this page"
                />
            </FormSection>

            {/* ── Open Graph / Social ── */}
            <FormSection className="Form-Section-main" title="Open Graph / Social" description="Controls social share card appearance" collapsible defaultOpen>
                <FormGroup columns={2}>
                    <TextInput
                        label="OG Title"
                        placeholder={`${pageLabel} | YourSite`}
                        value={form.og_title}
                        onChange={(e) => setField("og_title", e.target.value)}
                    />
                    <TextInput
                        label="OG Site Name"
                        placeholder="Your Brand Name"
                        value={form.og_site_name}
                        onChange={(e) => setField("og_site_name", e.target.value)}
                    />
                </FormGroup>
                <Textarea
                    label="OG Description"
                    placeholder="Description shown on social media cards..."
                    value={form.og_description}
                    onChange={(e) => setField("og_description", e.target.value)}
                    minRows={2} autoResize
                />
                <TextInput
                    label="OG Image URL"
                    placeholder="https://yoursite.com/og-image.jpg"
                    value={form.og_image}
                    onChange={(e) => setField("og_image", e.target.value)}
                    helperText="Recommended: 1200×630px JPG or PNG"
                />
                <FormGroup columns={2}>
                    <Select
                        label="OG Type"
                        value={form.og_type}
                        onChange={(e) => setField("og_type", e.target.value)}
                        options={[
                            { value: "website", label: "website" },
                            { value: "article", label: "article" },
                        ]}
                    />
                    <TextInput
                        label="Twitter Card"
                        placeholder="summary_large_image"
                        value={form.twitter_card}
                        onChange={(e) => setField("twitter_card", e.target.value)}
                        helperText="summary or summary_large_image"
                    />
                </FormGroup>
            </FormSection>

            <SaveBar onSave={save} saving={isSaving} />
        </>
    );
}

// ── 3e. Robots Panel — FULLY API INTEGRATED ────────────────
function RobotsRuleModal({
    open,
    editing,
    onClose,
    onSave,
}: {
    open: boolean;
    editing: RobotsRule | null;
    onClose: () => void;
    onSave: (form: RobotsRuleForm, id?: number) => Promise<boolean>;
}) {
    const [form, setForm] = useState<RobotsRuleForm>(BLANK_ROBOTS_FORM);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof RobotsRuleForm, string>>>({});

    // Sync form when editing target changes
    useState(() => {
        if (editing) {
            setForm({
                user_agent: editing.user_agent,
                rule_type: editing.rule_type,
                path: editing.path ?? "",
                crawl_delay: editing.crawl_delay != null ? String(editing.crawl_delay) : "",
                status: editing.status,
                environment: editing.environment,
            });
        } else {
            setForm(BLANK_ROBOTS_FORM);
        }
        setErrors({});
    });

    const sf = <K extends keyof RobotsRuleForm>(k: K, v: RobotsRuleForm[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const validate = () => {
        const e: typeof errors = {};
        if (!form.user_agent.trim()) e.user_agent = "User-agent is required";
        if (form.rule_type !== "crawl-delay" && !form.path.trim()) e.path = "Path is required";
        if (form.rule_type === "crawl-delay" && !form.crawl_delay) e.crawl_delay = "Delay seconds required";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        const ok = await onSave(form, editing?.id);
        setSaving(false);
        if (ok) onClose();
    };

    if (!open) return null;

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-overlay)", backdropFilter: "blur(6px)", padding: "var(--space-4)" }}>
            <div style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-2xl)", width: "100%", maxWidth: "540px", padding: "var(--space-8)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
                    <div>
                        <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 700, color: "var(--text-primary)" }}>
                            {editing ? "Edit Rule" : "Add Rule"}
                        </h2>
                        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)", marginTop: "4px" }}>
                            Crawl directive for robots.txt
                        </p>
                    </div>
                    <button onClick={onClose} style={{ ...S.iconBtn, width: "32px", height: "32px" }}>✕</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <FormGroup columns={2}>
                        <TextInput
                            label="User-agent" placeholder="* or Googlebot"
                            value={form.user_agent} error={errors.user_agent} required
                            onChange={(e) => sf("user_agent", e.target.value)}
                            helperText="* = all bots"
                        />
                        <Select
                            label="Rule Type" value={form.rule_type}
                            onChange={(e) => sf("rule_type", e.target.value as RobotsRuleForm["rule_type"])}
                            options={[
                                { value: "allow", label: "Allow" },
                                { value: "disallow", label: "Disallow" },
                                { value: "sitemap", label: "Sitemap" },
                                { value: "crawl-delay", label: "Crawl-delay" },
                            ]}
                        />
                    </FormGroup>

                    {form.rule_type !== "crawl-delay" ? (
                        <TextInput
                            label="Path" placeholder="/admin/ or https://yoursite.com/sitemap.xml"
                            value={form.path} error={errors.path} required
                            onChange={(e) => sf("path", e.target.value)}
                            helperText={form.rule_type === "sitemap" ? "Full sitemap URL" : "URL path to allow/disallow"}
                        />
                    ) : (
                        <TextInput
                            label="Crawl Delay (seconds)" placeholder="10"
                            type="number" value={form.crawl_delay} error={errors.crawl_delay} required
                            onChange={(e) => sf("crawl_delay", e.target.value)}
                        />
                    )}

                    <FormGroup columns={2}>
                        <Select
                            label="Status" value={form.status}
                            onChange={(e) => sf("status", e.target.value as RobotsRuleForm["status"])}
                            options={[
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" },
                            ]}
                            helperText="Inactive rules are excluded from output"
                        />
                        <Select
                            label="Environment" value={form.environment}
                            onChange={(e) => sf("environment", e.target.value as RobotsRuleForm["environment"])}
                            options={[
                                { value: "production", label: "Production" },
                                { value: "staging", label: "Staging" },
                                { value: "all", label: "All" },
                            ]}
                        />
                    </FormGroup>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-6)", paddingTop: "var(--space-5)", borderTop: "1px solid var(--border-primary)" }}>
                    <button onClick={onClose} style={S.ghost}>Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} style={{ ...S.primary, opacity: saving ? 0.7 : 1 }}>
                        {saving
                            ? <><FiLoader size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                            : <><FiSave size={13} /> {editing ? "Update Rule" : "Add Rule"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

function RobotsDeleteConfirm({ ruleId, onConfirm, onCancel }: { ruleId: number; onConfirm: () => void; onCancel: () => void; }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1010, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-overlay)", backdropFilter: "blur(6px)", padding: "var(--space-4)" }}>
            <div style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-2xl)", padding: "var(--space-8)", maxWidth: "400px", width: "100%", textAlign: "center" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "var(--radius-full)", margin: "0 auto var(--space-4)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FiTrash2 size={20} style={{ color: "var(--color-error)" }} />
                </div>
                <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Delete Rule #{ruleId}?</h3>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)", lineHeight: 1.55 }}>This will immediately update your robots.txt output.</p>
                <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
                    <button onClick={onCancel} style={{ ...S.ghost, flex: 1 }}>Cancel</button>
                    <button onClick={onConfirm} style={{ ...S.danger, flex: 1, justifyContent: "center" }}><FiTrash2 size={13} /> Delete</button>
                </div>
            </div>
        </div>
    );
}

function RobotsPanel({ robots }: { robots: UseRobotsReturn }) {
    const { rules, isLoading, preview, refetch, createRule, updateRule, deleteRule, toggleStatus } = robots;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RobotsRule | null>(null);
    const [delTarget, setDelTarget] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const openNew = () => { setEditingRule(null); setModalOpen(true); };
    const openEdit = (r: RobotsRule) => { setEditingRule(r); setModalOpen(true); };

    const handleModalSave = async (form: RobotsRuleForm, id?: number) => {
        if (id != null) return updateRule(id, form);
        return createRule(form);
    };

    const handleDelete = async () => {
        if (delTarget == null) return;
        await deleteRule(delTarget);
        setDelTarget(null);
    };

    const ruleTypeColors: Record<string, { bg: string; color: string; border: string }> = {
        allow: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.25)" },
        disallow: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
        sitemap: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" },
        "crawl-delay": { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    };

    return (
        <>
            <Banner
                type="warning"
                message="Changes take effect immediately and update the live robots.txt. Always test in Google Search Console › URL Inspection after saving."
            />

            {/* Controls row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)" }}>
                        {rules.length} rule{rules.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                        <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                            {rules.filter((r) => r.status === "active").length} active
                        </span>
                    </p>
                    <button
                        onClick={refetch}
                        title="Refresh rules"
                        style={{ ...S.iconBtn }}
                    >
                        <FiRefreshCw size={12} style={isLoading ? { animation: "spin 1s linear infinite" } : {}} />
                    </button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setShowPreview((v) => !v)}
                        style={{ ...S.ghost, padding: "9px 16px", fontSize: "var(--font-xs)" }}
                    >
                        {showPreview ? "Hide Preview" : "Preview robots.txt"}
                    </button>
                    <button onClick={openNew} style={S.primary}>
                        <FiPlus size={14} /> Add Rule
                    </button>
                </div>
            </div>

            {/* Live preview pane */}
            {showPreview && (
                <div style={{
                    marginBottom: "var(--space-5)", borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-primary)", overflow: "hidden",
                }}>
                    <div style={{
                        padding: "10px 16px", background: "var(--bg-tertiary)",
                        borderBottom: "1px solid var(--border-primary)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <span style={{ fontSize: "var(--font-xs)", fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                            robots.txt Preview (active rules only)
                        </span>
                        <span style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)" }}>yoursite.com/robots.txt</span>
                    </div>
                    <pre style={{
                        padding: "var(--space-4)", margin: 0,
                        fontSize: "12px", lineHeight: 1.7,
                        color: "var(--text-secondary)", background: "var(--bg-secondary)",
                        fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre",
                    }}>
                        {isLoading ? "Loading…" : preview}
                    </pre>
                </div>
            )}

            {/* Rules table */}
            <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
                {/* Head */}
                <div style={{
                    display: "grid", gridTemplateColumns: "120px 90px 1fr 100px 110px 100px",
                    padding: "10px 20px", background: "var(--bg-tertiary)",
                    borderBottom: "1px solid var(--border-primary)",
                }}>
                    {["User-agent", "Type", "Path / Value", "Status", "Environment", "Actions"].map((h) => (
                        <span key={h} style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                            {h}
                        </span>
                    ))}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <FiLoader size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading rules…
                    </div>
                )}

                {/* Rows */}
                {!isLoading && rules.map((rule, i) => {
                    const tc = ruleTypeColors[rule.rule_type] ?? ruleTypeColors.disallow;
                    const statusOk = rule.status === "active";
                    return (
                        <div key={rule.id} style={{
                            display: "grid", gridTemplateColumns: "120px 90px 1fr 100px 110px 100px",
                            padding: "13px 20px", alignItems: "center",
                            borderBottom: i < rules.length - 1 ? "1px solid var(--border-primary)" : "none",
                            background: rule.status === "inactive" ? "var(--bg-tertiary)" : "var(--bg-primary)",
                            opacity: rule.status === "inactive" ? 0.6 : 1,
                            transition: "background var(--transition-fast)",
                        }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = rule.status === "inactive" ? "var(--bg-tertiary)" : "var(--bg-primary)"}
                        >
                            {/* User-agent */}
                            <code style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 600 }}>
                                {rule.user_agent}
                            </code>

                            {/* Rule type badge */}
                            <span style={{
                                display: "inline-flex", alignItems: "center", padding: "2px 8px",
                                borderRadius: "var(--radius-full)", fontSize: "10px", fontWeight: 700,
                                width: "fit-content", textTransform: "capitalize" as const,
                                background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                            }}>
                                {rule.rule_type}
                            </span>

                            {/* Path */}
                            <code style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                                {rule.rule_type === "crawl-delay"
                                    ? `${rule.crawl_delay}s`
                                    : (rule.path ?? "—")
                                }
                            </code>

                            {/* Status */}
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 8px",
                                borderRadius: "var(--radius-full)", fontSize: "10px", fontWeight: 700, width: "fit-content",
                                background: statusOk ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
                                color: statusOk ? "#10b981" : "#64748b",
                                border: `1px solid ${statusOk ? "rgba(16,185,129,0.25)" : "rgba(100,116,139,0.2)"}`,
                            }}>
                                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: statusOk ? "#10b981" : "#64748b" }} />
                                {statusOk ? "Active" : "Inactive"}
                            </span>

                            {/* Environment */}
                            <span style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)", textTransform: "capitalize" as const }}>
                                {rule.environment}
                            </span>

                            {/* Actions */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <button onClick={() => toggleStatus(rule)} title={statusOk ? "Deactivate" : "Activate"} style={S.iconBtn}>
                                    {statusOk ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                                </button>
                                <button onClick={() => openEdit(rule)} title="Edit" style={S.iconBtn}>
                                    <FiEdit2 size={13} />
                                </button>
                                <button onClick={() => setDelTarget(rule.id)} title="Delete" style={{ ...S.iconBtn, ...S.iconBtnDanger }}>
                                    <FiTrash2 size={13} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Empty */}
                {!isLoading && rules.length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-tertiary)" }}>
                        <FiCode size={32} style={{ opacity: 0.25, marginBottom: "12px" }} />
                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 600 }}>No robots rules yet</p>
                        <p style={{ fontSize: "var(--font-xs)", marginTop: "6px" }}>Click "Add Rule" to create your first crawl directive.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <RobotsRuleModal
                open={modalOpen}
                editing={editingRule}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
            />
            {delTarget != null && (
                <RobotsDeleteConfirm
                    ruleId={delTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDelTarget(null)}
                />
            )}
        </>
    );
}

// ── 3f. SMTP (no API yet — stub save) ──────────────────────
function SmtpPanel() {
    const { saving, save } = useSave();
    return (
        <>
            <FormSection className="Form-Section-main" title="SMTP Server" description="Outgoing mail server connection details" collapsible defaultOpen>
                <FormGroup columns={2}>
                    <TextInput label="SMTP Host" placeholder="smtp.gmail.com" required />
                    <TextInput label="SMTP Port" placeholder="587" type="number" helperText="587 (TLS) · 465 (SSL) · 25 (plain)" />
                </FormGroup>
                <FormGroup columns={2}>
                    <TextInput label="Username" placeholder="you@gmail.com" required />
                    <TextInput label="Password" placeholder="••••••••••••••••" type="password" required />
                </FormGroup>
                <Select label="Encryption" value="tls" onChange={() => { }} options={[
                    { value: "none", label: "None (not recommended)" },
                    { value: "ssl", label: "SSL — port 465" },
                    { value: "tls", label: "TLS / STARTTLS — port 587 (recommended)" },
                ]} />
            </FormSection>

            <FormSection className="Form-Section-main" title="Sender Details" description="From / Reply-To used in all outgoing emails" collapsible defaultOpen>
                <FormGroup columns={2}>
                    <TextInput label="From Name" placeholder="YourSite Team" />
                    <TextInput label="From Email" placeholder="noreply@yoursite.com" type="email" />
                </FormGroup>
                <FormGroup columns={2}>
                    <TextInput label="Reply-To Name" placeholder="Support Team" />
                    <TextInput label="Reply-To Email" placeholder="support@yoursite.com" type="email" />
                </FormGroup>
            </FormSection>

            <FormSection className="Form-Section-main" title="Email Subjects" description="Customize transactional email subject lines" collapsible>
                <TextInput label="Welcome Email" placeholder="Welcome to {{site_name}}!" />
                <TextInput label="Email Verification" placeholder="Verify your email — {{site_name}}" />
                <TextInput label="Password Reset" placeholder="Reset your {{site_name}} password" />
                <TextInput label="Subscription" placeholder="Your {{plan_name}} plan is active!" />
                <p style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)" }}>
                    Variables: <code style={{ background: "var(--bg-tertiary)", padding: "1px 5px", borderRadius: "4px" }}>{"{{site_name}}"}</code>{" "}
                    <code style={{ background: "var(--bg-tertiary)", padding: "1px 5px", borderRadius: "4px" }}>{"{{plan_name}}"}</code>{" "}
                    <code style={{ background: "var(--bg-tertiary)", padding: "1px 5px", borderRadius: "4px" }}>{"{{user_name}}"}</code>
                </p>
            </FormSection>

            <FormSection className="Form-Section-main" title="Send Test Email" description="Verify your SMTP config is working" collapsible>
                <FormGroup columns={2}>
                    <TextInput label="Send Test To" placeholder="you@example.com" type="email" />
                    <div style={{ paddingTop: "28px" }}>
                        <button style={{ width: "100%", padding: "10px 20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "var(--font-sm)", cursor: "pointer" }}>
                            Send Test Email
                        </button>
                    </div>
                </FormGroup>
            </FormSection>

            <SaveBar onSave={save} saving={saving} />
        </>
    );
}

// ═══════════════════════════════════════════════════════════
// 4.  PANEL ROUTER
//     SEO panels receive the hook result from the shell so
//     hooks are called at the top level (Rules of Hooks).
// ═══════════════════════════════════════════════════════════
function renderPanel(
    id: string,
    hooks: SeoHooks,
): React.ReactNode {
    switch (id) {
        case "general": return <GeneralPanel />;
        case "users": return <UsersPanel />;
        // SEO — pass pre-called hook result; panel is pure display
        case "seo-homepage": return <SeoPanel pageLabel="Homepage" pagePath="/" seo={hooks.homepage} />;
        case "seo-about": return <SeoPanel pageLabel="About" pagePath="/about" seo={hooks.about} />;
        case "seo-pricing": return <SeoPanel pageLabel="Pricing" pagePath="/pricing" seo={hooks.pricing} />;
        // Legal
        case "legal": return <LegalPanel />;
        // Robots
        case "robots": return <RobotsPanel robots={hooks.robots} />;
        // SMTP
        case "smtp": return <SmtpPanel />;
        default: return <p style={{ color: "var(--text-tertiary)" }}>Panel not found.</p>;
    }
}

// ─── Hook bundle type ──────────────────────────────────────
type SeoHooks = {
    homepage: UseStaticSeoReturn;
    about: UseStaticSeoReturn;
    pricing: UseStaticSeoReturn;
    robots: UseRobotsReturn;
};

// ═══════════════════════════════════════════════════════════
// 5.  PAGE SHELL
//     All hooks are called here (top-level) so React's rules
//     are satisfied even when the panel is not visible.
//     This also means data is pre-fetched as soon as the
//     settings page mounts, not lazily on tab click.
// ═══════════════════════════════════════════════════════════
export default function SettingsPage() {
    const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
    const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

    // ── Call all API hooks here — satisfies Rules of Hooks ──
    const hooks: SeoHooks = {
        homepage: useStaticSeo(SEO_PAGE_KEYS.HOME),
        about: useStaticSeo(SEO_PAGE_KEYS.ABOUT),
        pricing: useStaticSeo(SEO_PAGE_KEYS.PRICING),
        robots: useRobots(),
    };

    return (
        <div className="adminPage">
            <PageHeader
                title="Settings"
                subtitle="Site configuration, SEO, legal pages, and technical settings"
                breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
                variant="flat"
            />

            <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start", padding: "var(--space-6)" }}>

                {/* ─── Sidebar nav ── */}
                <aside style={{
                    width: "210px", flexShrink: 0, position: "sticky",
                    top: "calc(var(--admin-header-height, 64px) + var(--space-6))",
                    maxHeight: "calc(100vh - var(--admin-header-height, 64px) - 80px)",
                    overflowY: "auto", scrollbarWidth: "thin" as const,
                }}>
                    {GROUPS.map((group) => (
                        <div key={group} style={{ marginBottom: "var(--space-4)" }}>
                            <div style={{
                                fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                                textTransform: "uppercase" as const, color: "var(--text-tertiary)",
                                padding: "0 var(--space-3) var(--space-2)",
                            }}>
                                {group}
                            </div>

                            {SECTIONS.filter((s) => s.group === group).map((section) => {
                                const on = section.id === activeId;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveId(section.id)}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                            padding: "9px var(--space-3)", borderRadius: "var(--radius-lg)",
                                            border: on ? "1px solid rgba(255,107,53,0.2)" : "1px solid transparent",
                                            background: on ? "var(--color-primary-light)" : "transparent",
                                            color: on ? "var(--color-primary)" : "var(--text-secondary)",
                                            fontSize: "var(--font-sm)", fontWeight: on ? 600 : 500,
                                            cursor: "pointer", textAlign: "left" as const,
                                            transition: "all var(--transition-fast)", position: "relative", marginBottom: "2px",
                                        }}
                                        onMouseEnter={(e) => { if (!on) { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-tertiary)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; } }}
                                        onMouseLeave={(e) => { if (!on) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; } }}
                                    >
                                        {on && (
                                            <span style={{
                                                position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                                                width: "3px", height: "55%",
                                                borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                                                background: "var(--color-primary)", boxShadow: "2px 0 8px rgba(255,107,53,0.4)",
                                            }} />
                                        )}
                                        <span style={{ opacity: on ? 1 : 0.65, flexShrink: 0 }}>{section.icon}</span>
                                        <span style={{ flex: 1, lineHeight: 1.3 }}>{section.label}</span>
                                        {section.badge && (
                                            <span style={{
                                                fontSize: "9px", fontWeight: 700, padding: "1px 6px", flexShrink: 0,
                                                borderRadius: "var(--radius-full)",
                                                background: `${section.badgeColor}20`, color: section.badgeColor,
                                                border: `1px solid ${section.badgeColor}40`,
                                            }}>{section.badge}</span>
                                        )}
                                        {on && <FiChevronRight size={11} style={{ opacity: 0.4, flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </aside>

                {/* ─── Main panel ── */}
                <main style={{
                    flex: 1, minWidth: 0, background: "var(--bg-primary)",
                    borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)",
                    padding: "var(--space-6)", boxShadow: "var(--shadow-sm)",
                }}>
                    {/* Panel header */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "var(--space-3)",
                        marginBottom: "var(--space-6)", paddingBottom: "var(--space-4)",
                        borderBottom: "1px solid var(--border-primary)",
                    }}>
                        <div style={{
                            width: "38px", height: "38px", borderRadius: "var(--radius-lg)", flexShrink: 0,
                            background: "var(--color-primary-light)", border: "1px solid rgba(255,107,53,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)",
                        }}>
                            {active.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                                {active.label}
                            </h2>
                            <p style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)", marginTop: "3px" }}>
                                {active.description}
                            </p>
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: "5px", fontSize: "var(--font-xs)",
                            color: "var(--text-tertiary)", background: "var(--bg-tertiary)",
                            padding: "5px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-primary)",
                            flexShrink: 0,
                        }}>
                            <span>{active.group}</span>
                            <FiChevronRight size={10} />
                            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{active.label}</span>
                        </div>
                    </div>

                    {/* Panel content */}
                    <div key={activeId} style={{ animation: "stgFadeIn 220ms ease both" }}>
                        {renderPanel(activeId, hooks)}
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes stgFadeIn {
                    from { opacity:0; transform:translateY(10px); }
                    to   { opacity:1; transform:translateY(0);    }
                }
                @keyframes spin {
                    from { transform:rotate(0deg); }
                    to   { transform:rotate(360deg); }
                }
                @keyframes pulse {
                    0%,100% { opacity:1; }
                    50%     { opacity:0.4; }
                }
            `}</style>
        </div>
    );
}