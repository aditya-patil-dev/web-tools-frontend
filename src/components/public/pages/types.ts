// ============================================================
// TYPES — Policy Pages
// ============================================================

export type IconKey =
    | "shield"
    | "scroll"
    | "cookie"
    | "refund"
    | "mail"
    | "headset"
    | "briefcase"
    | "scale"
    | "chevron"
    | "menu"
    | "close"
    | "phone"
    | "location"
    | "clock";

export interface PolicyPageMeta {
    slug: string;
    label: string;
    icon: IconKey;
    lastUpdated: string | null;
    effectiveDate: string | null;
    badge: string | null;
}

export interface PolicySection {
    id: string;
    heading: string;
    content: string;
    list: string[];
}

export interface ContactChannel {
    id: string;
    icon: IconKey;
    title: string;
    description: string;
    contact: string;
    type: "email" | "phone";
}

export interface ContactInfo {
    email: string;
    support: string;
    phone: string;
    hours: string;
    address: string;
}

export interface PolicyContent {
    title: string;
    subtitle: string;
    sections?: PolicySection[];
    isContactPage?: boolean;
    contactInfo?: ContactInfo;
    channels?: ContactChannel[];
}

export interface PolicyContentMap {
    [slug: string]: PolicyContent;
}

export interface FormState {
    name: string;
    email: string;
    subject: string;
    message: string;
}