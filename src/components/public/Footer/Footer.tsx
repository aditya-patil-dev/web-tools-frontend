import Link from "next/link";
import { FOOTER_SECTIONS } from "./footer.config";

export default function Footer() {
    return (
        <footer className="footer-wrapper">
            <div className="footer-container">
                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-logo">
                        Web<span>Tools</span>
                    </div>
                    <p className="footer-desc">
                        Simple, fast and free web tools for developers, marketers and
                        creators.
                    </p>
                </div>

                {/* Links */}
                <div className="footer-links">
                    {FOOTER_SECTIONS.map((section) => (
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
                <span>
                    © {new Date().getFullYear()} WebTools. All rights reserved.
                </span>
            </div>
        </footer>
    );
}
