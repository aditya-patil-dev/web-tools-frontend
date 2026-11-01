// src/components/keyword-research/CtaSection.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import styles from "./CtaSection.module.css";

interface Props {
  onAnalyze: (kw: string) => void;
}

export default function CtaSection({ onAnalyze }: Props) {
  const [val, setVal] = useState("");

  const handleSubmit = () => {
    if (val.trim()) {
      onAnalyze(val.trim());
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.bg} />
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <span className={styles.label}>Boost Organic Traffic</span>
        <h2 className={styles.title}>
          Stop Guessing.<br />Start Ranking Today.
        </h2>
        <p className={styles.desc}>
          Zero signups required. Just type any seed topic and instantly unlock
          hundreds of ranking opportunities.
        </p>
        <div className={styles.ctaRow}>
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter another keyword to explore..."
            className={styles.ctaInput}
          />
          <button type="button" className={styles.ctaBtn} onClick={handleSubmit}>
            Try Free <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
