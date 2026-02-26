"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "./hero.config";

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

interface HeroProps {
    config?: HeroConfig;
}

export default function Hero({ config = DEFAULT_HERO_CONFIG }: HeroProps) {
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
                    {config.badge}
                </motion.span>

                <motion.h1
                    className="hero-title"
                    initial="hidden"
                    animate="visible"
                    variants={titleVariants}
                    dangerouslySetInnerHTML={{ __html: config.title }}
                />

                <motion.p
                    className="hero-subtitle"
                    initial="hidden"
                    animate="visible"
                    variants={subtitleVariants}
                >
                    {config.subtitle}
                </motion.p>

                <motion.div
                    className="hero-actions"
                    initial="hidden"
                    animate="visible"
                    variants={ctaContainerVariants}
                >
                    <motion.div variants={ctaVariants}>
                        <Link
                            href={config.primaryCta.href}
                            className="hero-cta-primary"
                        >
                            {config.primaryCta.text}
                        </Link>
                    </motion.div>

                    <motion.div variants={ctaVariants}>
                        <Link
                            href={config.secondaryCta.href}
                            className="hero-cta-secondary"
                        >
                            {config.secondaryCta.text}
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="hero-trust"
                    initial="hidden"
                    animate="visible"
                    variants={trustVariants}
                >
                    {config.trustBadges.map((badge, index) => (
                        <motion.span key={index} variants={trustItemVariants}>
                            {badge.icon} {badge.text}
                        </motion.span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}