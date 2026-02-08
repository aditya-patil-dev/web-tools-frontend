"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiType,
    FiCopy,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiDownload,
} from "react-icons/fi";

interface TextStats {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    lines: number;
    readingTime: number;
    speakingTime: number;
}

type CaseType =
    | "uppercase"
    | "lowercase"
    | "sentence"
    | "title"
    | "camel"
    | "pascal"
    | "snake"
    | "kebab";

const CaseConTool = () => {
    const [inputText, setInputText] = useState<string>("");
    const [convertedText, setConvertedText] = useState<string>("");
    const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
    const [copied, setCopied] = useState(false);
    const [showStats, setShowStats] = useState(true);

    // Calculate text statistics
    const stats = useMemo((): TextStats => {
        if (!inputText.trim()) {
            return {
                characters: 0,
                charactersNoSpaces: 0,
                words: 0,
                sentences: 0,
                paragraphs: 0,
                lines: 0,
                readingTime: 0,
                speakingTime: 0,
            };
        }

        const text = inputText;

        // Characters
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, "").length;

        // Words - split by whitespace and filter empty strings
        const words = text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;

        // Sentences - split by .!? followed by space or end of string
        const sentences = text
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0).length;

        // Paragraphs - split by double newlines
        const paragraphs = text
            .split(/\n\s*\n/)
            .filter((p) => p.trim().length > 0).length;

        // Lines - split by single newlines
        const lines = text.split(/\n/).filter((l) => l.trim().length > 0).length;

        // Reading time - average 200 words per minute
        const readingTime = Math.ceil(words / 200);

        // Speaking time - average 150 words per minute
        const speakingTime = Math.ceil(words / 150);

        return {
            characters,
            charactersNoSpaces,
            words,
            sentences,
            paragraphs,
            lines,
            readingTime,
            speakingTime,
        };
    }, [inputText]);

    // Case conversion functions
    const convertCase = (text: string, caseType: CaseType): string => {
        if (!text) return "";

        switch (caseType) {
            case "uppercase":
                return text.toUpperCase();

            case "lowercase":
                return text.toLowerCase();

            case "sentence":
                return text
                    .toLowerCase()
                    .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());

            case "title":
                return text
                    .toLowerCase()
                    .replace(/\b\w/g, (match) => match.toUpperCase());

            case "camel":
                return text
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                    .replace(/^[A-Z]/, (match) => match.toLowerCase());

            case "pascal":
                return text
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                    .replace(/^[a-z]/, (match) => match.toUpperCase());

            case "snake":
                return text
                    .replace(/[^a-zA-Z0-9]+/g, "_")
                    .replace(/([A-Z])/g, "_$1")
                    .toLowerCase()
                    .replace(/^_/, "");

            case "kebab":
                return text
                    .replace(/[^a-zA-Z0-9]+/g, "-")
                    .replace(/([A-Z])/g, "-$1")
                    .toLowerCase()
                    .replace(/^-/, "");

            default:
                return text;
        }
    };

    // Handle case conversion
    const handleCaseConversion = (caseType: CaseType) => {
        if (!inputText.trim()) return;

        setSelectedCase(caseType);
        const converted = convertCase(inputText, caseType);
        setConvertedText(converted);
    };

    // Copy to clipboard
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Download as text file
    const handleDownload = () => {
        const textToDownload = convertedText || inputText;
        const blob = new Blob([textToDownload], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `text-${selectedCase || "original"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Clear all
    const handleClear = () => {
        setInputText("");
        setConvertedText("");
        setSelectedCase(null);
        setCopied(false);
    };

    const caseOptions = [
        {
            type: "uppercase" as CaseType,
            label: "UPPERCASE",
            example: "HELLO WORLD",
            icon: "↑",
        },
        {
            type: "lowercase" as CaseType,
            label: "lowercase",
            example: "hello world",
            icon: "↓",
        },
        {
            type: "sentence" as CaseType,
            label: "Sentence case",
            example: "Hello world. This is a sentence.",
            icon: "S",
        },
        {
            type: "title" as CaseType,
            label: "Title Case",
            example: "Hello World",
            icon: "T",
        },
        {
            type: "camel" as CaseType,
            label: "camelCase",
            example: "helloWorld",
            icon: "🐫",
        },
        {
            type: "pascal" as CaseType,
            label: "PascalCase",
            example: "HelloWorld",
            icon: "P",
        },
        {
            type: "snake" as CaseType,
            label: "snake_case",
            example: "hello_world",
            icon: "🐍",
        },
        {
            type: "kebab" as CaseType,
            label: "kebab-case",
            example: "hello-world",
            icon: "�串",
        },
    ];

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
                    Count words, characters, and transform text case instantly. Perfect
                    for writers, developers, and content creators.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="text-tool-workspace">
                {/* Left Side - Input & Stats */}
                <div className="text-input-section">
                    <div className="section-header">
                        <h3>
                            <FiType /> Enter Your Text
                        </h3>
                        {inputText && (
                            <button className="btn-clear-text" onClick={handleClear}>
                                <FiRefreshCw /> Clear
                            </button>
                        )}
                    </div>

                    <textarea
                        className="text-input-area"
                        placeholder="Type or paste your text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={12}
                    />

                    {/* Statistics Cards */}
                    <AnimatePresence>
                        {inputText && showStats && (
                            <motion.div
                                className="text-stats-grid"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="stat-card primary">
                                    <div className="stat-value">{stats.words.toLocaleString()}</div>
                                    <div className="stat-label">Words</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">
                                        {stats.characters.toLocaleString()}
                                    </div>
                                    <div className="stat-label">Characters</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">
                                        {stats.charactersNoSpaces.toLocaleString()}
                                    </div>
                                    <div className="stat-label">Characters (no spaces)</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">
                                        {stats.sentences.toLocaleString()}
                                    </div>
                                    <div className="stat-label">Sentences</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">
                                        {stats.paragraphs.toLocaleString()}
                                    </div>
                                    <div className="stat-label">Paragraphs</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">
                                        {stats.lines.toLocaleString()}
                                    </div>
                                    <div className="stat-label">Lines</div>
                                </div>

                                <div className="stat-card accent">
                                    <div className="stat-value">
                                        {stats.readingTime > 0 ? `~${stats.readingTime}` : "<1"}
                                    </div>
                                    <div className="stat-label">Min read</div>
                                </div>

                                <div className="stat-card accent">
                                    <div className="stat-value">
                                        {stats.speakingTime > 0 ? `~${stats.speakingTime}` : "<1"}
                                    </div>
                                    <div className="stat-label">Min speak</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side - Case Converter */}
                <div className="case-converter-section">
                    <div className="section-header">
                        <h3>Case Converter</h3>
                    </div>

                    {!inputText ? (
                        <div className="empty-state">
                            <FiAlertCircle className="empty-icon" />
                            <p>Enter text on the left to convert case</p>
                        </div>
                    ) : (
                        <>
                            {/* Case Options Grid */}
                            <div className="case-options-grid">
                                {caseOptions.map((option) => (
                                    <motion.button
                                        key={option.type}
                                        className={`case-option-btn ${selectedCase === option.type ? "active" : ""
                                            }`}
                                        onClick={() => handleCaseConversion(option.type)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="case-icon">{option.icon}</span>
                                        <div className="case-info">
                                            <div className="case-label">{option.label}</div>
                                            <div className="case-example">{option.example}</div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Converted Text Output */}
                            <AnimatePresence>
                                {convertedText && (
                                    <motion.div
                                        className="converted-output-section"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                    >
                                        <div className="output-header">
                                            <h4>Converted Text ({selectedCase})</h4>
                                            <div className="output-actions">
                                                <motion.button
                                                    className="btn-copy-output"
                                                    onClick={() => handleCopy(convertedText)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {copied ? (
                                                        <>
                                                            <FiCheckCircle /> Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiCopy /> Copy
                                                        </>
                                                    )}
                                                </motion.button>

                                                <motion.button
                                                    className="btn-download-output"
                                                    onClick={handleDownload}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FiDownload /> Download
                                                </motion.button>
                                            </div>
                                        </div>

                                        <div className="converted-text-display">{convertedText}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CaseConTool;
