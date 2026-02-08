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

export default function PopularTools() {
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
                    <h2>
                        Popular <span>Tools</span>
                    </h2>
                    <p>
                        Try our most used tools trusted by developers and marketers.
                    </p>
                </motion.div>

                <motion.div
                    className="tools-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    {POPULAR_TOOLS.map((tool) => (
                        <motion.div
                            key={tool.href}
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
                    <Link href="/tools" className="tools-view-all">
                        View All Tools →
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}