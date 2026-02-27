import { redirect } from "next/navigation";
import { legalPagesServer } from "@/lib/api-calls/legalPagesApi";

export default async function PoliciesIndexPage() {
    try {
        const pages = await legalPagesServer.fetchAll();
        if (pages.length > 0) {
            redirect(`/pages/${pages[0].slug}`);
        }
    } catch {
    }
    redirect("/pages/privacy-policy");
}