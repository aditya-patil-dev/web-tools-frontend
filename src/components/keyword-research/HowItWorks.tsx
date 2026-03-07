"use client";

import { motion } from "framer-motion";
import { Target, BarChart2, Rocket, TrendingUp } from "lucide-react";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    number: "01",
    icon: <Target size={22} />,
    title: "Enter a Seed Keyword",
    text: "Type any topic, product, or phrase. Our engine expands it into hundreds of related opportunities instantly.",
  },
  {
    number: "02",
    icon: <BarChart2 size={22} />,
    title: "Analyze the Data",
    text: "See search volume, difficulty, CPC, and intent for every keyword suggestion in a clean, sortable table.",
  },
  {
    number: "03",
    icon: <Rocket size={22} />,
    title: "Build Your Strategy",
    text: "Filter, sort, and export your keyword list to fuel your content calendar and ad campaigns.",
  },
  {
    number: "04",
    icon: <TrendingUp size={22} />,
    title: "Track & Iterate",
    text: "Monitor rankings over time and discover new gaps as your competitors evolve.",
  },
];

const MARQUEE_ITEMS = [
  "Search Volume Data", "Keyword Difficulty", "CPC Analysis",
  "Search Intent", "Related Keywords", "Trend Data",
  "SERP Overview", "Competitor Gaps", "Long-tail Suggestions", "Question Keywords",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
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
            <span className={styles.label}>How It Works</span>
            <h2 className={styles.title}>Research smarter,<br />rank faster.</h2>
            <p className={styles.desc}>Three simple steps to uncover your best keyword opportunities.</p>
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
