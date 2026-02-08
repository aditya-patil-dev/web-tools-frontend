"use client";

import { motion } from "framer-motion";
import { FEATURES } from "./features.config";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.9,
    },
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

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
        },
    },
};

export default function WhyChooseUs() {
    return (
        <section className="why-wrapper">
            <div className="why-container">
                <motion.div
                    className="why-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h2>
                        Why Choose <span>Us</span>
                    </h2>
                    <p>
                        Built to help you work faster, smarter, and more efficiently —
                        without unnecessary complexity.
                    </p>
                </motion.div>

                <motion.div
                    className="why-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="why-card"
                            variants={cardVariants}
                            whileHover={{
                                y: -8,
                                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
                                transition: { duration: 0.2 },
                            }}
                        >
                            <motion.div
                                className="why-icon"
                                variants={iconVariants}
                                whileHover={{
                                    scale: 1.15,
                                    rotate: 5,
                                    transition: { duration: 0.3 },
                                }}
                            >
                                {feature.icon}
                            </motion.div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                {feature.title}
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                {feature.description}
                            </motion.p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}