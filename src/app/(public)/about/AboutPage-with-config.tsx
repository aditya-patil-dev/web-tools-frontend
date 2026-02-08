"use client";

import { motion } from "framer-motion";
import { ABOUT_CONFIG } from "./AboutPage-config";

// Animation variants
const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.34, 1.56, 0.64, 1] as const,
        },
    },
};

const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: 0.2,
            ease: "easeOut" as const,
        },
    },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut" as const,
        },
    },
};

const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
};

export default function AboutPage() {
    const { header, mission, why, audience, principles, technology, future } = ABOUT_CONFIG;

    return (
        <section className="about-wrapper">
            {/* Decorative background elements */}
            <div className="about-bg-blob about-bg-blob-1" />
            <div className="about-bg-blob about-bg-blob-2" />

            <div className="about-container">
                {/* Header */}
                <div className="about-header">
                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={headerVariants}
                    >
                        {header.title} <span>{header.titleAccent}</span>
                    </motion.h1>
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={subtitleVariants}
                    >
                        {header.subtitle}
                    </motion.p>
                </div>

                {/* Main Content */}
                <div className="about-content">
                    {/* Mission Section */}
                    <motion.div
                        className="about-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={sectionVariants}
                    >
                        <div className="section-icon">{mission.icon}</div>
                        <h2>{mission.title}</h2>
                        <p>{mission.content}</p>
                    </motion.div>

                    {/* Why Section */}
                    <motion.div
                        className="about-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={sectionVariants}
                    >
                        <div className="section-icon">{why.icon}</div>
                        <h2>{why.title}</h2>
                        <p>{why.content}</p>
                    </motion.div>

                    {/* Who It's For Section */}
                    <motion.div
                        className="about-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={sectionVariants}
                    >
                        <div className="section-icon">{audience.icon}</div>
                        <h2>{audience.title}</h2>
                        <motion.ul
                            className="about-list"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={listContainerVariants}
                        >
                            {audience.items.map((item, index) => (
                                <motion.li key={index} variants={listItemVariants}>
                                    <span className="list-icon">✓</span>
                                    {item}
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>

                    {/* Principles Section */}
                    <motion.div
                        className="about-section principles-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={sectionVariants}
                    >
                        <div className="section-icon">{principles.icon}</div>
                        <h2>{principles.title}</h2>
                        <motion.div
                            className="principles-grid"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={listContainerVariants}
                        >
                            {principles.items.map((principle, index) => (
                                <motion.div
                                    key={index}
                                    className="principle-card"
                                    variants={listItemVariants}
                                >
                                    <div className="principle-icon">{principle.icon}</div>
                                    <h3>{principle.title}</h3>
                                    <p>{principle.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Built Section */}
                    <motion.div
                        className="about-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={sectionVariants}
                    >
                        <div className="section-icon">{technology.icon}</div>
                        <h2>{technology.title}</h2>
                        <p>{technology.content}</p>
                    </motion.div>

                    {/* Future Section */}
                    <motion.div
                        className="about-section future-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={sectionVariants}
                    >
                        <div className="section-icon">{future.icon}</div>
                        <h2>{future.title}</h2>
                        <p>{future.content}</p>
                        <motion.div
                            className="cta-box"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <h3>{future.cta.heading}</h3>
                            <p>{future.cta.subheading}</p>
                            <motion.a
                                href={future.cta.buttonLink}
                                className="about-cta"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {future.cta.buttonText} →
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}