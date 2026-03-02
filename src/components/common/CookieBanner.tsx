"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCookieConsent } from "@/context/CookieConsent";

export default function CookieConsentBanner() {
    const { consent, isLoaded, acceptCookies, declineCookies } = useCookieConsent();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only show if user hasn't made a choice yet
        if (isLoaded && consent === null) {
            // Small delay so it doesn't pop instantly on page load
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, consent]);

    function handleAccept() {
        setVisible(false);
        acceptCookies();
    }

    function handleDecline() {
        setVisible(false);
        declineCookies();
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="cookieBanner"
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    role="dialog"
                    aria-label="Cookie consent"
                    aria-live="polite"
                >
                    {/* Icon */}
                    <div className="cookieIcon" aria-hidden="true">🍪</div>

                    {/* Text */}
                    <div className="cookieContent">
                        <p className="cookieTitle">We use cookies</p>
                        <p className="cookieDesc">
                            We use cookies to track how tools are used and improve your experience.
                            No personal data is sold.{" "}
                            <Link href="/privacy-policy" className="cookieLink">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="cookieActions">
                        <button
                            type="button"
                            className="cookieBtnDecline"
                            onClick={handleDecline}
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            className="cookieBtnAccept"
                            onClick={handleAccept}
                        >
                            Accept
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}