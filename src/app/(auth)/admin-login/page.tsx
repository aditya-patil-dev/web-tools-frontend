"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(() => {
        const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
        const passOk = password.trim().length >= 6;
        return emailOk && passOk;
    }, [email, password]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isValid) {
            setError("Please enter a valid email and a password (min 6 characters).");
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Replace with real API call
            await new Promise((r) => setTimeout(r, 900));

            router.push("/admin");
        } catch (err) {
            setError("Login failed. Please check your credentials and try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="loginRoot">
            {/* Animated background blobs */}
            <motion.div
                className="loginBlob loginBlobA"
                initial={{ opacity: 0, scale: 0.85, x: -40, y: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <motion.div
                className="loginBlob loginBlobB"
                initial={{ opacity: 0, scale: 0.85, x: 30, y: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            />

            <div className="loginContainer">
                <div className="loginWrapper">
                    {/* Login Card */}
                    <motion.div
                        className="loginCard"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    >
                        {/* Card Header */}
                        <div className="loginCardHeader">
                            <div className="loginCardTitle">
                                <h1 className="cardTitle">Admin Sign In</h1>
                                <p className="cardSubtitle">Use your admin credentials to continue.</p>
                            </div>

                            <motion.div
                                className="loginSpark"
                                animate={{ rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                                aria-hidden="true"
                            >
                                ✦
                            </motion.div>
                        </div>

                        {/* Form */}
                        <form onSubmit={onSubmit} className="loginForm">
                            {/* Email Field */}
                            <div className="formGroup">
                                <label htmlFor="email" className="formLabel">
                                    Email
                                </label>
                                <div className="inputGroup">
                                    <div className="inputIcon">
                                        <i className="bi bi-envelope" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="formInput"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="formGroup">
                                <label htmlFor="password" className="formLabel">
                                    Password
                                </label>
                                <div className="inputGroup">
                                    <div className="inputIcon">
                                        <i className="bi bi-shield-lock" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="formInput"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="inputToggle"
                                        onClick={() => setShowPassword((s) => !s)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <i className={`bi bi-eye${showPassword ? "-slash" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="formRow">
                                <label className="checkboxLabel">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="checkboxInput"
                                    />
                                    <span className="checkboxText">Remember me</span>
                                </label>

                                <Link href="/forgot-password" className="forgotLink">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="errorBox"
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        role="alert"
                                    >
                                        <i className="bi bi-exclamation-triangle" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                className="loginBtn"
                                disabled={!isValid || isSubmitting}
                                whileHover={isValid && !isSubmitting ? { y: -2 } : {}}
                                whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <i className="bi bi-arrow-right" />
                                    </>
                                )}
                            </motion.button>

                            {/* Help Text */}
                            <div className="loginHelp">
                                Having trouble? Contact your system administrator.
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}