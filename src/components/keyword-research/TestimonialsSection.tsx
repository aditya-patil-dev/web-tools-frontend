"use client";

import { motion } from "framer-motion";
import styles from "./Testimonials.module.css";

const TESTIMONIALS = [
  {
    stars: 5,
    text: "This tool helped me find a cluster of zero-competition keywords that tripled my organic traffic in 3 months. Absolutely game-changing.",
    name: "Arjun Kumar",
    role: "SEO Consultant",
    initials: "AK",
    gradient: "linear-gradient(135deg,#ff6b35,#ff5722)",
  },
  {
    stars: 5,
    text: "The intent classification alone saves me hours every week. I no longer guess whether to write a blog post or a product page.",
    name: "Sarah Mitchell",
    role: "Content Strategist",
    initials: "SM",
    gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)",
  },
  {
    stars: 5,
    text: "Clean UI, fast results, and the CSV export is perfect. We use this for every new client onboarding. Can't imagine working without it.",
    name: "Riya Patel",
    role: "Digital Marketing Lead",
    initials: "RP",
    gradient: "linear-gradient(135deg,#10b981,#059669)",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
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
          <span className={styles.label}>Loved By SEOs</span>
          <h2 className={styles.title}>What users say</h2>
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
              <div className={styles.stars}>{"★".repeat(t.stars)}</div>
              <p className={styles.text}>{t.text}</p>
              <div className={styles.author}>
                <div className={styles.avatar} style={{ background: t.gradient }}>{t.initials}</div>
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
