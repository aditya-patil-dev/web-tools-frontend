"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiLock,
    FiCopy,
    FiCheckCircle,
    FiType,
    FiRefreshCw,
    FiEye,
    FiEyeOff,
    FiAlertCircle,
    FiShield
} from "react-icons/fi";
import CryptoJS from "crypto-js";

type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512" | "sha3";

interface HashResult {
    algorithm: string;
    hash: string;
    length: number;
    uppercase: string;
}

const HashGeneratorTool = () => {
    const [inputText, setInputText] = useState("");
    const [selectedAlgorithms, setSelectedAlgorithms] = useState<HashAlgorithm[]>([
        "md5",
        "sha1",
        "sha256",
        "sha512"
    ]);
    const [hashResults, setHashResults] = useState<HashResult[]>([]);
    const [showInput, setShowInput] = useState(true);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const [hmacKey, setHmacKey] = useState("");
    const [useHMAC, setUseHMAC] = useState(false);

    const algorithms = [
        {
            id: "md5" as HashAlgorithm,
            name: "MD5",
            description: "128-bit hash (Not secure)",
            icon: "🔴",
            secure: false
        },
        {
            id: "sha1" as HashAlgorithm,
            name: "SHA-1",
            description: "160-bit hash (Deprecated)",
            icon: "🟡",
            secure: false
        },
        {
            id: "sha256" as HashAlgorithm,
            name: "SHA-256",
            description: "256-bit hash (Secure)",
            icon: "🟢",
            secure: true
        },
        {
            id: "sha512" as HashAlgorithm,
            name: "SHA-512",
            description: "512-bit hash (Very Secure)",
            icon: "🟢",
            secure: true
        },
        {
            id: "sha3" as HashAlgorithm,
            name: "SHA-3",
            description: "Latest SHA standard",
            icon: "🔵",
            secure: true
        }
    ];

    // Generate hashes
    const generateHashes = () => {
        if (!inputText.trim()) {
            setHashResults([]);
            return;
        }

        const results: HashResult[] = [];

        selectedAlgorithms.forEach((algorithm) => {
            let hash: any;

            try {
                if (useHMAC && hmacKey) {
                    // Generate HMAC
                    switch (algorithm) {
                        case "md5":
                            hash = CryptoJS.HmacMD5(inputText, hmacKey);
                            break;
                        case "sha1":
                            hash = CryptoJS.HmacSHA1(inputText, hmacKey);
                            break;
                        case "sha256":
                            hash = CryptoJS.HmacSHA256(inputText, hmacKey);
                            break;
                        case "sha512":
                            hash = CryptoJS.HmacSHA512(inputText, hmacKey);
                            break;
                        case "sha3":
                            hash = CryptoJS.HmacSHA3(inputText, hmacKey);
                            break;
                    }
                } else {
                    // Generate regular hash
                    switch (algorithm) {
                        case "md5":
                            hash = CryptoJS.MD5(inputText);
                            break;
                        case "sha1":
                            hash = CryptoJS.SHA1(inputText);
                            break;
                        case "sha256":
                            hash = CryptoJS.SHA256(inputText);
                            break;
                        case "sha512":
                            hash = CryptoJS.SHA512(inputText);
                            break;
                        case "sha3":
                            hash = CryptoJS.SHA3(inputText);
                            break;
                    }
                }

                const hashString = hash.toString(CryptoJS.enc.Hex);

                results.push({
                    algorithm: algorithm.toUpperCase(),
                    hash: hashString,
                    length: hashString.length,
                    uppercase: hashString.toUpperCase()
                });
            } catch (error) {
                console.error(`Error generating ${algorithm}:`, error);
            }
        });

        setHashResults(results);
    };

    // Auto-generate on input change
    useEffect(() => {
        generateHashes();
    }, [inputText, selectedAlgorithms, useHMAC, hmacKey]);

    // Toggle algorithm selection
    const toggleAlgorithm = (algorithm: HashAlgorithm) => {
        if (selectedAlgorithms.includes(algorithm)) {
            setSelectedAlgorithms(selectedAlgorithms.filter(a => a !== algorithm));
        } else {
            setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
        }
    };

    // Copy to clipboard
    const handleCopy = async (hash: string, algorithm: string) => {
        try {
            await navigator.clipboard.writeText(hash);
            setCopiedHash(algorithm);
            toast.success(`${algorithm} hash copied!`, "Copied");
            setTimeout(() => setCopiedHash(null), 2000);
        } catch (err) {
            toast.error("Failed to copy to clipboard", "Error");
        }
    };

    // Clear all
    const handleClear = () => {
        setInputText("");
        setHmacKey("");
        setHashResults([]);
        toast.info("Cleared", "Reset");
    };

    // Load sample text
    const loadSample = () => {
        setInputText("Hello, World! This is a sample text for hash generation.");
        toast.success("Sample text loaded", "Success");
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
                    Generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-512, and SHA-3 algorithms.
                    Perfect for password verification, data integrity, and security applications.
                </p>
            </div>

            {/* Security Warning */}
            <div className="hash-warning-box">
                <FiAlertCircle />
                <div className="warning-content">
                    <strong>Security Notice:</strong> MD5 and SHA-1 are cryptographically broken and should not be used for security-critical applications. Use SHA-256 or SHA-512 instead.
                </div>
            </div>

            <div className="hash-workspace">
                {/* Left Panel - Input */}
                <div className="hash-input-panel">
                    {/* Controls */}
                    <div className="hash-controls">
                        <div className="controls-left">
                            <button
                                className="btn-toggle-input"
                                onClick={() => setShowInput(!showInput)}
                            >
                                {showInput ? <FiEyeOff /> : <FiEye />}
                                {showInput ? "Hide" : "Show"} Input
                            </button>
                        </div>
                        <div className="controls-right">
                            <button className="btn-sample-hash" onClick={loadSample}>
                                Load Sample
                            </button>
                            {inputText && (
                                <button className="btn-clear-hash" onClick={handleClear}>
                                    <FiRefreshCw /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="input-section">
                        <div className="section-header">
                            <h3>
                                <FiType /> Input Text
                            </h3>
                            {inputText && (
                                <span className="char-count">
                                    {inputText.length} characters
                                </span>
                            )}
                        </div>

                        <textarea
                            className={`hash-input-area ${!showInput ? "obscured" : ""}`}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text to generate hash..."
                            rows={8}
                            spellCheck={false}
                        />
                    </div>

                    {/* HMAC Section */}
                    <div className="hmac-section">
                        <label className="hmac-toggle">
                            <input
                                type="checkbox"
                                checked={useHMAC}
                                onChange={(e) => setUseHMAC(e.target.checked)}
                            />
                            <span>
                                <FiShield /> Use HMAC (Hash-based Message Authentication)
                            </span>
                        </label>

                        <AnimatePresence>
                            {useHMAC && (
                                <motion.div
                                    className="hmac-key-input"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <input
                                        type="text"
                                        value={hmacKey}
                                        onChange={(e) => setHmacKey(e.target.value)}
                                        placeholder="Enter secret key for HMAC..."
                                        className="hmac-key-field"
                                    />
                                    <small className="hmac-hint">
                                        HMAC adds a secret key to the hash for authentication
                                    </small>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Algorithm Selection */}
                    <div className="algorithm-section">
                        <h3>
                            <FiLock /> Select Hash Algorithms
                        </h3>
                        <div className="algorithm-grid">
                            {algorithms.map((algo) => (
                                <button
                                    key={algo.id}
                                    className={`algorithm-btn ${selectedAlgorithms.includes(algo.id) ? "active" : ""} ${!algo.secure ? "insecure" : ""}`}
                                    onClick={() => toggleAlgorithm(algo.id)}
                                >
                                    <span className="algo-icon">{algo.icon}</span>
                                    <div className="algo-info">
                                        <div className="algo-name">{algo.name}</div>
                                        <div className="algo-desc">{algo.description}</div>
                                    </div>
                                    {selectedAlgorithms.includes(algo.id) && (
                                        <FiCheckCircle className="algo-check" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Results */}
                <div className="hash-results-panel">
                    <div className="results-header">
                        <h3>
                            <FiLock /> Generated Hashes
                        </h3>
                        {hashResults.length > 0 && (
                            <span className="results-count">
                                {hashResults.length} hash{hashResults.length !== 1 ? "es" : ""}
                            </span>
                        )}
                    </div>

                    {!inputText ? (
                        <div className="empty-results">
                            <FiType className="empty-icon" />
                            <p>Enter text to generate hashes</p>
                            <small>Select algorithms and type in the input field</small>
                        </div>
                    ) : hashResults.length === 0 ? (
                        <div className="empty-results">
                            <FiLock className="empty-icon" />
                            <p>No algorithms selected</p>
                            <small>Select at least one hash algorithm</small>
                        </div>
                    ) : (
                        <div className="hash-results-list">
                            <AnimatePresence>
                                {hashResults.map((result, index) => (
                                    <motion.div
                                        key={result.algorithm}
                                        className="hash-result-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="result-header">
                                            <div className="result-algorithm">
                                                {result.algorithm}
                                                {useHMAC && (
                                                    <span className="hmac-badge">HMAC</span>
                                                )}
                                            </div>
                                            <div className="result-length">
                                                {result.length} chars
                                            </div>
                                        </div>

                                        <div className="result-hash-container">
                                            <code className="result-hash">
                                                {result.hash}
                                            </code>
                                        </div>

                                        <div className="result-actions">
                                            <button
                                                className="btn-copy-hash"
                                                onClick={() => handleCopy(result.hash, result.algorithm)}
                                            >
                                                {copiedHash === result.algorithm ? (
                                                    <>
                                                        <FiCheckCircle /> Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiCopy /> Copy Lowercase
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                className="btn-copy-hash secondary"
                                                onClick={() => handleCopy(result.uppercase, result.algorithm)}
                                            >
                                                <FiCopy /> Copy Uppercase
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            {!inputText && (
                <div className="hash-info-section">
                    <h3>About Hash Functions</h3>
                    <div className="info-grid">
                        <div className="info-card">
                            <h4>🔴 MD5</h4>
                            <p>
                                128-bit hash function. <strong>Cryptographically broken.</strong> Only use for checksums, not security.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🟡 SHA-1</h4>
                            <p>
                                160-bit hash function. <strong>Deprecated for security.</strong> Being phased out in most applications.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🟢 SHA-256</h4>
                            <p>
                                256-bit hash function. <strong>Industry standard.</strong> Widely used for passwords and certificates.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🟢 SHA-512</h4>
                            <p>
                                512-bit hash function. <strong>Maximum security.</strong> Best for highly sensitive data.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔵 SHA-3</h4>
                            <p>
                                Latest SHA standard. <strong>Future-proof.</strong> Different design from SHA-2 family.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🛡️ HMAC</h4>
                            <p>
                                Hash with secret key. <strong>Message authentication.</strong> Proves data integrity and origin.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default HashGeneratorTool;