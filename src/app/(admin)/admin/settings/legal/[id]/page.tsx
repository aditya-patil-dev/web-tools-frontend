"use client";

import { useParams } from "next/navigation";
import LegalPageForm from "@/components/admin/legal-pages/LegalPageForm";

export default function Page() {

    const params = useParams();

    return (
        <LegalPageForm id={Number(params.id)} />
    );

}