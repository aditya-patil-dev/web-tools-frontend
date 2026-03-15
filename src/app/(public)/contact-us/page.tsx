"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/api"; // ← centralized API client

// TYPES
type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    category: string;
    message: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;
type SubmitState = "idle" | "loading" | "success" | "error";

// STATIC DATA
const CATEGORIES = [
    { value: "", label: "Select a topic…" },
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "partnership", label: "Partnership & API" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "legal", label: "Legal & Privacy" },
];

const CONTACT_METHODS = [
    {
        icon: "📧",
        label: "General Support",
        value: "adityapatil93564@gmail.com",
        note: "Reply within 2 business hours",
        href: "mailto:adityapatil93564@gmail.com",
    },
];

const FAQ_ITEMS = [
    {
        q: "How quickly do you respond?",
        a: "Most emails get a reply within 2 business days. Priority support users hear back within 1 day.",
    },
    {
        q: "Do you offer live chat support?",
        a: "Not yet — it's on our roadmap. Email is the fastest way to reach us right now.",
    },
    {
        q: "Can I request a new tool?",
        a: "Absolutely! Choose 'Feature Request' in the form. Highly-voted requests get built first.",
    },
];

// VALIDATION
function validate(data: FormData): FormErrors {
    const e: FormErrors = {};
    if (!data.firstName.trim()) e.firstName = "First name is required";
    if (!data.lastName.trim()) e.lastName = "Last name is required";
    if (!data.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Enter a valid email";
    if (!data.category) e.category = "Please choose a topic";
    if (!data.message.trim()) e.message = "Message is required";
    else if (data.message.trim().length < 20) e.message = "Write at least 20 characters";
    return e;
}

// FAQ ACCORDION ITEM
function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`ctFaqItem ${open ? "ctFaqOpen" : ""}`} onClick={() => setOpen(o => !o)}>
            <div className="ctFaqQ">
                <span>{q}</span>
                <svg
                    className="ctFaqChevron"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {open && <p className="ctFaqA">{a}</p>}
        </div>
    );
}

// MAIN PAGE
export default function ContactPage() {
    const [form, setForm] = useState<FormData>({ firstName: "", lastName: "", email: "", subject: "", category: "", message: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [submitState, setSubmit] = useState<SubmitState>("idle");
    const [apiError, setApiError] = useState<string>("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (touched[name as keyof FormData]) {
            const fresh = validate({ ...form, [name]: value });
            setErrors(prev => ({ ...prev, [name]: fresh[name as keyof FormData] }));
        }
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const fresh = validate(form);
        setErrors(prev => ({ ...prev, [name]: fresh[name as keyof FormData] }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) {
            setErrors(errs);
            setTouched({ firstName: true, lastName: true, email: true, category: true, message: true });
            return;
        }

        setSubmit("loading");
        setApiError("");

        try {
            await api.post("/contact", {
                first_name: form.firstName.trim(),
                last_name: form.lastName.trim(),
                email: form.email.trim(),
                topic: form.category,
                subject: form.subject.trim(),
                message: form.message.trim(),
            });

            setSubmit("success");
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? (err as Error)?.message
                ?? "Something went wrong. Please try again.";
            setApiError(message);
            setSubmit("error");
        }
    }

    function reset() {
        setForm({ firstName: "", lastName: "", email: "", subject: "", category: "", message: "" });
        setErrors({});
        setTouched({});
        setSubmit("idle");
        setApiError("");
    }

    const charCount = form.message.length;
    const charMax = 1000;
    const charPct = Math.min(charCount / charMax, 1);
    const charColor = charPct > 0.9 ? "var(--color-error)" : charPct > 0.7 ? "var(--color-warning)" : "var(--text-tertiary)";

    // RENDER
    return (
        <div className="tools-page-container">
            <main className="ctPage">

                {/*HERO*/}
                <section className="ctHero">
                    <div className="ctHeroBg" aria-hidden="true" />
                    <div className="ctHeroInner">
                        <div className="ctHeroBadge">
                            <span>💬</span> Contact Us
                        </div>
                        <h1 className="ctHeroTitle">
                            We&rsquo;d love to{" "}
                            <span className="ctHeroAccent">hear from you</span>
                        </h1>
                        <p className="ctHeroDesc">
                            Have a question, feedback, or a big idea? Our team reads every
                            message and replies within 2 business days.
                        </p>
                    </div>
                </section>

                {/* ══ MAIN GRID ════════════════════════════════════════ */}
                <div className="ctContainer">
                    <div className="ctGrid">

                        {/* ── LEFT: Info panel ─────────────────────────── */}
                        <aside className="ctInfoPanel">

                            {/* Contact methods */}
                            <div className="ctCard">
                                <h2 className="ctCardTitle">Contact methods</h2>
                                <div className="ctMethodList">
                                    {CONTACT_METHODS.map(m => (
                                        <a key={m.label} href={m.href} className="ctMethod">
                                            <span className="ctMethodIcon">{m.icon}</span>
                                            <div className="ctMethodBody">
                                                <span className="ctMethodLabel">{m.label}</span>
                                                <span className="ctMethodValue">{m.value}</span>
                                                <span className="ctMethodNote">{m.note}</span>
                                            </div>
                                            <svg className="ctMethodArrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
                                                    strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="ctCard">
                                <h2 className="ctCardTitle">Quick answers</h2>
                                <div className="ctFaqList">
                                    {FAQ_ITEMS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
                                </div>
                            </div>

                        </aside>

                        {/* ── RIGHT: Form ──────────────────────────────── */}
                        <section className="ctFormPanel">
                            <div className="ctFormCard">

                                {/* Success */}
                                {submitState === "success" && (
                                    <div className="ctSuccess">
                                        <div className="ctSuccessIcon">✓</div>
                                        <h3 className="ctSuccessTitle">Message sent!</h3>
                                        <p className="ctSuccessDesc">
                                            Thanks for reaching out. We&apos;ll reply to{" "}
                                            <strong>{form.email}</strong> within 2 business hours.
                                        </p>
                                        <button className="ctBtnPrimary" onClick={reset}>
                                            Send another message
                                        </button>
                                    </div>
                                )}

                                {/* Error banner */}
                                {submitState === "error" && (
                                    <div className="ctErrorBanner">
                                        <span>⚠ {apiError || "Something went wrong. Please try again."}</span>
                                        <button className="ctBtnRetry" onClick={() => setSubmit("idle")}>Retry</button>
                                    </div>
                                )}

                                {/* Form */}
                                {(submitState === "idle" || submitState === "loading") && (
                                    <>
                                        <div className="ctFormHeader">
                                            <h2 className="ctFormTitle">Send us a message</h2>
                                            <p className="ctFormSubtitle">
                                                Fill in the details below and we&apos;ll get back to you shortly.
                                            </p>
                                        </div>

                                        <form className="ctForm" onSubmit={handleSubmit} noValidate>

                                            {/* Name row */}
                                            <div className="ctFormRow">
                                                {/* First name */}
                                                <div className="ctField">
                                                    <label className="ctLabel">
                                                        First name <span className="ctRequired">*</span>
                                                    </label>
                                                    <input
                                                        className={`ctInput${errors.firstName ? " ctInputError" : ""}`}
                                                        type="text" name="firstName" value={form.firstName}
                                                        onChange={handleChange} onBlur={handleBlur}
                                                        placeholder="John" autoComplete="given-name"
                                                    />
                                                    {errors.firstName && <span className="ctFieldError">{errors.firstName}</span>}
                                                </div>
                                                {/* Last name */}
                                                <div className="ctField">
                                                    <label className="ctLabel">
                                                        Last name <span className="ctRequired">*</span>
                                                    </label>
                                                    <input
                                                        className={`ctInput${errors.lastName ? " ctInputError" : ""}`}
                                                        type="text" name="lastName" value={form.lastName}
                                                        onChange={handleChange} onBlur={handleBlur}
                                                        placeholder="Doe" autoComplete="family-name"
                                                    />
                                                    {errors.lastName && <span className="ctFieldError">{errors.lastName}</span>}
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="ctField">
                                                <label className="ctLabel">
                                                    Email address <span className="ctRequired">*</span>
                                                </label>
                                                <input
                                                    className={`ctInput${errors.email ? " ctInputError" : ""}`}
                                                    type="email" name="email" value={form.email}
                                                    onChange={handleChange} onBlur={handleBlur}
                                                    placeholder="john@example.com" autoComplete="email"
                                                />
                                                {errors.email && <span className="ctFieldError">{errors.email}</span>}
                                            </div>

                                            {/* Category */}
                                            <div className="ctField">
                                                <label className="ctLabel">
                                                    Topic <span className="ctRequired">*</span>
                                                </label>
                                                <select
                                                    className={`ctSelect${errors.category ? " ctInputError" : ""}`}
                                                    name="category" value={form.category}
                                                    onChange={handleChange} onBlur={handleBlur}
                                                >
                                                    {CATEGORIES.map(c => (
                                                        <option key={c.value} value={c.value} disabled={!c.value}>
                                                            {c.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.category && <span className="ctFieldError">{errors.category}</span>}
                                            </div>

                                            {/* Subject (optional) */}
                                            <div className="ctField">
                                                <label className="ctLabel">Subject</label>
                                                <input
                                                    className="ctInput"
                                                    type="text" name="subject" value={form.subject}
                                                    onChange={handleChange} onBlur={handleBlur}
                                                    placeholder="Brief summary (optional)"
                                                />
                                            </div>

                                            {/* Message */}
                                            <div className="ctField">
                                                <label className="ctLabel">
                                                    Message <span className="ctRequired">*</span>
                                                </label>
                                                <textarea
                                                    className={`ctTextarea${errors.message ? " ctInputError" : ""}`}
                                                    name="message" value={form.message}
                                                    onChange={handleChange} onBlur={handleBlur}
                                                    placeholder="Tell us how we can help…"
                                                    rows={5} maxLength={charMax}
                                                />
                                                <div className="ctCharRow">
                                                    <div className="ctCharBar">
                                                        <div className="ctCharFill"
                                                            style={{ width: `${charPct * 100}%`, background: charPct > 0.9 ? "var(--color-error)" : charPct > 0.7 ? "var(--color-warning)" : "var(--color-primary)" }} />
                                                    </div>
                                                    <span className="ctCharCount" style={{ color: charColor }}>
                                                        {charCount}/{charMax}
                                                    </span>
                                                </div>
                                                {errors.message && <span className="ctFieldError">{errors.message}</span>}
                                            </div>

                                            {/* Privacy */}
                                            <p className="ctPrivacy">
                                                By submitting you agree to our{" "}
                                                <Link href="/privacy-policy" className="ctPrivacyLink">Privacy Policy</Link>.
                                                We never share your data.
                                            </p>

                                            {/* Submit */}
                                            <button type="submit" className="ctBtnSubmit"
                                                disabled={submitState === "loading"}>
                                                {submitState === "loading" ? (
                                                    <><span className="ctSpinner" /> Sending…</>
                                                ) : (
                                                    <>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M14 2L2 7.5l5 1.5M14 2l-4.5 12L7.5 8.5M14 2L7.5 8.5"
                                                                stroke="currentColor" strokeWidth="1.6"
                                                                strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Send message
                                                    </>
                                                )}
                                            </button>

                                        </form>
                                    </>
                                )}
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}