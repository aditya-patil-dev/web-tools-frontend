"use client";

import { useState } from "react";

interface SEOContentConfig {
    title: string;
    intro: string;
    expandedContent: {
        heading: string;
        content: string;
    }[];
}

interface SEOContentProps {
    config?: SEOContentConfig;
}

const DEFAULT_CONFIG: SEOContentConfig = {
    title: "Free <span>Online Web Tools</span> for Everyday Productivity",
    intro: "Our platform provides a growing collection of free online tools designed to help developers, marketers, students, and content creators work faster and more efficiently.",
    expandedContent: [
        {
            heading: "Why use online web tools?",
            content: "Online web tools eliminate the need to install heavy software or manage complex setups. With just a browser, you can instantly access powerful utilities that handle common tasks.",
        },
        {
            heading: "SEO, image, and AI tools in one place",
            content: "Instead of relying on multiple websites, our platform brings together essential SEO tools, image tools, and AI-powered utilities under one roof.",
        },
        {
            heading: "Built for speed, privacy, and reliability",
            content: "Performance and privacy are core principles of our toolset. Most tools process data instantly and do not store files or personal information.",
        },
        {
            heading: "Constantly growing tool library",
            content: "We continuously add new tools and improve existing ones based on real-world use cases.",
        },
    ],
};



export default function SEOContent({ config = DEFAULT_CONFIG }: SEOContentProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="seo-wrapper">
            <div className="seo-container">
                <h2 dangerouslySetInnerHTML={{ __html: config.title }} />

                <p>
                    {config.intro}
                </p>

                {expanded && (
                    <div className="seo-content" style={{ overflow: "hidden" }}>
                        <div>
                            {config.expandedContent.map((section, index) => (
                                <div key={index}>
                                    <h3>{section.heading}</h3>
                                    <p>{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    className="seo-toggle"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Show less" : "Read more"}
                </button>
            </div>
        </section>
    );
}