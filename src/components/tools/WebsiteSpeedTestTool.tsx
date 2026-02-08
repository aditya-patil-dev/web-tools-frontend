"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiZap,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiActivity,
    FiImage,
    FiCode,
    FiServer,
    FiGlobe,
    FiTrendingUp,
    FiRefreshCw
} from "react-icons/fi";
import { toolsApi } from "@/lib/api-calls/tools.api";

interface SpeedMetrics {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
    totalSize: number;
    requests: number;
    imageSize: number;
    scriptSize: number;
    styleSize: number;
    score: number;
    grade: string;
    recommendations: Recommendation[];
}

interface Recommendation {
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
}

const WebsiteSpeedTestTool = () => {
    const [url, setUrl] = useState("");
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<SpeedMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Google PageSpeed Insights API call
    const performSpeedTest = async (testUrl: string): Promise<SpeedMetrics> => {
        try {
            const response = await toolsApi.testWebsiteSpeed({ url: testUrl });
            return response;
        } catch (error: any) {
            // Handle specific error messages
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error("Failed to test website speed. Please try again.");
        }
    };

    const handleTest = async () => {
        if (!url.trim()) {
            toast.error("Please enter a URL", "URL Required");
            return;
        }

        // Validate URL
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            toast.error("Please enter a valid URL", "Invalid URL");
            return;
        }

        setTesting(true);
        setError(null);
        setResults(null);
        toast.info("Testing website speed...", "Processing");

        try {
            const metrics = await performSpeedTest(url);
            setResults(metrics);
            toast.success("Speed test completed!", "Success");
        } catch (err: any) {
            setError(err.message || "Failed to test website speed");
            toast.error("Speed test failed", "Error");
        } finally {
            setTesting(false);
        }
    };

    const formatTime = (ms: number): string => {
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatSize = (kb: number): string => {
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    const getScoreColor = (score: number): string => {
        if (score >= 90) return "#10b981";
        if (score >= 70) return "#f59e0b";
        return "#ef4444";
    };

    const getMetricStatus = (value: number, good: number, bad: number): "good" | "warning" | "poor" => {
        if (value <= good) return "good";
        if (value <= bad) return "warning";
        return "poor";
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
                    Test your website's loading speed and get actionable recommendations to improve performance and SEO rankings.
                </p>
            </div>

            {/* URL Input Section */}
            <div className="speed-test-input-section">
                <div className="input-wrapper">
                    <FiGlobe className="input-icon" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                        placeholder="Enter website URL (e.g., example.com)"
                        className="speed-url-input"
                        disabled={testing}
                    />
                </div>
                <motion.button
                    className="btn-test-speed"
                    onClick={handleTest}
                    disabled={testing || !url.trim()}
                    whileHover={{ scale: testing ? 1 : 1.02 }}
                    whileTap={{ scale: testing ? 1 : 0.98 }}
                >
                    {testing ? (
                        <>
                            <span className="spinner" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <FiZap />
                            Test Speed
                        </>
                    )}
                </motion.button>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    className="error-message-box"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiAlertCircle />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Results Section */}
            <AnimatePresence>
                {results && (
                    <motion.div
                        className="speed-results-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {/* Overall Score */}
                        <div className="score-section">
                            <div className="score-circle-container">
                                <svg className="score-circle" viewBox="0 0 200 200">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="20"
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        fill="none"
                                        stroke={getScoreColor(results.score)}
                                        strokeWidth="20"
                                        strokeDasharray={`${(results.score / 100) * 565.48} 565.48`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 100 100)"
                                    />
                                </svg>
                                <div className="score-text">
                                    <div className="score-value">{Math.round(results.score)}</div>
                                    <div className="score-grade">{results.grade}</div>
                                </div>
                            </div>
                            <div className="score-info">
                                <h3>Performance Score</h3>
                                <p>Your website performance rating based on key metrics</p>
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="metrics-grid">
                            <div className={`metric-card ${getMetricStatus(results.loadTime, 1500, 3000)}`}>
                                <div className="metric-icon">
                                    <FiClock />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Page Load Time</div>
                                    <div className="metric-value">{formatTime(results.loadTime)}</div>
                                    <div className="metric-hint">Target: &lt; 2s</div>
                                </div>
                            </div>

                            <div className={`metric-card ${getMetricStatus(results.firstContentfulPaint, 1000, 2000)}`}>
                                <div className="metric-icon">
                                    <FiActivity />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">First Contentful Paint</div>
                                    <div className="metric-value">{formatTime(results.firstContentfulPaint)}</div>
                                    <div className="metric-hint">Target: &lt; 1.8s</div>
                                </div>
                            </div>

                            <div className={`metric-card ${getMetricStatus(results.timeToInteractive, 2500, 4000)}`}>
                                <div className="metric-icon">
                                    <FiTrendingUp />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Time to Interactive</div>
                                    <div className="metric-value">{formatTime(results.timeToInteractive)}</div>
                                    <div className="metric-hint">Target: &lt; 3.8s</div>
                                </div>
                            </div>

                            <div className={`metric-card ${getMetricStatus(results.totalSize, 1000, 2000)}`}>
                                <div className="metric-icon">
                                    <FiServer />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Total Page Size</div>
                                    <div className="metric-value">{formatSize(results.totalSize)}</div>
                                    <div className="metric-hint">Target: &lt; 1 MB</div>
                                </div>
                            </div>

                            <div className={`metric-card ${getMetricStatus(results.requests, 30, 50)}`}>
                                <div className="metric-icon">
                                    <FiGlobe />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">HTTP Requests</div>
                                    <div className="metric-value">{results.requests}</div>
                                    <div className="metric-hint">Target: &lt; 50</div>
                                </div>
                            </div>
                        </div>

                        {/* Resource Breakdown */}
                        <div className="resource-breakdown">
                            <h3>Resource Breakdown</h3>
                            <div className="resource-bars">
                                <div className="resource-item">
                                    <div className="resource-label">
                                        <FiImage />
                                        <span>Images</span>
                                        <span className="resource-size">{formatSize(results.imageSize)}</span>
                                    </div>
                                    <div className="resource-bar">
                                        <div
                                            className="resource-fill images"
                                            style={{ width: `${(results.imageSize / results.totalSize) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="resource-item">
                                    <div className="resource-label">
                                        <FiCode />
                                        <span>JavaScript</span>
                                        <span className="resource-size">{formatSize(results.scriptSize)}</span>
                                    </div>
                                    <div className="resource-bar">
                                        <div
                                            className="resource-fill scripts"
                                            style={{ width: `${(results.scriptSize / results.totalSize) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="resource-item">
                                    <div className="resource-label">
                                        <FiCode />
                                        <span>CSS</span>
                                        <span className="resource-size">{formatSize(results.styleSize)}</span>
                                    </div>
                                    <div className="resource-bar">
                                        <div
                                            className="resource-fill styles"
                                            style={{ width: `${(results.styleSize / results.totalSize) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="recommendations-section">
                            <h3>
                                <FiZap /> Recommendations
                            </h3>
                            <div className="recommendations-list">
                                {results.recommendations.map((rec, index) => (
                                    <motion.div
                                        key={index}
                                        className={`recommendation-item ${rec.severity}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="rec-icon">
                                            {rec.severity === "critical" && <FiAlertCircle />}
                                            {rec.severity === "warning" && <FiAlertCircle />}
                                            {rec.severity === "info" && <FiCheckCircle />}
                                        </div>
                                        <div className="rec-content">
                                            <h4>{rec.title}</h4>
                                            <p>{rec.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Test Again Button */}
                        <div className="test-again-section">
                            <button className="btn-test-again" onClick={handleTest}>
                                <FiRefreshCw />
                                Test Again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* How It Works */}
            {!results && !testing && (
                <div className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Enter URL</h4>
                            <p>Type your website URL</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Analyze</h4>
                            <p>We test loading speed & metrics</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Get Results</h4>
                            <p>Receive detailed performance report</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Optimize</h4>
                            <p>Follow recommendations to improve</p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default WebsiteSpeedTestTool;