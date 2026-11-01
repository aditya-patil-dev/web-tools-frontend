// src/components/keyword-research/TestimonialsSection.tsx
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import styles from "./Testimonials.module.css";

const TESTIMONIALS = [
  {
    stars: 5,
    text: "The questions and prepositions feature gave me 150+ blog article topics in 2 minutes. We increased our organic search impressions by 240% in just two months.",
    name: "Arjun Sharma",
    role: "SEO & Growth Lead",
    initials: "AS",
    gradient: "linear-gradient(135deg, #ff6b35, #ff5722)",
  },
  {
    stars: 5,
    text: "Having search intent automatically tagged into informational vs transactional saves so much manual keyword sorting. It's fast, free, and incredibly clean.",
    name: "Sarah Jenkins",
    role: "Content Strategist",
    initials: "SJ",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    stars: 5,
    text: "The one-click CSV export and copy-all buttons make integrating this tool into client reports and spreadsheets effortless. A true daily driver.",
    name: "Rohan Verma",
    role: "Digital Agency Founder",
    initials: "RV",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <span className={styles.label}>SEOs & Creators</span>
          <h2 className={styles.title}>What Search Marketers Say</h2>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} className={styles.card} variants={cardVariants}>
              <div className={styles.stars}>
                {Array.from({ length: t.stars }).map((_, sIdx) => (
                  <Star key={sIdx} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className={styles.text}>{t.text}</p>
              <div className={styles.author}>
                <div className={styles.avatar} style={{ background: t.gradient }}>
                  {t.initials}
                </div>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
