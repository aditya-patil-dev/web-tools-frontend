"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const badgeVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1] as const,
        },
    },
};

const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1] as const,
            delay: 0.1,
        },
    },
};

const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut" as const,
            delay: 0.3,
        },
    },
};

const ctaContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: 0.5,
            staggerChildren: 0.1,
        },
    },
};

const ctaVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
        },
    },
};

const trustVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.8,
            delay: 0.7,
            staggerChildren: 0.1,
        },
    },
};

const trustItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4 },
    },
};

export default function Hero() {
    return (
        <section className="hero-wrapper">
            {/* Decorative blobs */}
            <motion.div
                className="hero-blob hero-blob-a"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
                className="hero-blob hero-blob-b"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />

            <div className="hero-container">
                <motion.span
                    className="hero-badge"
                    initial="hidden"
                    animate="visible"
                    variants={badgeVariants}
                    whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 },
                    }}
                >
                    🚀 Free & Fast Web Tools
                </motion.span>

                <motion.h1
                    className="hero-title"
                    initial="hidden"
                    animate="visible"
                    variants={titleVariants}
                >
                    Powerful <span>Web Tools</span> for
                    <br />
                    Developers & Marketers
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    initial="hidden"
                    animate="visible"
                    variants={subtitleVariants}
                >
                    Convert images, optimize SEO, generate content, and get things done
                    faster — no sign-up, no limits.
                </motion.p>

                <motion.div
                    className="hero-actions"
                    initial="hidden"
                    animate="visible"
                    variants={ctaContainerVariants}
                >
                    <motion.div variants={ctaVariants}>
                        <Link
                            href="/tools"
                            className="hero-cta-primary"
                        >
                            Try Tools
                        </Link>
                    </motion.div>

                    <motion.div variants={ctaVariants}>
                        <Link
                            href="/pricing"
                            className="hero-cta-secondary"
                        >
                            View Pricing
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="hero-trust"
                    initial="hidden"
                    animate="visible"
                    variants={trustVariants}
                >
                    <motion.span variants={trustItemVariants}>
                        ⚡ Instant results
                    </motion.span>
                    <motion.span variants={trustItemVariants}>
                        🔒 Privacy-friendly
                    </motion.span>
                    <motion.span variants={trustItemVariants}>
                        💻 Built for productivity
                    </motion.span>
                </motion.div>
            </div>
        </section>
    );
}