"use client";

import { motion } from "framer-motion";

export default function LoadingOverlay({ message }: { message?: string }) {
    return (
        <motion.div
            className="loadingOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-live="assertive"
            aria-busy="true"
        >
            <div className="loadingCard">
                <div className="dots" aria-hidden="true">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                </div>

                <div className="loadingText">{message ?? "Loading, please wait…"}</div>
            </div>
        </motion.div>
    );
}
