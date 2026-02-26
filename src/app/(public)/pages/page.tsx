// app/policies/page.tsx
// ============================================================
// Next.js App Router entry point for the Policies route.
// Place files in your project like:
//
//   components/PolicyPages.tsx
//   data/policyData.ts
//   types.ts
// ============================================================

import type { Metadata } from "next";
import PolicyPages from "@/components/public/pages/PolicyPages";
import { JSX } from "react";

export const metadata: Metadata = {
    title: "Legal & Policies | Your Company",
    description:
        "Read our Privacy Policy, Terms & Conditions, Cookie Policy, Refund Policy, and contact information.",
};

export default function PoliciesPage(): JSX.Element {
    return <PolicyPages />;
}

// ──────────────────────────────────────────────────────────────
// MAKING IT DYNAMIC WITH APIs
// ──────────────────────────────────────────────────────────────
//
// Option A — Server Component with server-side fetch:
//
// import type { PolicyPageMeta } from "@/types";
//
// export default async function PoliciesPage() {
//   const pages: PolicyPageMeta[] = await fetch(
//     "https://your-api.com/api/policies",
//     { next: { revalidate: 3600 } }   // ISR: revalidate every hour
//   ).then((r) => r.json());
//
//   return <PolicyPages initialPages={pages} />;
// }
//
// Option B — Client-side fetch inside PolicyPages.tsx:
// Replace the mock imports with state + useEffect:
//
// const [pages, setPages] = useState<PolicyPageMeta[]>([]);
// useEffect(() => {
//   fetch("/api/policies").then((r) => r.json()).then(setPages);
// }, []);
//
// const handlePageChange = async (slug: string) => {
//   setLoading(true);
//   const data: PolicyContent = await fetch(`/api/policies/${slug}`).then((r) => r.json());
//   setCurrentData(data);
//   setLoading(false);
// };
//
// Option C — Contact form submission:
// In ContactPage handleSubmit():
//
// const res = await fetch("/api/contact", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify(formState),
// });
// const result: { success: boolean } = await res.json();