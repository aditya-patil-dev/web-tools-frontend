"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiClock,
    FiCopy,
    FiCheckCircle,
    FiRefreshCw,
    FiCalendar,
    FiArrowRight,
    FiArrowLeft,
    FiZap
} from "react-icons/fi";

type ConversionMode = "timestamp-to-date" | "date-to-timestamp";
type TimestampUnit = "seconds" | "milliseconds";

const UnixTimestampTool = () => {
    const [mode, setMode] = useState<ConversionMode>("timestamp-to-date");
    const [timestampInput, setTimestampInput] = useState("");
    const [dateInput, setDateInput] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>("seconds");
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
    const [results, setResults] = useState<any>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Update current timestamp every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Format timestamp to various date formats
    const formatTimestamp = (timestamp: number, unit: TimestampUnit) => {
        try {
            // Convert to milliseconds if needed
            const ms = unit === "seconds" ? timestamp * 1000 : timestamp;
            const date = new Date(ms);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                throw new Error("Invalid timestamp");
            }

            return {
                iso8601: date.toISOString(),
                rfc2822: date.toUTCString(),
                local: date.toLocaleString(),
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString(),
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hours: date.getHours(),
                minutes: date.getMinutes(),
                seconds: date.getSeconds(),
                milliseconds: date.getMilliseconds(),
                dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
                monthName: date.toLocaleDateString('en-US', { month: 'long' }),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                utc: date.toUTCString(),
                relativeTime: getRelativeTime(date),
            };
        } catch (err) {
            throw new Error("Invalid timestamp value");
        }
    };

    // Get relative time (e.g., "2 hours ago", "in 3 days")
    const getRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        const isPast = diffMs < 0;
        const abs = Math.abs;

        if (abs(diffSecs) < 60) {
            return isPast ? `${abs(diffSecs)} seconds ago` : `in ${abs(diffSecs)} seconds`;
        } else if (abs(diffMins) < 60) {
            return isPast ? `${abs(diffMins)} minutes ago` : `in ${abs(diffMins)} minutes`;
        } else if (abs(diffHours) < 24) {
            return isPast ? `${abs(diffHours)} hours ago` : `in ${abs(diffHours)} hours`;
        } else if (abs(diffDays) < 30) {
            return isPast ? `${abs(diffDays)} days ago` : `in ${abs(diffDays)} days`;
        } else if (abs(diffMonths) < 12) {
            return isPast ? `${abs(diffMonths)} months ago` : `in ${abs(diffMonths)} months`;
        } else {
            return isPast ? `${abs(diffYears)} years ago` : `in ${abs(diffYears)} years`;
        }
    };

    // Convert timestamp to date
    const handleTimestampToDate = () => {
        setError(null);
        setResults(null);

        if (!timestampInput.trim()) {
            setError("Please enter a timestamp");
            return;
        }

        try {
            const timestamp = parseInt(timestampInput.trim());

            if (isNaN(timestamp)) {
                throw new Error("Timestamp must be a number");
            }

            const formatted = formatTimestamp(timestamp, timestampUnit);
            setResults(formatted);
            toast.success("Timestamp converted successfully!", "Success");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message, "Conversion Failed");
        }
    };

    // Convert date to timestamp
    const handleDateToTimestamp = () => {
        setError(null);
        setResults(null);

        if (!dateInput.trim()) {
            setError("Please select a date");
            return;
        }

        try {
            // Combine date and time
            const dateTimeString = timeInput ? `${dateInput}T${timeInput}` : dateInput;
            const date = new Date(dateTimeString);

            if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
            }

            const timestampSeconds = Math.floor(date.getTime() / 1000);
            const timestampMilliseconds = date.getTime();

            setResults({
                seconds: timestampSeconds,
                milliseconds: timestampMilliseconds,
                iso8601: date.toISOString(),
                local: date.toLocaleString(),
                utc: date.toUTCString(),
            });

            toast.success("Date converted to timestamp!", "Success");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message, "Conversion Failed");
        }
    };

    // Use current timestamp
    const useCurrentTimestamp = () => {
        setTimestampInput(currentTimestamp.toString());
        toast.success("Current timestamp loaded", "Success");
    };

    // Use current date/time
    const useCurrentDateTime = () => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
        setDateInput(dateStr);
        setTimeInput(timeStr);
        toast.success("Current date/time loaded", "Success");
    };

    // Copy to clipboard
    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            toast.success(`${label} copied!`, "Copied");
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            toast.error("Failed to copy", "Error");
        }
    };

    // Clear all
    const handleClear = () => {
        setTimestampInput("");
        setDateInput("");
        setTimeInput("");
        setResults(null);
        setError(null);
        toast.info("Cleared", "Reset");
    };

    // Switch mode
    const switchMode = () => {
        setMode(mode === "timestamp-to-date" ? "date-to-timestamp" : "timestamp-to-date");
        setTimestampInput("");
        setDateInput("");
        setTimeInput("");
        setResults(null);
        setError(null);
    };

    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Convert Unix timestamps to human-readable dates or convert dates to Unix timestamps.
                    Perfect for debugging, logging, and API development.
                </p>
            </div>

            {/* Current Timestamp Display */}
            <div className="current-timestamp-section">
                <div className="current-timestamp-card">
                    <div className="timestamp-icon">
                        <FiClock />
                    </div>
                    <div className="timestamp-info">
                        <div className="timestamp-label">Current Unix Timestamp</div>
                        <div className="timestamp-value">{currentTimestamp.toLocaleString()}</div>
                        <div className="timestamp-date">{new Date().toLocaleString()}</div>
                    </div>
                    <button
                        className="btn-copy-current"
                        onClick={() => handleCopy(currentTimestamp.toString(), "Current Timestamp")}
                    >
                        {copied === "Current Timestamp" ? <FiCheckCircle /> : <FiCopy />}
                    </button>
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="timestamp-mode-section">
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${mode === "timestamp-to-date" ? "active" : ""}`}
                        onClick={() => mode !== "timestamp-to-date" && switchMode()}
                    >
                        <FiClock />
                        Timestamp to Date
                    </button>
                    <button
                        className="mode-switch-icon"
                        onClick={switchMode}
                        title="Switch mode"
                    >
                        <FiRefreshCw />
                    </button>
                    <button
                        className={`mode-btn ${mode === "date-to-timestamp" ? "active" : ""}`}
                        onClick={() => mode !== "date-to-timestamp" && switchMode()}
                    >
                        <FiCalendar />
                        Date to Timestamp
                    </button>
                </div>
            </div>

            <div className="timestamp-workspace">
                {/* Input Section */}
                <div className="timestamp-input-section">
                    <div className="section-header">
                        <h3>
                            {mode === "timestamp-to-date" ? <FiClock /> : <FiCalendar />}
                            {mode === "timestamp-to-date" ? "Timestamp Input" : "Date Input"}
                        </h3>
                    </div>

                    {mode === "timestamp-to-date" ? (
                        <>
                            {/* Timestamp Unit Selector */}
                            <div className="unit-selector">
                                <button
                                    className={`unit-btn ${timestampUnit === "seconds" ? "active" : ""}`}
                                    onClick={() => setTimestampUnit("seconds")}
                                >
                                    Seconds (10 digits)
                                </button>
                                <button
                                    className={`unit-btn ${timestampUnit === "milliseconds" ? "active" : ""}`}
                                    onClick={() => setTimestampUnit("milliseconds")}
                                >
                                    Milliseconds (13 digits)
                                </button>
                            </div>

                            <input
                                type="text"
                                className="timestamp-input"
                                value={timestampInput}
                                onChange={(e) => setTimestampInput(e.target.value)}
                                placeholder={timestampUnit === "seconds" ? "1234567890" : "1234567890123"}
                            />

                            <button className="btn-use-current" onClick={useCurrentTimestamp}>
                                <FiZap /> Use Current Timestamp
                            </button>

                            <motion.button
                                className="btn-convert-timestamp"
                                onClick={handleTimestampToDate}
                                disabled={!timestampInput.trim()}
                                whileHover={{ scale: !timestampInput.trim() ? 1 : 1.02 }}
                                whileTap={{ scale: !timestampInput.trim() ? 1 : 0.98 }}
                            >
                                <FiArrowRight />
                                Convert to Date
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <div className="date-time-inputs">
                                <div className="input-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        className="date-input"
                                        value={dateInput}
                                        onChange={(e) => setDateInput(e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Time (Optional)</label>
                                    <input
                                        type="time"
                                        className="time-input"
                                        value={timeInput}
                                        onChange={(e) => setTimeInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button className="btn-use-current" onClick={useCurrentDateTime}>
                                <FiZap /> Use Current Date/Time
                            </button>

                            <motion.button
                                className="btn-convert-timestamp"
                                onClick={handleDateToTimestamp}
                                disabled={!dateInput.trim()}
                                whileHover={{ scale: !dateInput.trim() ? 1 : 1.02 }}
                                whileTap={{ scale: !dateInput.trim() ? 1 : 0.98 }}
                            >
                                <FiArrowLeft />
                                Convert to Timestamp
                            </motion.button>
                        </>
                    )}

                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <FiAlertCircle />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </div>

                {/* Results Section */}
                <div className="timestamp-results-section">
                    <div className="section-header">
                        <h3>
                            <FiCheckCircle /> Results
                        </h3>
                        {results && (
                            <button className="btn-clear-timestamp" onClick={handleClear}>
                                <FiRefreshCw /> Clear
                            </button>
                        )}
                    </div>

                    {!results ? (
                        <div className="empty-results">
                            {mode === "timestamp-to-date" ? <FiCalendar className="empty-icon" /> : <FiClock className="empty-icon" />}
                            <p>Results will appear here</p>
                            <small>
                                {mode === "timestamp-to-date"
                                    ? "Enter a timestamp and convert to see formatted dates"
                                    : "Select a date and convert to see Unix timestamp"}
                            </small>
                        </div>
                    ) : (
                        <div className="results-list">
                            <AnimatePresence>
                                {mode === "timestamp-to-date" ? (
                                    <>
                                        <ResultItem
                                            label="ISO 8601"
                                            value={results.iso8601}
                                            description="International standard format"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="RFC 2822"
                                            value={results.rfc2822}
                                            description="Email/HTTP header format"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="Local Time"
                                            value={results.local}
                                            description="Your local timezone"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="UTC"
                                            value={results.utc}
                                            description="Coordinated Universal Time"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="Relative Time"
                                            value={results.relativeTime}
                                            description="Human-readable difference"
                                            onCopy={handleCopy}
                                            copied={copied}
                                            highlight
                                        />

                                        <div className="result-breakdown">
                                            <h4>Date Breakdown</h4>
                                            <div className="breakdown-grid">
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Year:</span>
                                                    <span className="breakdown-value">{results.year}</span>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Month:</span>
                                                    <span className="breakdown-value">{results.month} ({results.monthName})</span>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Day:</span>
                                                    <span className="breakdown-value">{results.day} ({results.dayOfWeek})</span>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Hour:</span>
                                                    <span className="breakdown-value">{results.hours}</span>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Minute:</span>
                                                    <span className="breakdown-value">{results.minutes}</span>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Second:</span>
                                                    <span className="breakdown-value">{results.seconds}</span>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span className="breakdown-label">Timezone:</span>
                                                    <span className="breakdown-value">{results.timezone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ResultItem
                                            label="Seconds"
                                            value={results.seconds.toString()}
                                            description="Unix timestamp (10 digits)"
                                            onCopy={handleCopy}
                                            copied={copied}
                                            highlight
                                        />
                                        <ResultItem
                                            label="Milliseconds"
                                            value={results.milliseconds.toString()}
                                            description="JavaScript timestamp (13 digits)"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="ISO 8601"
                                            value={results.iso8601}
                                            description="International standard format"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="Local Time"
                                            value={results.local}
                                            description="Your local timezone"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                        <ResultItem
                                            label="UTC"
                                            value={results.utc}
                                            description="Coordinated Universal Time"
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            {!results && (
                <div className="timestamp-info-section">
                    <h3>About Unix Timestamps</h3>
                    <div className="info-grid">
                        <div className="info-card">
                            <h4>⏰ What is Unix Time?</h4>
                            <p>
                                Unix timestamp is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC
                                (the Unix epoch). It's a universal time representation used across systems.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔢 Seconds vs Milliseconds</h4>
                            <p>
                                Unix timestamps are typically 10 digits (seconds). JavaScript uses 13 digits (milliseconds).
                                Our tool supports both formats for maximum compatibility.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🌍 Timezone Independent</h4>
                            <p>
                                Unix timestamps represent a specific moment in time regardless of timezone.
                                The same timestamp displays differently in different timezones but refers to the same moment.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>💻 Common Uses</h4>
                            <p>
                                Used in databases, APIs, log files, authentication tokens, file systems, cache expiration,
                                and anywhere precise time tracking is needed.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>📅 Date Formats</h4>
                            <p>
                                ISO 8601 is the international standard. RFC 2822 is used in emails and HTTP headers.
                                Local time shows in your timezone. UTC is the universal reference.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔮 The Year 2038 Problem</h4>
                            <p>
                                32-bit systems can't represent dates after January 19, 2038, 03:14:07 UTC.
                                Modern 64-bit systems extend this to year 292 billion+.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Result Item Component
interface ResultItemProps {
    label: string;
    value: string;
    description: string;
    onCopy: (text: string, label: string) => void;
    copied: string | null;
    highlight?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ label, value, description, onCopy, copied, highlight }) => {
    return (
        <motion.div
            className={`result-item ${highlight ? "highlight" : ""}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
        >
            <div className="result-content">
                <div className="result-label">{label}</div>
                <div className="result-value">{value}</div>
                <div className="result-description">{description}</div>
            </div>
            <button
                className="btn-copy-result"
                onClick={() => onCopy(value, label)}
            >
                {copied === label ? <FiCheckCircle /> : <FiCopy />}
            </button>
        </motion.div>
    );
};

export default UnixTimestampTool;
