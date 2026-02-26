"use client";

import { motion } from "framer-motion";
import { STEPS } from "./steps.config";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const stepVariants = {
    hidden: {
        opacity: 0,
        x: -50,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.34, 1.56, 0.64, 1] as const,
        },
    },
};

const stepNumberVariants = {
    hidden: {
        scale: 0,
        rotate: -180,
    },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 12,
            delay: 0.2,
        },
    },
};

interface Step {
    step: string;
    icon: string;
    title: string;
    description: string;
}

interface HowItWorksConfig {
    header: {
        title: string;
        subtitle: string;
    };
    steps: Step[];
}

interface HowItWorksProps {
    config?: HowItWorksConfig;
}

const DEFAULT_CONFIG: HowItWorksConfig = {
    header: {
        title: "How It <span>Works</span>",
        subtitle: "Start using our tools in seconds. No learning curve, no setup.",
    },
    steps: STEPS,
};

export default function HowItWorks({ config = DEFAULT_CONFIG }: HowItWorksProps) {
    return (
        <section className="how-wrapper">
            <div className="how-container">
                <motion.div
                    className="how-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h2 dangerouslySetInnerHTML={{ __html: config.header.title }} />
                    <p>{config.header.subtitle}</p>
                </motion.div>

                <motion.div
                    className="how-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    {config.steps.map((step, index) => (
                        <motion.div
                            key={step.step}
                            className="how-card"
                            variants={stepVariants}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <motion.div
                                className="how-step"
                                variants={stepNumberVariants}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: 360,
                                    transition: { duration: 0.5 },
                                }}
                            >
                                {step.step}
                            </motion.div>

                            <motion.div
                                className="how-icon"
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    delay: 0.2 + index * 0.15,
                                    type: "spring",
                                    stiffness: 150,
                                }}
                                whileHover={{
                                    scale: 1.15,
                                    rotate: 5,
                                    transition: { duration: 0.3 },
                                }}
                            >
                                {step.icon}
                            </motion.div>

                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + index * 0.15 }}
                            >
                                {step.title}
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + index * 0.15 }}
                            >
                                {step.description}
                            </motion.p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}