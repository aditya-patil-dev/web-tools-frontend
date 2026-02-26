"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { POPULAR_TOOLS } from "./tools.config";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1] as const,
        },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut" as const,
        },
    },
};

interface Tool {
    title: string;
    description: string;
    icon: string;
    href: string;
    badge?: string | null;
}

interface PopularToolsConfig {
    header: {
        title: string;
        subtitle: string;
    };
    tools: Tool[];
    footer: {
        text: string;
        href: string;
    };
}

interface PopularToolsProps {
    config?: PopularToolsConfig;
}

const DEFAULT_CONFIG: PopularToolsConfig = {
    header: {
        title: "Popular <span>Tools</span>",
        subtitle: "Try our most used tools trusted by developers and marketers.",
    },
    tools: POPULAR_TOOLS,
    footer: {
        text: "View All Tools →",
        href: "/tools",
    },
};

export default function PopularTools({ config = DEFAULT_CONFIG }: PopularToolsProps) {
    return (
        <section className="tools-wrapper">
            <div className="tools-container">
                <motion.div
                    className="tools-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={headerVariants}
                >
                    <h2 dangerouslySetInnerHTML={{ __html: config.header.title }} />
                    <p>{config.header.subtitle}</p>
                </motion.div>

                <motion.div
                    className="tools-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    {config.tools.map((tool, index) => (
                        <motion.div
                            key={index}
                            className="tool-card"
                            variants={itemVariants}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <Link href={tool.href}>
                                <motion.div
                                    className="tool-icon"
                                    whileHover={{
                                        scale: 1.1,
                                        rotate: 5,
                                        transition: { duration: 0.3 },
                                    }}
                                >
                                    {tool.icon}
                                </motion.div>

                                <div className="tool-content">
                                    <h3>
                                        {tool.title}
                                        {tool.badge && (
                                            <span className={`tool-badge ${tool.badge}`}>
                                                {tool.badge}
                                            </span>
                                        )}
                                    </h3>
                                    <p>{tool.description}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className="tools-footer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link href={config.footer.href} className="tools-view-all">
                        {config.footer.text}
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}