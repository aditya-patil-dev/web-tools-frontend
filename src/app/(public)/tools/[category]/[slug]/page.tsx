import { notFound } from "next/navigation";
import { fetchToolPageServer } from "@/lib/api-calls/tools.api";
import ToolPageClient from "./ToolPageClient";

interface PageProps {
    params: Promise<{ category: string; slug: string }>;
}

export default async function Page({ params }: PageProps) {
    const { category, slug } = await params;

    const tool = await fetchToolPageServer(category, slug);

    if (!tool) return notFound();

    return (
        <ToolPageClient
            tool={tool}
            category={category}
            slug={slug}
        />
    );
}