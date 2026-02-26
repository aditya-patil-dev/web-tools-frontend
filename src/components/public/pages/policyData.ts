import type { PolicyPageMeta, PolicyContentMap } from "./types";

// ============================================================
// MOCK DATA — Replace fetch calls with your API endpoints
// API Pattern: GET /api/policies/:slug
// ============================================================

export const POLICY_PAGES: PolicyPageMeta[] = [
    {
        slug: "privacy-policy",
        label: "Privacy Policy",
        icon: "shield",
        lastUpdated: "January 15, 2025",
        effectiveDate: "February 1, 2025",
        badge: "Updated",
    },
    {
        slug: "terms-conditions",
        label: "Terms & Conditions",
        icon: "scroll",
        lastUpdated: "December 10, 2024",
        effectiveDate: "January 1, 2025",
        badge: null,
    },
    {
        slug: "cookie-policy",
        label: "Cookie Policy",
        icon: "cookie",
        lastUpdated: "November 20, 2024",
        effectiveDate: "December 1, 2024",
        badge: null,
    },
    {
        slug: "refund-policy",
        label: "Refund Policy",
        icon: "refund",
        lastUpdated: "October 5, 2024",
        effectiveDate: "October 15, 2024",
        badge: null,
    },
    {
        slug: "contact-us",
        label: "Contact Us",
        icon: "mail",
        lastUpdated: null,
        effectiveDate: null,
        badge: null,
    },
];

export const POLICY_CONTENT: PolicyContentMap = {
    "privacy-policy": {
        title: "Privacy Policy",
        subtitle: "How we collect, use, and protect your personal information.",
        sections: [
            {
                id: "information-we-collect",
                heading: "1. Information We Collect",
                content:
                    "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes:",
                list: [
                    "Personal identifiers: name, email address, phone number, postal address",
                    "Account credentials: username and encrypted password",
                    "Payment information: billing address and last four digits of card (we never store full card numbers)",
                    "Communications: messages you send us via email or support channels",
                    "Usage data: pages visited, features used, time spent on the platform",
                ],
            },
            {
                id: "how-we-use",
                heading: "2. How We Use Your Information",
                content: "We use the information we collect for the following purposes:",
                list: [
                    "To provide, maintain, and improve our services",
                    "To process transactions and send related information",
                    "To send promotional communications (with your consent)",
                    "To monitor and analyze usage patterns and trends",
                    "To detect, investigate, and prevent fraudulent transactions and abuse",
                    "To comply with legal obligations",
                ],
            },
            {
                id: "data-sharing",
                heading: "3. Data Sharing & Disclosure",
                content:
                    "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:",
                list: [
                    "With service providers who assist in our operations (under strict confidentiality agreements)",
                    "When required by law, regulation, or legal process",
                    "In connection with a merger, acquisition, or sale of company assets",
                    "With your explicit consent for specific purposes",
                ],
            },
            {
                id: "data-retention",
                heading: "4. Data Retention",
                content:
                    "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time. Some data may be retained for legal compliance purposes for up to 7 years after account closure.",
                list: [],
            },
            {
                id: "your-rights",
                heading: "5. Your Rights",
                content:
                    "Depending on your location, you may have the following rights regarding your personal data:",
                list: [
                    "Right to access: Request a copy of the data we hold about you",
                    "Right to rectification: Request correction of inaccurate data",
                    "Right to erasure: Request deletion of your personal data",
                    "Right to restriction: Request that we limit the processing of your data",
                    "Right to portability: Receive your data in a structured, machine-readable format",
                    "Right to object: Object to processing based on legitimate interests",
                ],
            },
            {
                id: "security",
                heading: "6. Security",
                content:
                    "We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, regular third-party security audits, and strict access controls. While we strive to protect your data, no method of transmission over the internet is 100% secure.",
                list: [],
            },
            {
                id: "contact",
                heading: "7. Contact Our Privacy Team",
                content:
                    "For any privacy-related inquiries, please contact our dedicated Privacy Officer at privacy@yourcompany.com or write to us at 123 Company Street, City, State 12345.",
                list: [],
            },
        ],
    },

    "terms-conditions": {
        title: "Terms & Conditions",
        subtitle: "The rules and guidelines that govern your use of our platform.",
        sections: [
            {
                id: "acceptance",
                heading: "1. Acceptance of Terms",
                content:
                    "By accessing or using our services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services. These terms apply to all visitors, users, and others who access or use the service.",
                list: [],
            },
            {
                id: "accounts",
                heading: "2. User Accounts",
                content:
                    "When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:",
                list: [
                    "Maintaining the confidentiality of your account and password",
                    "Restricting access to your computer or mobile device",
                    "All activities that occur under your account",
                    "Notifying us immediately of any unauthorized use of your account",
                ],
            },
            {
                id: "intellectual-property",
                heading: "3. Intellectual Property",
                content:
                    "The service and its original content, features, and functionality are and will remain the exclusive property of our company and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without prior written consent.",
                list: [],
            },
            {
                id: "prohibited-uses",
                heading: "4. Prohibited Uses",
                content: "You agree not to use the service:",
                list: [
                    "In any way that violates applicable laws or regulations",
                    "To transmit unsolicited commercial communications (spam)",
                    "To impersonate or attempt to impersonate our company or employees",
                    "To engage in any conduct that restricts others' use of the service",
                    "To attempt to gain unauthorized access to any part of the service",
                    "To upload or transmit viruses or any other malicious code",
                ],
            },
            {
                id: "termination",
                heading: "5. Termination",
                content:
                    "We may terminate or suspend your account immediately, without prior notice, for any reason including breach of these terms. Upon termination, your right to use the service will immediately cease. All provisions which should survive termination shall survive.",
                list: [],
            },
            {
                id: "limitation",
                heading: "6. Limitation of Liability",
                content:
                    "In no event shall our company, directors, employees, or partners be liable for indirect, incidental, special, consequential, or punitive damages resulting from your use of the service, even if we have been advised of the possibility of such damages.",
                list: [],
            },
            {
                id: "governing-law",
                heading: "7. Governing Law",
                content:
                    "These terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Delaware.",
                list: [],
            },
        ],
    },

    "cookie-policy": {
        title: "Cookie Policy",
        subtitle: "How we use cookies and similar tracking technologies.",
        sections: [
            {
                id: "what-are-cookies",
                heading: "1. What Are Cookies?",
                content:
                    "Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners useful analytics information.",
                list: [],
            },
            {
                id: "types-we-use",
                heading: "2. Types of Cookies We Use",
                content: "We use the following categories of cookies:",
                list: [
                    "Essential Cookies: Required for the website to function properly. Cannot be disabled.",
                    "Performance Cookies: Help us understand how visitors interact with our website (e.g., Google Analytics).",
                    "Functional Cookies: Remember your preferences and settings for a better experience.",
                    "Marketing Cookies: Track your activity across websites to deliver targeted advertising.",
                ],
            },
            {
                id: "third-party",
                heading: "3. Third-Party Cookies",
                content:
                    "Some cookies on our site are set by third-party services. These include Google Analytics, Stripe (payment processing), Intercom (customer support), and social media plugins. These services have their own privacy policies governing cookie use.",
                list: [],
            },
            {
                id: "managing-cookies",
                heading: "4. Managing Your Cookies",
                content: "You can control cookies through your browser settings. Most browsers allow you to:",
                list: [
                    "View and delete cookies stored on your device",
                    "Block cookies from specific or all websites",
                    "Be notified when a cookie is set",
                    "Block third-party cookies entirely",
                ],
            },
            {
                id: "cookie-consent",
                heading: "5. Cookie Consent",
                content:
                    "When you first visit our site, you will be presented with a cookie consent banner. You can accept all cookies, reject non-essential cookies, or customize your preferences. You can change your consent preferences at any time via the Cookie Settings link in our footer.",
                list: [],
            },
        ],
    },

    "refund-policy": {
        title: "Refund Policy",
        subtitle: "Our commitment to fair and transparent refunds.",
        sections: [
            {
                id: "overview",
                heading: "1. Overview",
                content:
                    "We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, we offer a straightforward refund process designed to be fair and hassle-free.",
                list: [],
            },
            {
                id: "eligibility",
                heading: "2. Refund Eligibility",
                content: "Refunds are available under the following conditions:",
                list: [
                    "Request made within 30 days of purchase",
                    "Service has not been fully consumed or delivered",
                    "Account is in good standing with no policy violations",
                    "Digital products: refundable within 14 days if not accessed more than 20% of content",
                ],
            },
            {
                id: "non-refundable",
                heading: "3. Non-Refundable Items",
                content: "The following are not eligible for refunds:",
                list: [
                    "Subscription fees after the current billing cycle has been used",
                    "One-time setup or onboarding fees",
                    "Add-on services that have been fully delivered",
                    "Purchases made using promotional credits or gift cards",
                ],
            },
            {
                id: "process",
                heading: "4. How to Request a Refund",
                content:
                    "To request a refund, please contact our support team at support@yourcompany.com with your order number and reason for the request. We aim to process all refund requests within 5–7 business days. Approved refunds are credited to the original payment method within 10 business days.",
                list: [],
            },
            {
                id: "disputes",
                heading: "5. Disputes & Chargebacks",
                content:
                    "Before initiating a chargeback with your bank, we strongly encourage you to contact us directly. We resolve the vast majority of disputes amicably. Initiating an unwarranted chargeback may result in account suspension and additional fees.",
                list: [],
            },
        ],
    },

    "contact-us": {
        title: "Contact Us",
        subtitle: "We're here to help. Reach out through any channel that works for you.",
        isContactPage: true,
        contactInfo: {
            email: "hello@yourcompany.com",
            support: "support@yourcompany.com",
            phone: "+1 (800) 123-4567",
            hours: "Monday – Friday, 9 AM – 6 PM EST",
            address: "123 Company Street, Suite 400\nSan Francisco, CA 94105\nUnited States",
        },
        channels: [
            {
                id: "general",
                icon: "mail",
                title: "General Inquiries",
                description: "For questions about our products, pricing, or company.",
                contact: "hello@yourcompany.com",
                type: "email",
            },
            {
                id: "support",
                icon: "headset",
                title: "Technical Support",
                description: "Having trouble? Our support team is here 24/5.",
                contact: "support@yourcompany.com",
                type: "email",
            },
            {
                id: "sales",
                icon: "briefcase",
                title: "Sales & Partnerships",
                description: "Interested in enterprise plans or partnership opportunities?",
                contact: "sales@yourcompany.com",
                type: "email",
            },
            {
                id: "legal",
                icon: "scale",
                title: "Legal & Compliance",
                description: "For legal notices, DMCA requests, or compliance matters.",
                contact: "legal@yourcompany.com",
                type: "email",
            },
        ],
    },
};

// ============================================================
// API INTEGRATION GUIDE
// ============================================================
// Replace mock data with API calls like this:
//
// export async function fetchPolicyPages(): Promise<PolicyPageMeta[]> {
//   const res = await fetch('/api/policies');
//   return res.json();
// }
//
// export async function fetchPolicyContent(slug: string): Promise<PolicyContent> {
//   const res = await fetch(`/api/policies/${slug}`);
//   return res.json();
// }