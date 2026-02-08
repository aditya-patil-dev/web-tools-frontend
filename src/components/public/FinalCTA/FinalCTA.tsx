"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function FinalCTA() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Parallax effect for the section
    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    return (
        <section className="cta-wrapper" ref={ref}>
            <motion.div
                className="cta-container"
                style={{ y, opacity }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                        duration: 0.7,
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    Start Using <span>Powerful Web Tools</span> Today
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                        duration: 0.6,
                        delay: 0.2,
                        ease: "easeOut",
                    }}
                >
                    No sign-up. No hidden limits. Just fast, reliable tools built to help
                    you get things done.
                </motion.p>

                <motion.div
                    className="cta-actions"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                        duration: 0.5,
                        delay: 0.3,
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link href="/tools" className="cta-primary">
                            Try Tools Now
                        </Link>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link href="/pricing" className="cta-secondary">
                            View Pricing
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="cta-footnote"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    ⚡ Instant results · 🔒 Privacy-friendly · 🚀 Built for productivity
                </motion.div>
            </motion.div>
        </section>
    );
}