"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiCode,
    FiCopy,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiKey,
    FiLock,
    FiUnlock,
    FiClock,
    FiInfo,
    FiShield,
} from "react-icons/fi";

interface DecodedToken {
    header: any;
    payload: any;
    signature: string;
    isValid: boolean;
    isExpired: boolean;
    expiresAt?: string;
    issuedAt?: string;
    algorithm?: string;
}

const JwtDecoderTool = () => {
    const [jwtToken, setJwtToken] = useState<string>("");
    const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<"header" | "payload" | "signature">("payload");

    // Decode JWT automatically when input changes
    useEffect(() => {
        if (jwtToken.trim()) {
            decodeJWT(jwtToken);
        } else {
            setDecodedToken(null);
            setError(null);
        }
    }, [jwtToken]);

    // Base64 URL decode function
    const base64UrlDecode = (str: string): string => {
        try {
            // Replace URL-safe characters
            let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

            // Pad with '=' to make length multiple of 4
            const pad = base64.length % 4;
            if (pad) {
                if (pad === 1) {
                    throw new Error("Invalid base64 string");
                }
                base64 += new Array(5 - pad).join("=");
            }

            // Decode base64
            const decoded = atob(base64);

            // Convert to UTF-8
            return decodeURIComponent(
                decoded
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
        } catch (e) {
            throw new Error("Invalid base64 encoding");
        }
    };

    // Decode JWT token
    const decodeJWT = (token: string) => {
        try {
            setError(null);

            // Remove whitespace
            const cleanToken = token.trim();

            // Split token into parts
            const parts = cleanToken.split(".");

            if (parts.length !== 3) {
                throw new Error("Invalid JWT format. JWT should have 3 parts separated by dots.");
            }

            // Decode header
            const headerJson = base64UrlDecode(parts[0]);
            const header = JSON.parse(headerJson);

            // Decode payload
            const payloadJson = base64UrlDecode(parts[1]);
            const payload = JSON.parse(payloadJson);

            // Get signature
            const signature = parts[2];

            // Check expiration
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp ? payload.exp < now : false;

            // Format dates
            const expiresAt = payload.exp
                ? new Date(payload.exp * 1000).toLocaleString()
                : undefined;
            const issuedAt = payload.iat
                ? new Date(payload.iat * 1000).toLocaleString()
                : undefined;

            setDecodedToken({
                header,
                payload,
                signature,
                isValid: true,
                isExpired,
                expiresAt,
                issuedAt,
                algorithm: header.alg,
            });
        } catch (err: any) {
            setError(err.message || "Failed to decode JWT token");
            setDecodedToken(null);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [key]: true });
        setTimeout(() => {
            setCopied({ ...copied, [key]: false });
        }, 2000);
    };

    // Format JSON with syntax highlighting
    const formatJSON = (obj: any): string => {
        return JSON.stringify(obj, null, 2);
    };

    // Clear all
    const handleClear = () => {
        setJwtToken("");
        setDecodedToken(null);
        setError(null);
    };

    // Load sample JWT
    const loadSample = () => {
        const sampleJWT =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNjIzOTAyMiwiZXhwIjoxNzQ3Nzc1MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        setJwtToken(sampleJWT);
    };

    // Get time until expiration
    const getTimeUntilExpiration = (): string => {
        if (!decodedToken?.payload?.exp) return "No expiration";

        const now = Math.floor(Date.now() / 1000);
        const exp = decodedToken.payload.exp;
        const diff = exp - now;

        if (diff < 0) return "Expired";

        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle className="info-icon" />
                <p>
                    Decode and inspect JWT tokens instantly. View header, payload, signature, and check
                    expiration - all processed securely in your browser.
                </p>
            </div>

            {/* Input Section */}
            <div className="jwt-input-section">
                <div className="input-header">
                    <h3>
                        <FiKey /> Paste Your JWT Token
                    </h3>
                    <div className="input-actions">
                        <button className="btn-sample-jwt" onClick={loadSample}>
                            Load Sample
                        </button>
                        {jwtToken && (
                            <button className="btn-clear-jwt" onClick={handleClear}>
                                <FiRefreshCw /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <textarea
                    className="jwt-input-area"
                    placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                    rows={6}
                />

                <div className="jwt-info-hint">
                    <FiInfo />
                    <span>
                        Your JWT is decoded locally in your browser. No data is sent to any server.
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    className="jwt-error-box"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiAlertCircle />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Decoded Token Display */}
            <AnimatePresence>
                {decodedToken && (
                    <motion.div
                        className="jwt-decoded-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Token Status Cards */}
                        <div className="jwt-status-grid">
                            {/* Validity Status */}
                            <div className={`status-card ${decodedToken.isValid ? "valid" : "invalid"}`}>
                                <div className="status-icon">
                                    {decodedToken.isValid ? <FiCheckCircle /> : <FiAlertCircle />}
                                </div>
                                <div className="status-content">
                                    <div className="status-label">Token Status</div>
                                    <div className="status-value">
                                        {decodedToken.isValid ? "Valid Format" : "Invalid"}
                                    </div>
                                </div>
                            </div>

                            {/* Expiration Status */}
                            <div className={`status-card ${decodedToken.isExpired ? "expired" : "active"}`}>
                                <div className="status-icon">
                                    {decodedToken.isExpired ? <FiLock /> : <FiUnlock />}
                                </div>
                                <div className="status-content">
                                    <div className="status-label">Expiration</div>
                                    <div className="status-value">
                                        {decodedToken.isExpired ? "Expired" : getTimeUntilExpiration()}
                                    </div>
                                </div>
                            </div>

                            {/* Algorithm */}
                            <div className="status-card info">
                                <div className="status-icon">
                                    <FiShield />
                                </div>
                                <div className="status-content">
                                    <div className="status-label">Algorithm</div>
                                    <div className="status-value">{decodedToken.algorithm || "N/A"}</div>
                                </div>
                            </div>

                            {/* Issued At */}
                            {decodedToken.issuedAt && (
                                <div className="status-card info">
                                    <div className="status-icon">
                                        <FiClock />
                                    </div>
                                    <div className="status-content">
                                        <div className="status-label">Issued At</div>
                                        <div className="status-value">{decodedToken.issuedAt}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="jwt-tabs">
                            <button
                                className={`jwt-tab ${activeTab === "header" ? "active" : ""}`}
                                onClick={() => setActiveTab("header")}
                            >
                                <FiCode /> Header
                            </button>
                            <button
                                className={`jwt-tab ${activeTab === "payload" ? "active" : ""}`}
                                onClick={() => setActiveTab("payload")}
                            >
                                <FiKey /> Payload
                            </button>
                            <button
                                className={`jwt-tab ${activeTab === "signature" ? "active" : ""}`}
                                onClick={() => setActiveTab("signature")}
                            >
                                <FiLock /> Signature
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="jwt-tab-content">
                            {/* Header Tab */}
                            {activeTab === "header" && (
                                <motion.div
                                    className="jwt-section"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="section-header">
                                        <h4>Header (Algorithm & Token Type)</h4>
                                        <button
                                            className="btn-copy-section"
                                            onClick={() =>
                                                copyToClipboard(formatJSON(decodedToken.header), "header")
                                            }
                                        >
                                            {copied.header ? (
                                                <>
                                                    <FiCheckCircle /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <FiCopy /> Copy
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <pre className="json-display">
                                        <code>{formatJSON(decodedToken.header)}</code>
                                    </pre>

                                    <div className="field-descriptions">
                                        <div className="field-item">
                                            <strong>alg:</strong> Signing algorithm (e.g., HS256, RS256)
                                        </div>
                                        <div className="field-item">
                                            <strong>typ:</strong> Token type (typically "JWT")
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Payload Tab */}
                            {activeTab === "payload" && (
                                <motion.div
                                    className="jwt-section"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="section-header">
                                        <h4>Payload (Claims & Data)</h4>
                                        <button
                                            className="btn-copy-section"
                                            onClick={() =>
                                                copyToClipboard(formatJSON(decodedToken.payload), "payload")
                                            }
                                        >
                                            {copied.payload ? (
                                                <>
                                                    <FiCheckCircle /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <FiCopy /> Copy
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <pre className="json-display">
                                        <code>{formatJSON(decodedToken.payload)}</code>
                                    </pre>

                                    <div className="field-descriptions">
                                        <h5>Common Standard Claims:</h5>
                                        <div className="field-item">
                                            <strong>sub:</strong> Subject (user ID)
                                        </div>
                                        <div className="field-item">
                                            <strong>iat:</strong> Issued at (timestamp)
                                        </div>
                                        <div className="field-item">
                                            <strong>exp:</strong> Expiration time (timestamp)
                                        </div>
                                        <div className="field-item">
                                            <strong>iss:</strong> Issuer (who created the token)
                                        </div>
                                        <div className="field-item">
                                            <strong>aud:</strong> Audience (who should accept this token)
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Signature Tab */}
                            {activeTab === "signature" && (
                                <motion.div
                                    className="jwt-section"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="section-header">
                                        <h4>Signature (Verification)</h4>
                                        <button
                                            className="btn-copy-section"
                                            onClick={() => copyToClipboard(decodedToken.signature, "signature")}
                                        >
                                            {copied.signature ? (
                                                <>
                                                    <FiCheckCircle /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <FiCopy /> Copy
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="signature-display">
                                        <code>{decodedToken.signature}</code>
                                    </div>

                                    <div className="signature-info">
                                        <FiInfo />
                                        <div>
                                            <strong>About the Signature:</strong>
                                            <p>
                                                The signature is created by encoding the header and payload, then signing
                                                it with a secret key using the algorithm specified in the header. To verify
                                                this signature, you need the secret key (for HMAC algorithms) or the public
                                                key (for RSA/ECDSA algorithms).
                                            </p>
                                            <p className="warning">
                                                <FiAlertCircle />
                                                This tool only decodes the token. Signature verification requires the
                                                secret/public key and should be done server-side.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Token Parts Visualization */}
                        <div className="jwt-visualization">
                            <h4>JWT Token Structure</h4>
                            <div className="token-parts">
                                <div className="token-part header">
                                    <div className="part-label">Header</div>
                                    <div className="part-content">{jwtToken.split(".")[0]}</div>
                                </div>
                                <div className="token-separator">.</div>
                                <div className="token-part payload">
                                    <div className="part-label">Payload</div>
                                    <div className="part-content">{jwtToken.split(".")[1]}</div>
                                </div>
                                <div className="token-separator">.</div>
                                <div className="token-part signature">
                                    <div className="part-label">Signature</div>
                                    <div className="part-content">{jwtToken.split(".")[2]}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* How It Works */}
            {!decodedToken && !error && !jwtToken && (
                <div className="jwt-how-it-works">
                    <h3>What is JWT?</h3>
                    <p>
                        JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting
                        information between parties as a JSON object. JWTs are commonly used for
                        authentication and information exchange in web applications.
                    </p>

                    <div className="jwt-features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FiShield />
                            </div>
                            <h4>Secure</h4>
                            <p>Digitally signed using a secret or public/private key pair</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <FiCode />
                            </div>
                            <h4>Self-Contained</h4>
                            <p>Contains all necessary information about the user</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <FiKey />
                            </div>
                            <h4>Compact</h4>
                            <p>Can be sent through URL, POST parameter, or HTTP header</p>
                        </div>
                    </div>

                    <div className="jwt-use-cases">
                        <h4>Common Use Cases:</h4>
                        <ul>
                            <li>User authentication and authorization</li>
                            <li>Secure information exchange between services</li>
                            <li>Single Sign-On (SSO) implementations</li>
                            <li>API authentication and access control</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            <AnimatePresence>
                {Object.values(copied).some((v) => v) && (
                    <motion.div
                        className="success-toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <FiCheckCircle /> Copied to clipboard!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default JwtDecoderTool;