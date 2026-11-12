"use client";

import React from "react";
import { LuShieldCheck, LuCpu, LuInfinity } from "react-icons/lu";

export default function PrivacyProof() {
  return (
    <section className="privacy-proof-section">
      <div className="privacy-banner">
        <div className="privacy-banner-header">
          <h2>Private by Design. Powered by Your Browser.</h2>
          <p>
            Unlike traditional cloud convert tools, your sensitive documents, personal photos, and code snippets never touch external servers.
          </p>
        </div>

        <div className="privacy-features-grid">
          <div className="privacy-card">
            <div className="privacy-icon">
              <LuShieldCheck />
            </div>
            <h4>Zero Server Uploads</h4>
            <p>
              Image compression, background removal, and PDF manipulations happen directly inside your device&apos;s browser memory. Your files never leave your machine.
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <LuCpu />
            </div>
            <h4>WebAssembly Speed</h4>
            <p>
              Cutting-edge Wasm engines process files at near-native hardware speed. No upload latency, no queue delays, no waiting for busy server clusters.
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <LuInfinity />
            </div>
            <h4>No Paywalls or Watermarks</h4>
            <p>
              100% free web utilities with zero watermarks. No account creation required, no email subscriptions, and no surprise premium export fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

