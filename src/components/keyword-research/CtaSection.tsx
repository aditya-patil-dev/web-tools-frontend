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
        <span className={styles.label}>Get Started Free</span>
        <h2 className={styles.title}>Your competitors<br />are already using it.</h2>
        <p className={styles.desc}>Stop guessing. Start ranking. No signup required — just type a keyword and go.</p>
        <div className={styles.ctaRow}>
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && val.trim() && onAnalyze(val.trim())}
            placeholder="Enter a keyword to get started…"
            className={styles.ctaInput}
          />
          <button
            className={styles.ctaBtn}
            onClick={() => val.trim() && onAnalyze(val.trim())}
          >
            Try It Free <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
