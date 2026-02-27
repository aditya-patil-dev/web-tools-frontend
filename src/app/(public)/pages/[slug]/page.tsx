import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legalPagesServer, NotFoundError } from "@/lib/api-calls/legalPagesApi";
import PolicyPages from "@/components/public/pages/PolicyPages";

// ─── generateStaticParams ─────────────────────────────────────────────────────
export async function generateStaticParams() {
    try {
        const pages = await legalPagesServer.fetchAll();
        return pages.map((p) => ({ slug: p.slug }));
    } catch {
        return [];
    }
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    try {
        const { slug } = await params;
        const page = await legalPagesServer.fetchBySlug(slug);
        return {
            title: page.meta_title,
            description: page.meta_description,
            alternates: { canonical: page.canonical_url },
            robots: page.noindex ? { index: false } : undefined,
        };
    } catch {
        return {
            title: "Legal & Policies",
            description: "Our legal policies and terms.",
        };
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PolicySlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Fetch data first — handle errors before returning any JSX
    let activePage, allPages;
    try {
        [activePage, allPages] = await Promise.all([
            legalPagesServer.fetchBySlug(slug),
            legalPagesServer.fetchAll(),
        ]);
    } catch (err) {
        if (err instanceof NotFoundError) notFound();
        throw err;
    }

    // JSX lives outside the try/catch
    return (
        <section className="tools-page-container">
            <PolicyPages
                activePage={activePage}
                allPages={allPages}
                currentSlug={slug}
            />
        </section>
    );
}