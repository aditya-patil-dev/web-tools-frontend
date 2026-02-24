"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const contentVariants = {
    collapsed: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
    expanded: {
        height: "auto",
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
};

const paragraphVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
        },
    }),
};

export default function SEOContent({ config = DEFAULT_CONFIG }: SEOContentProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="seo-wrapper">
            <div className="seo-container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    dangerouslySetInnerHTML={{ __html: config.title }}
                />

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {config.intro}
                </motion.p>

                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            className="seo-content"
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={contentVariants}
                            style={{ overflow: "hidden" }}
                        >
                            <motion.div>
                                {config.expandedContent.map((section, index) => (
                                    <div key={index}>
                                        <motion.h3
                                            custom={index * 2}
                                            initial="hidden"
                                            animate="visible"
                                            variants={paragraphVariants}
                                        >
                                            {section.heading}
                                        </motion.h3>
                                        <motion.p
                                            custom={index * 2 + 1}
                                            initial="hidden"
                                            animate="visible"
                                            variants={paragraphVariants}
                                        >
                                            {section.content}
                                        </motion.p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    className="seo-toggle"
                    onClick={() => setExpanded(!expanded)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    {expanded ? "Show less" : "Read more"}
                </motion.button>
            </div>
        </section>
    );
}