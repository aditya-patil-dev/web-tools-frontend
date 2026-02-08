"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SEOContent() {
    const [expanded, setExpanded] = useState(false);

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

    return (
        <section className="seo-wrapper">
            <div className="seo-container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    Free <span>Online Web Tools</span> for Everyday Productivity
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Our platform provides a growing collection of free online tools
                    designed to help developers, marketers, students, and content creators
                    work faster and more efficiently. From image conversion and
                    compression to SEO analysis and AI-powered utilities, all tools are
                    built with performance and simplicity in mind.
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
                                <motion.h3
                                    custom={0}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    Why use online web tools?
                                </motion.h3>
                                <motion.p
                                    custom={1}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    Online web tools eliminate the need to install heavy software
                                    or manage complex setups. With just a browser, you can
                                    instantly access powerful utilities that handle common tasks
                                    like file conversion, keyword research, text formatting, and
                                    optimization. This saves time, reduces friction, and improves
                                    productivity.
                                </motion.p>

                                <motion.h3
                                    custom={2}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    SEO, image, and AI tools in one place
                                </motion.h3>
                                <motion.p
                                    custom={3}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    Instead of relying on multiple websites, our platform brings
                                    together essential SEO tools, image tools, and AI-powered
                                    utilities under one roof. Whether you want to compress images
                                    for faster page load, generate SEO-friendly meta tags, or
                                    explore AI-assisted content ideas, everything is available in
                                    a single interface.
                                </motion.p>

                                <motion.h3
                                    custom={4}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    Built for speed, privacy, and reliability
                                </motion.h3>
                                <motion.p
                                    custom={5}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    Performance and privacy are core principles of our toolset.
                                    Most tools process data instantly and do not store files or
                                    personal information. This makes our platform ideal for
                                    professionals who value speed, security, and predictable
                                    results.
                                </motion.p>

                                <motion.h3
                                    custom={6}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    Constantly growing tool library
                                </motion.h3>
                                <motion.p
                                    custom={7}
                                    initial="hidden"
                                    animate="visible"
                                    variants={paragraphVariants}
                                >
                                    We continuously add new tools and improve existing ones based
                                    on real-world use cases. Our goal is to create a reliable
                                    toolbox that grows alongside your workflow, helping you solve
                                    problems faster without unnecessary complexity.
                                </motion.p>
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