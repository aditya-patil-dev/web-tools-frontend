// src/components/tools/RobotsTxtGeneratorTool.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCode,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiTrash2,
  FiInfo,
  FiGlobe,
  FiShield,
} from "react-icons/fi";

interface UserAgent {
  id: string;
  name: string;
  disallow: string[];
  allow: string[];
}

interface RobotsTxtConfig {
  userAgents: UserAgent[];
  sitemap: string[];
  crawlDelay: number | null;
  host: string;
}

const RobotsTxtGeneratorTool = () => {
  const [config, setConfig] = useState<RobotsTxtConfig>({
    userAgents: [
      {
        id: "1",
        name: "*",
        disallow: [],
        allow: [],
      },
    ],
    sitemap: [],
    crawlDelay: null,
    host: "",
  });

  const [newDisallow, setNewDisallow] = useState<{ [key: string]: string }>({});
  const [newAllow, setNewAllow] = useState<{ [key: string]: string }>({});
  const [newSitemap, setNewSitemap] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "code" | "help">("builder");

  // Common crawlers
  const commonCrawlers = [
    { value: "*", label: "All Crawlers (*)" },
    { value: "Googlebot", label: "Google (Googlebot)" },
    { value: "Bingbot", label: "Bing (Bingbot)" },
    { value: "Slurp", label: "Yahoo (Slurp)" },
    { value: "DuckDuckBot", label: "DuckDuckGo (DuckDuckBot)" },
    { value: "Baiduspider", label: "Baidu (Baiduspider)" },
    { value: "YandexBot", label: "Yandex (YandexBot)" },
    { value: "facebookexternalhit", label: "Facebook" },
    { value: "Twitterbot", label: "Twitter" },
    { value: "LinkedInBot", label: "LinkedIn" },
    { value: "ia_archiver", label: "Alexa" },
  ];

  // Common paths to block
  const commonPaths = [
    "/admin/",
    "/private/",
    "/temp/",
    "/tmp/",
    "/cgi-bin/",
    "/wp-admin/",
    "/wp-includes/",
    "/search/",
    "/cart/",
    "/checkout/",
  ];

  // Add new user agent
  const addUserAgent = () => {
    const newId = (config.userAgents.length + 1).toString();
    setConfig({
      ...config,
      userAgents: [
        ...config.userAgents,
        {
          id: newId,
          name: "*",
          disallow: [],
          allow: [],
        },
      ],
    });
  };

  // Remove user agent
  const removeUserAgent = (id: string) => {
    if (config.userAgents.length === 1) return; // Keep at least one
    setConfig({
      ...config,
      userAgents: config.userAgents.filter((ua) => ua.id !== id),
    });
  };

  // Update user agent name
  const updateUserAgentName = (id: string, name: string) => {
    setConfig({
      ...config,
      userAgents: config.userAgents.map((ua) =>
        ua.id === id ? { ...ua, name } : ua
      ),
    });
  };

  // Add disallow rule
  const addDisallow = (id: string) => {
    const path = newDisallow[id]?.trim();
    if (!path) return;

    setConfig({
      ...config,
      userAgents: config.userAgents.map((ua) =>
        ua.id === id ? { ...ua, disallow: [...ua.disallow, path] } : ua
      ),
    });
    setNewDisallow({ ...newDisallow, [id]: "" });
  };

  // Remove disallow rule
  const removeDisallow = (id: string, index: number) => {
    setConfig({
      ...config,
      userAgents: config.userAgents.map((ua) =>
        ua.id === id
          ? { ...ua, disallow: ua.disallow.filter((_, i) => i !== index) }
          : ua
      ),
    });
  };

  // Add allow rule
  const addAllow = (id: string) => {
    const path = newAllow[id]?.trim();
    if (!path) return;

    setConfig({
      ...config,
      userAgents: config.userAgents.map((ua) =>
        ua.id === id ? { ...ua, allow: [...ua.allow, path] } : ua
      ),
    });
    setNewAllow({ ...newAllow, [id]: "" });
  };

  // Remove allow rule
  const removeAllow = (id: string, index: number) => {
    setConfig({
      ...config,
      userAgents: config.userAgents.map((ua) =>
        ua.id === id ? { ...ua, allow: ua.allow.filter((_, i) => i !== index) } : ua
      ),
    });
  };

  // Add common path to disallow
  const addCommonPath = (id: string, path: string) => {
    const userAgent = config.userAgents.find((ua) => ua.id === id);
    if (!userAgent || userAgent.disallow.includes(path)) return;

    setConfig({
      ...config,
      userAgents: config.userAgents.map((ua) =>
        ua.id === id ? { ...ua, disallow: [...ua.disallow, path] } : ua
      ),
    });
  };

  // Add sitemap
  const addSitemap = () => {
    const url = newSitemap.trim();
    if (!url || config.sitemap.includes(url)) return;

    setConfig({
      ...config,
      sitemap: [...config.sitemap, url],
    });
    setNewSitemap("");
  };

  // Remove sitemap
  const removeSitemap = (index: number) => {
    setConfig({
      ...config,
      sitemap: config.sitemap.filter((_, i) => i !== index),
    });
  };

  // Update crawl delay
  const updateCrawlDelay = (value: string) => {
    const delay = value === "" ? null : parseInt(value);
    setConfig({
      ...config,
      crawlDelay: delay,
    });
  };

  // Update host
  const updateHost = (value: string) => {
    setConfig({
      ...config,
      host: value,
    });
  };

  // Generate robots.txt content
  const generateRobotsTxt = (): string => {
    let content = "# robots.txt generated by Robots.txt Generator\n";
    content += "# https://yourdomain.com/tools/seo-tools/robots-txt-generator\n\n";

    // User agents
    config.userAgents.forEach((ua) => {
      content += `User-agent: ${ua.name}\n`;

      // Disallow rules
      if (ua.disallow.length > 0) {
        ua.disallow.forEach((path) => {
          content += `Disallow: ${path}\n`;
        });
      } else {
        content += `Disallow:\n`; // Allow all
      }

      // Allow rules
      ua.allow.forEach((path) => {
        content += `Allow: ${path}\n`;
      });

      content += "\n";
    });

    // Crawl delay
    if (config.crawlDelay !== null && config.crawlDelay > 0) {
      content += `Crawl-delay: ${config.crawlDelay}\n\n`;
    }

    // Host
    if (config.host.trim()) {
      content += `Host: ${config.host.trim()}\n\n`;
    }

    // Sitemaps
    if (config.sitemap.length > 0) {
      config.sitemap.forEach((url) => {
        content += `Sitemap: ${url}\n`;
      });
    }

    return content.trim();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const content = generateRobotsTxt();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download robots.txt file
  const downloadRobotsTxt = () => {
    const content = generateRobotsTxt();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load preset configurations
  const loadPreset = (preset: "allow-all" | "block-all" | "standard") => {
    switch (preset) {
      case "allow-all":
        setConfig({
          userAgents: [
            {
              id: "1",
              name: "*",
              disallow: [],
              allow: [],
            },
          ],
          sitemap: [],
          crawlDelay: null,
          host: "",
        });
        break;

      case "block-all":
        setConfig({
          userAgents: [
            {
              id: "1",
              name: "*",
              disallow: ["/"],
              allow: [],
            },
          ],
          sitemap: [],
          crawlDelay: null,
          host: "",
        });
        break;

      case "standard":
        setConfig({
          userAgents: [
            {
              id: "1",
              name: "*",
              disallow: ["/admin/", "/private/", "/temp/"],
              allow: [],
            },
          ],
          sitemap: ["https://www.example.com/sitemap.xml"],
          crawlDelay: null,
          host: "",
        });
        break;
    }
  };

  // Clear all
  const handleClear = () => {
    setConfig({
      userAgents: [
        {
          id: "1",
          name: "*",
          disallow: [],
          allow: [],
        },
      ],
      sitemap: [],
      crawlDelay: null,
      host: "",
    });
    setNewDisallow({});
    setNewAllow({});
    setNewSitemap("");
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
          Generate a professional robots.txt file to control search engine crawlers and improve
          your website's SEO.
        </p>
      </div>

      {/* Top Controls */}
      <div className="robots-top-controls">
        <div className="preset-buttons">
          <button className="btn-preset" onClick={() => loadPreset("allow-all")}>
            <FiGlobe /> Allow All
          </button>
          <button className="btn-preset" onClick={() => loadPreset("block-all")}>
            <FiShield /> Block All
          </button>
          <button className="btn-preset" onClick={() => loadPreset("standard")}>
            <FiCheckCircle /> Standard Setup
          </button>
        </div>

        <button className="btn-clear-robots" onClick={handleClear}>
          <FiRefreshCw /> Clear All
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="robots-tabs">
        <button
          className={`robots-tab ${activeTab === "builder" ? "active" : ""}`}
          onClick={() => setActiveTab("builder")}
        >
          <FiCode /> Builder
        </button>
        <button
          className={`robots-tab ${activeTab === "code" ? "active" : ""}`}
          onClick={() => setActiveTab("code")}
        >
          <FiGlobe /> Preview
        </button>
        <button
          className={`robots-tab ${activeTab === "help" ? "active" : ""}`}
          onClick={() => setActiveTab("help")}
        >
          <FiInfo /> Help
        </button>
      </div>

      {/* Tab Content */}
      <div className="robots-content">
        {/* Builder Tab */}
        {activeTab === "builder" && (
          <motion.div
            className="builder-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* User Agents Section */}
            <div className="robots-section">
              <div className="section-header">
                <h3>User Agents & Rules</h3>
                <button className="btn-add" onClick={addUserAgent}>
                  <FiPlus /> Add User Agent
                </button>
              </div>

              {config.userAgents.map((userAgent, uaIndex) => (
                <div key={userAgent.id} className="user-agent-card">
                  <div className="user-agent-header">
                    <div className="user-agent-select-group">
                      <label>User-agent:</label>
                      <select
                        value={userAgent.name}
                        onChange={(e) => updateUserAgentName(userAgent.id, e.target.value)}
                      >
                        {commonCrawlers.map((crawler) => (
                          <option key={crawler.value} value={crawler.value}>
                            {crawler.label}
                          </option>
                        ))}
                      </select>
                      {userAgent.name !== "*" && (
                        <input
                          type="text"
                          placeholder="Or enter custom user-agent"
                          value={userAgent.name}
                          onChange={(e) => updateUserAgentName(userAgent.id, e.target.value)}
                          className="custom-ua-input"
                        />
                      )}
                    </div>
                    {config.userAgents.length > 1 && (
                      <button
                        className="btn-remove"
                        onClick={() => removeUserAgent(userAgent.id)}
                        title="Remove user agent"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  {/* Disallow Rules */}
                  <div className="rules-section">
                    <h4>Disallow (Blocked Paths)</h4>
                    
                    {/* Common paths */}
                    <div className="common-paths">
                      <span className="common-paths-label">Quick add:</span>
                      {commonPaths.map((path) => (
                        <button
                          key={path}
                          className={`path-chip ${
                            userAgent.disallow.includes(path) ? "added" : ""
                          }`}
                          onClick={() => addCommonPath(userAgent.id, path)}
                          disabled={userAgent.disallow.includes(path)}
                        >
                          {path}
                        </button>
                      ))}
                    </div>

                    {/* Disallow list */}
                    {userAgent.disallow.length > 0 && (
                      <div className="rules-list">
                        {userAgent.disallow.map((path, index) => (
                          <div key={index} className="rule-item">
                            <code>{path}</code>
                            <button
                              className="btn-remove-rule"
                              onClick={() => removeDisallow(userAgent.id, index)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add disallow input */}
                    <div className="add-rule-input">
                      <input
                        type="text"
                        placeholder="Enter path to block (e.g., /admin/)"
                        value={newDisallow[userAgent.id] || ""}
                        onChange={(e) =>
                          setNewDisallow({ ...newDisallow, [userAgent.id]: e.target.value })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") addDisallow(userAgent.id);
                        }}
                      />
                      <button
                        className="btn-add-rule"
                        onClick={() => addDisallow(userAgent.id)}
                        disabled={!newDisallow[userAgent.id]?.trim()}
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>

                  {/* Allow Rules */}
                  <div className="rules-section">
                    <h4>Allow (Exceptions)</h4>
                    <p className="rule-hint">
                      Allow specific paths that would otherwise be blocked
                    </p>

                    {/* Allow list */}
                    {userAgent.allow.length > 0 && (
                      <div className="rules-list">
                        {userAgent.allow.map((path, index) => (
                          <div key={index} className="rule-item allow">
                            <code>{path}</code>
                            <button
                              className="btn-remove-rule"
                              onClick={() => removeAllow(userAgent.id, index)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add allow input */}
                    <div className="add-rule-input">
                      <input
                        type="text"
                        placeholder="Enter path to allow (e.g., /admin/public/)"
                        value={newAllow[userAgent.id] || ""}
                        onChange={(e) =>
                          setNewAllow({ ...newAllow, [userAgent.id]: e.target.value })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") addAllow(userAgent.id);
                        }}
                      />
                      <button
                        className="btn-add-rule"
                        onClick={() => addAllow(userAgent.id)}
                        disabled={!newAllow[userAgent.id]?.trim()}
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sitemaps Section */}
            <div className="robots-section">
              <div className="section-header">
                <h3>Sitemaps</h3>
              </div>

              {config.sitemap.length > 0 && (
                <div className="sitemap-list">
                  {config.sitemap.map((url, index) => (
                    <div key={index} className="sitemap-item">
                      <code>{url}</code>
                      <button
                        className="btn-remove-rule"
                        onClick={() => removeSitemap(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-sitemap-input">
                <input
                  type="url"
                  placeholder="Enter sitemap URL (e.g., https://example.com/sitemap.xml)"
                  value={newSitemap}
                  onChange={(e) => setNewSitemap(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addSitemap();
                  }}
                />
                <button
                  className="btn-add-rule"
                  onClick={addSitemap}
                  disabled={!newSitemap.trim()}
                >
                  <FiPlus /> Add Sitemap
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="robots-section">
              <div className="section-header">
                <h3>Advanced Settings</h3>
              </div>

              <div className="advanced-settings">
                <div className="setting-item">
                  <label htmlFor="crawlDelay">
                    Crawl Delay (seconds)
                    <span className="label-hint">
                      Time between successive crawler requests
                    </span>
                  </label>
                  <input
                    type="number"
                    id="crawlDelay"
                    min="0"
                    max="60"
                    placeholder="None"
                    value={config.crawlDelay || ""}
                    onChange={(e) => updateCrawlDelay(e.target.value)}
                  />
                </div>

                <div className="setting-item">
                  <label htmlFor="host">
                    Preferred Host
                    <span className="label-hint">
                      Specify your preferred domain (e.g., www.example.com)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="host"
                    placeholder="www.example.com"
                    value={config.host}
                    onChange={(e) => updateHost(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Tab */}
        {activeTab === "code" && (
            <motion.div
                className="code-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="code-preview-header">
                <h3>
                    <FiCode /> Generated robots.txt
                </h3>

                <div className="code-actions">
                    <button className="btn-copy-code" onClick={copyToClipboard}>
                    {copied ? (
                        <>
                        <FiCheckCircle /> Copied!
                        </>
                    ) : (
                        <>
                        <FiCopy /> Copy
                        </>
                    )}
                    </button>

                    <button className="btn-download" onClick={downloadRobotsTxt}>
                    <FiDownload /> Download
                    </button>
                </div>
                </div>

                <div className="code-preview">
                <pre>
                    <code>{generateRobotsTxt()}</code>
                </pre>
                </div>

                <div className="usage-instructions">
                <h4>
                    <FiInfo /> How to Use
                </h4>

                <ol>
                    <li>Copy the generated robots.txt content above</li>
                    <li>
                    Create a file named <code>robots.txt</code> in your website's root directory
                    </li>
                    <li>Paste the content into the file</li>
                    <li>
                    Upload to your server (the file should be accessible at{" "}
                    <code>https://yourdomain.com/robots.txt</code>)
                    </li>
                    <li>
                    Test your robots.txt using{" "}
                    <a
                        href="https://www.google.com/webmasters/tools/robots-testing-tool"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Google's robots.txt Tester
                    </a>
                    </li>
                </ol>
                </div>
            </motion.div>
        )}

        {/* Help Tab */}
        {activeTab === "help" && (
          <motion.div
            className="help-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="help-section">
              <h3>What is robots.txt?</h3>
              <p>
                The robots.txt file is a text file that tells search engine crawlers which pages
                or files they can or can't request from your site. It's primarily used to manage
                crawler traffic and keep files off search engines.
              </p>
            </div>

            <div className="help-section">
              <h3>Syntax Guide</h3>
              <div className="syntax-examples">
                <div className="syntax-item">
                  <h4>User-agent</h4>
                  <code>User-agent: *</code>
                  <p>Specifies which crawler the rules apply to. * means all crawlers.</p>
                </div>

                <div className="syntax-item">
                  <h4>Disallow</h4>
                  <code>Disallow: /admin/</code>
                  <p>Tells crawlers not to access specified paths.</p>
                </div>

                <div className="syntax-item">
                  <h4>Allow</h4>
                  <code>Allow: /admin/public/</code>
                  <p>Overrides a Disallow rule to allow specific paths.</p>
                </div>

                <div className="syntax-item">
                  <h4>Sitemap</h4>
                  <code>Sitemap: https://example.com/sitemap.xml</code>
                  <p>Specifies the location of your XML sitemap.</p>
                </div>

                <div className="syntax-item">
                  <h4>Crawl-delay</h4>
                  <code>Crawl-delay: 10</code>
                  <p>Sets delay between crawler requests (in seconds).</p>
                </div>
              </div>
            </div>

            <div className="help-section">
              <h3>Wildcards & Patterns</h3>
              <ul className="pattern-list">
                <li>
                  <code>*</code> - Matches any sequence of characters
                  <br />
                  Example: <code>/admin/*</code> blocks all files in /admin/
                </li>
                <li>
                  <code>$</code> - Matches end of URL
                  <br />
                  Example: <code>/*.pdf$</code> blocks all PDF files
                </li>
              </ul>
            </div>

            <div className="help-section">
              <h3>Common Examples</h3>
              <div className="example-cards">
                <div className="example-card">
                  <h4>Block Everything</h4>
                  <pre>
                    <code>
                      {`User-agent: *
                        Disallow: /`}
                    </code>
                  </pre>
                </div>

                <div className="example-card">
                  <h4>Allow Everything</h4>
                  <pre>
                    <code>
                      {`User-agent: *
                        Disallow:`}
                    </code>
                  </pre>
                </div>

                <div className="example-card">
                  <h4>Block Specific Folders</h4>
                  <pre>
                    <code>
                      {`User-agent: *
                        Disallow: /admin/
                        Disallow: /private/
                        Disallow: /temp/`}
                    </code>
                  </pre>
                </div>

                <div className="example-card">
                  <h4>Block Specific Bot</h4>
                  <pre>
                    <code>
                      {`User-agent: BadBot
                        Disallow: /

                        User-agent: *
                        Disallow:`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="help-section">
              <h3>Best Practices</h3>
              <ul className="best-practices-list">
                <li>
                  <FiCheckCircle /> Keep your robots.txt file simple and clear
                </li>
                <li>
                  <FiCheckCircle /> Test changes using Google Search Console
                </li>
                <li>
                  <FiCheckCircle /> Don't use robots.txt to hide sensitive data (use authentication
                  instead)
                </li>
                <li>
                  <FiCheckCircle /> Include your sitemap URL for better crawling
                </li>
                <li>
                  <FiCheckCircle /> Review and update regularly as your site changes
                </li>
                <li>
                  <FiAlertCircle /> Robots.txt is not a security measure - files can still be
                  accessed directly
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            className="success-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <FiCheckCircle /> Robots.txt copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RobotsTxtGeneratorTool;