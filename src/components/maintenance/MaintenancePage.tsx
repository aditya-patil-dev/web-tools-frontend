"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Sparkles,
  Clock,
  Coffee,
  Bell,
  CheckCircle2,
  ArrowRight,
  Zap,
  Cpu,
  ShieldCheck,
  Twitter,
  Github,
  MessageSquare,
  Lock,
  RefreshCw,
} from "lucide-react";
import styles from "./MaintenancePage.module.css";

interface MaintenancePageProps {
  siteName?: string;
  estimatedReturnMinutes?: number;
}

export default function MaintenancePage({
  siteName = "FusionTools",
  estimatedReturnMinutes = 45,
}: MaintenancePageProps) {
  // ── States ─────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [coffeeCount, setCoffeeCount] = useState(1280);
  const [floatingCoffees, setFloatingCoffees] = useState<
    { id: number; left: number }[]
  >([]);
  const [progress, setProgress] = useState(86);
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: estimatedReturnMinutes,
    seconds: 0,
  });

  const steps = [
    "Running Database Diagnostics & Indexing",
    "Upgrading Neural Processing Pipelines",
    "Optimizing Client-Side Web Tool Engines",
    "Finalizing CDN & Security Protocol Warmup",
  ];

  // ── Restore saved coffee & email subscription state ───────────────────────
  useEffect(() => {
    const savedCoffee = localStorage.getItem("fusion_maintenance_coffees");
    if (savedCoffee) {
      setCoffeeCount(parseInt(savedCoffee, 10));
    }
    const savedSub = localStorage.getItem("fusion_maintenance_subscribed");
    if (savedSub) {
      setIsSubscribed(true);
    }
  }, []);

  // ── Countdown Timer Effect ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ── Step & Progress Simulator Effect ──────────────────────────────────────
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const next = prev + 1;
        if (next > 90) setCurrentStepIndex(3);
        return next;
      });
    }, 12000);

    return () => clearInterval(progressInterval);
  }, []);

  // ── Handle Coffee Boost Click ──────────────────────────────────────────────
  const handleFeedCoffee = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newCount = coffeeCount + 1;
    setCoffeeCount(newCount);
    localStorage.setItem("fusion_maintenance_coffees", newCount.toString());

    // Generate floating coffee animation element
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newCoffee = { id: Date.now(), left: clickX };
    setFloatingCoffees((prev) => [...prev, newCoffee]);

    setTimeout(() => {
      setFloatingCoffees((prev) => prev.filter((item) => item.id !== newCoffee.id));
    }, 1000);
  };

  // ── Handle Email Notify Submit ────────────────────────────────────────────
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubscribed(true);
    localStorage.setItem("fusion_maintenance_subscribed", "true");
  };

  // ── Handle Developer Bypass ───────────────────────────────────────────────
  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "admin" || passcode.trim() === "bypass123") {
      document.cookie = "maintenance_bypass=true; path=/; max-age=86400";
      window.location.href = "/?bypass=true";
    } else {
      setPasscodeError("Invalid passcode. Try 'admin' or check credentials.");
    }
  };

  return (
    <div className={styles.maintenanceContainer}>
      {/* Background Animated Glows */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.gridOverlay} />

      {/* Main Glassmorphic Container */}
      <motion.div
        className={styles.mainCard}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Status Pill */}
        <div className={styles.statusBadge}>
          <span className={styles.pulseDot} />
          Scheduled Upgrade • System Maintenance
        </div>

        {/* Hero Icon with Glowing Gradient Ring */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconGlowRing} />
          <div className={styles.iconBox}>
            <Wrench size={38} className="animate-spin-slow" />
          </div>
        </div>

        {/* Main Hooking Headline */}
        <h1 className={styles.title}>
          We&apos;re Building Something Extraordinary
        </h1>

        {/* Hooking Description */}
        <p className={styles.description}>
          {siteName} is currently undergoing scheduled infrastructure upgrades to roll out
          <strong> next-generation AI tools</strong>, zero-latency rendering engines, and an upgraded user interface.
          We&apos;re tuning every gear to deliver a faster, smarter experience for you!
        </p>

        {/* Progress & Live Pipeline Section */}
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <div className={styles.progressStatus}>
              <RefreshCw size={16} className="spin-animation" style={{ color: "#818cf8" }} />
              <span>{steps[currentStepIndex]}</span>
            </div>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Countdown Clock */}
          <div className={styles.countdownGrid}>
            <div className={styles.timerCard}>
              <div className={styles.timerVal}>
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className={styles.timerLabel}>Hours</div>
            </div>
            <div className={styles.timerCard}>
              <div className={styles.timerVal}>
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className={styles.timerLabel}>Mins</div>
            </div>
            <div className={styles.timerCard}>
              <div className={styles.timerVal}>
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className={styles.timerLabel}>Secs</div>
            </div>
          </div>
        </div>

        {/* Interactive Coffee Booster Mini Game */}
        <div className={styles.boosterSection}>
          <div className={styles.boosterTitle}>
            <Coffee size={18} style={{ color: "#f59e0b" }} />
            <span>Feed the Dev Team Coffee</span>
          </div>
          <p className={styles.boosterDesc}>
            Press the button to boost our engineering speed &amp; get us back online faster! ☕
          </p>

          <button className={styles.coffeeButton} onClick={handleFeedCoffee}>
            <Coffee size={20} />
            <span>Boost Maintenance Speed!</span>

            {/* Floating Coffee Animations */}
            {floatingCoffees.map((coffee) => (
              <span
                key={coffee.id}
                className={styles.floatingCoffee}
                style={{ left: `${coffee.left}px` }}
              >
                ☕
              </span>
            ))}
          </button>

          <div className={styles.coffeeStats}>
            <span>
              Total Coffees Pumped:{" "}
              <strong className={styles.highlightCount}>
                {coffeeCount.toLocaleString()}
              </strong>
            </span>
            <span>•</span>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>
              Dev Speed +{Math.min(35, Math.floor(coffeeCount / 50))}%
            </span>
          </div>
        </div>

        {/* Email Notification Subscription Form */}
        <div className={styles.notifySection}>
          <div className={styles.notifyTitle}>
            Want an instant ping when {siteName} goes live?
          </div>

          {isSubscribed ? (
            <motion.div
              className={styles.successMsg}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 size={20} />
              <span>You&apos;re on the priority notification list! We&apos;ll email you the moment we launch.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleNotifySubmit} className={styles.notifyForm}>
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.emailInput}
              />
              <button type="submit" className={styles.submitBtn}>
                <Bell size={18} />
                <span>Notify Me</span>
              </button>
            </form>
          )}
        </div>

        {/* Sneak Peek Teasers */}
        <div className={styles.sneakPeekGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={20} />
            </div>
            <div className={styles.featureTitle}>10x Faster AI Engines</div>
            <div className={styles.featureDesc}>
              Blazing fast client-side image &amp; data processing algorithms.
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Cpu size={20} />
            </div>
            <div className={styles.featureTitle}>Zero-Latency Tools</div>
            <div className={styles.featureDesc}>
              Enhanced web tools suite with instant local offline execution.
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={20} />
            </div>
            <div className={styles.featureTitle}>Privacy First</div>
            <div className={styles.featureDesc}>
              End-to-end local processing without uploading your data to third parties.
            </div>
          </div>
        </div>

        {/* Footer Links & Admin Bypass Button */}
        <div className={styles.cardFooter}>
          <div className={styles.socialLinks}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Twitter size={15} /> Twitter/X
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Github size={15} /> GitHub
            </a>
            <a
              href="mailto:support@fusiontools.com"
              className={styles.socialLink}
            >
              <MessageSquare size={15} /> Support
            </a>
          </div>

          <div>
            <button
              onClick={() => setBypassModalOpen(true)}
              className={styles.bypassButton}
            >
              Admin / Dev Access 🔒
            </button>
          </div>
        </div>
      </motion.div>

      {/* Admin Bypass Modal */}
      <AnimatePresence>
        {bypassModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "20px",
                padding: "2rem",
                maxWidth: "400px",
                width: "100%",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Lock size={20} style={{ color: "#818cf8" }} />
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Admin Maintenance Bypass</h3>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                Enter developer passcode or admin token to preview the site during maintenance.
              </p>

              <form onSubmit={handleBypassSubmit}>
                <input
                  type="password"
                  placeholder="Passcode (e.g. admin)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError("");
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    marginBottom: "0.5rem",
                    outline: "none",
                  }}
                />
                {passcodeError && (
                  <div style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                    {passcodeError}
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setBypassModalOpen(false)}
                    style={{
                      padding: "0.6rem 1.2rem",
                      borderRadius: "10px",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#94a3b8",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.6rem 1.2rem",
                      borderRadius: "10px",
                      background: "#4f46e5",
                      border: "none",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Bypass Maintenance
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
