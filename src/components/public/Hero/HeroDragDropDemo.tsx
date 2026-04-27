"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { DEFAULT_HERO_CONFIG } from "./hero.config";
import AppLink from "@/components/common/AppLink";

const steps = [
    {
        id: 1,
        icon: "HiSearch",
        title: "Pick tool",
        description: "Access 20+ tools for images, PDFs, SEO, and developers.",
        tag: "No account needed",
    },
    {
        id: 2,
        icon: "HiCloudUpload",
        title: "Upload",
        description: "Drop files or paste URLs. Data stays in your browser — 100% private.",
        tag: "Works on any device",
    },
    {
        id: 3,
        icon: "HiDownload",
        title: "Download",
        description: "Get results in seconds. One-click download with no watermarks.",
        tag: "Always free",
    },
];

const trustPills = [
    { icon: "HiShieldCheck", text: "100% private" },
    { icon: "HiCheckCircle", text: "No signup" },
    { icon: "HiCurrencyDollar", text: "Always free" },
    { icon: "HiClock", text: "Fast results" },
];

export default function HeroDragDropDemo() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="how-it-works-card horizontal"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="card-header-horizontal">
                <span className="how-it-works-badge">HOW IT WORKS</span>
                <h2 className="card-title">Ready in 3 simple steps</h2>
            </div>

            <div className="steps-row">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`step-col ${activeStep === index ? "active" : ""}`}
                        onClick={() => setActiveStep(index)}
                    >
                        <div className="step-top">
                            <div className={`step-circle ${activeStep === index ? "active" : ""}`}>
                                <DynamicIcon
                                    name={step.icon}
                                    size={18}
                                    fallback={<span>{step.id}</span>}
                                    className="step-icon"
                                />
                            </div>
                            {index < steps.length - 1 && <div className="step-line-horizontal" />}
                        </div>
                        <span className="step-label">{step.title}</span>
                    </div>
                ))}
            </div>

            <div className="active-step-info">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="active-content-box"
                    >
                        <p className="step-description">{steps[activeStep].description}</p>
                        <span className="step-tag">{steps[activeStep].tag}</span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* <div className="trust-pills-row">
                {trustPills.map((pill, index) => (
                    <div key={index} className="trust-pill-compact">
                        <DynamicIcon name={pill.icon} size={12} fallback={null} className="pill-icon" />
                        <span>{pill.text}</span>
                    </div>
                ))}
            </div> */}

            <div className="card-footer-horizontal">
                <AppLink href={DEFAULT_HERO_CONFIG.thirdCta.href} className="card-cta-compact">
                    Try a tool — it's free
                    <DynamicIcon name="HiArrowRight" size={14} fallback={<span>→</span>} className="cta-arrow" />
                </AppLink>
                {/* <AppLink href={DEFAULT_HERO_CONFIG.secondaryCta.href} className="card-link-compact">
                    Explore all 20+ tools
                </AppLink> */}
            </div>
        </motion.div>
    );
}
