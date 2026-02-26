// src/components/public/Footer/Footer.tsx
// Accepts an optional `config` prop from the page editor.
// Falls back to the static footer.config.ts when no config is passed.

import Link from "next/link";
import { FOOTER_SECTIONS } from "./footer.config";
import type { FooterData } from "@/features/online-store/sections/footer";

interface FooterProps {
    config?: Partial<FooterData>;
}

export default function Footer({ config }: FooterProps) {
    const logoText = config?.logoText ?? "Web";
    const logoHighlight = config?.logoHighlight ?? "Tools";
    const description = config?.description ?? "Simple, fast and free web tools for developers, marketers and creators.";
    const copyrightName = config?.copyrightName ?? "WebTools";
    const sections = config?.sections ?? FOOTER_SECTIONS;

    return (
        <footer className="footer-wrapper">
            <div className="footer-container">
                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-logo">
                        {logoText}<span>{logoHighlight}</span>
                    </div>
                    <p className="footer-desc">{description}</p>
                </div>

                {/* Links */}
                <div className="footer-links">
                    {sections.map((section) => (
                        <div key={section.title} className="footer-column">
                            <h4>{section.title}</h4>
                            <ul>
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} {copyrightName}. All rights reserved.</span>
            </div>
        </footer>
    );
}