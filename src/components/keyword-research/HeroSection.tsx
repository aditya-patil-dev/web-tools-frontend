"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Zap } from "lucide-react";
import styles from "./HeroSection.module.css";

interface Props {
  onAnalyze: (kw: string) => void;
  scrollToTool: () => void;
}

const STATS = [
  { value: "2.4B", label: "Keywords" },
  { value: "190+", label: "Countries" },
  { value: "50K+", label: "Users" },
  { value: "100%", label: "Free" },
];

const PLACEHOLDERS = [
  "digital marketing tools",
  "best running shoes",
  "SEO software 2025",
  "coffee maker reviews",
  "learn python online",
];

export default function HeroSection({ onAnalyze, scrollToTool }: Props) {
  const [inputVal, setInputVal] = useState("");
  const [phIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const val = inputVal.trim();
    if (!val) { inputRef.current?.focus(); return; }
    onAnalyze(val);
  }, [inputVal, onAnalyze]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <section className={styles.hero}>
      {/* Background layers */}
      <div className={styles.heroBg} />
      <div className={styles.heroGrid} />
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      <div className={styles.heroContent}>
        {/* Badge */}
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.badgeDot} />
          Free Keyword Research Tool
        </motion.div>

        {/* Title */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Find Keywords That<br />
          <span className={styles.accent}>Actually Rank</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className={styles.desc}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover high-volume, low-competition keywords in seconds.
          Power your SEO strategy with real search data and intelligent suggestions.
        </motion.p>

        {/* Search bar */}
        <motion.div
          className={styles.searchBar}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Search className={styles.searchIcon} size={18} />
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Try "${PLACEHOLDERS[phIndex]}"…`}
            className={styles.searchInput}
            autoComplete="off"
          />
          <button className={styles.searchBtn} onClick={handleSubmit}>
            Analyze Now
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.statGroup}>
              {i > 0 && <div className={styles.statDivider} />}
              <div className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className={styles.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToTool}
      >
        <div className={styles.scrollMouse}>
          <div className={styles.scrollDot} />
        </div>
        <span>Scroll to explore</span>
      </motion.div>
    </section>
  );
}
