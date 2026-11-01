// src/components/keyword-research/HowItWorks.tsx
"use client";

import { motion } from "framer-motion";
import { Target, BarChart2, Rocket, HelpCircle } from "lucide-react";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    number: "01",
    icon: <Target size={24} />,
    title: "Enter Seed Keyword",
    text: "Type any root query, product, or phrase. Select your target country and language.",
  },
  {
    number: "02",
    icon: <HelpCircle size={24} />,
    title: "Google Autocomplete Crawl",
    text: "Our engine expands the query with seed variants, prepositions, questions, and alphabet modifiers.",
  },
  {
    number: "03",
    icon: <BarChart2 size={24} />,
    title: "Intent & Topic Grouping",
    text: "Keywords are classified automatically into Informational, Commercial, and Transactional buckets.",
  },
  {
    number: "04",
    icon: <Rocket size={24} />,
    title: "Filter, Copy & Export",
    text: "Sort by intent, word count, or volume. Download cleanly formatted CSV files for your workflow.",
  },
];

const MARQUEE_ITEMS = [
  "Google Suggest Queries",
  "Search Intent Classification",
  "Question-Based Keywords",
  "Preposition Modifiers",
  "Alphabet Soup A-Z",
  "Topic Clustering",
  "One-Click CSV Export",
  "Zero API Fees Required",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function HowItWorks() {
  return (
    <>
      {/* Marquee Strip */}
      <div className={styles.strip}>
        <div className={styles.stripTrack}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={styles.stripItem}>
              <span className={styles.stripDot}>◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className={styles.section} id="how-it-works">
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className={styles.header}
          >
            <span className={styles.label}>Workflow</span>
            <h2 className={styles.title}>
              Research Smarter,<br />Rank Faster
            </h2>
            <p className={styles.desc}>
              Four automated steps to uncover high-demand search terms in under 3 seconds.
            </p>
          </motion.div>

          <motion.div
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {STEPS.map((step) => (
              <motion.div key={step.number} className={styles.card} variants={itemVariants}>
                <div className={styles.stepNum}>{step.number}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
