"use client";
import React from "react";
import {
  FInput, FTextarea, FieldDivider,
  ItemCard, RemoveButton, AddButton, InlineInput,
} from "../../components/FieldEditors";
import DynamicIcon from "@/components/ui/DynamicIcon";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface HeroData {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  trustBadges: { icon: string; text: string }[];
}

function HeroEditor({ data, onChange }: EditorProps<HeroData>) {
  function updatePrimaryCta(patch: Partial<HeroData["primaryCta"]>) {
    onChange({ ...data, primaryCta: { ...data.primaryCta, ...patch } });
  }
  function updateSecondaryCta(patch: Partial<HeroData["secondaryCta"]>) {
    onChange({ ...data, secondaryCta: { ...data.secondaryCta, ...patch } });
  }
  function updateBadge(i: number, patch: Partial<{ icon: string; text: string }>) {
    const next = [...data.trustBadges];
    next[i] = { ...next[i], ...patch };
    onChange({ ...data, trustBadges: next });
  }

  return (
    <React.Fragment>
      <FInput
        label="Badge Text"
        value={data.badge}
        onChange={(v) => onChange({ ...data, badge: v })}
        placeholder="🚀 Free & Fast Web Tools"
      />
      <FTextarea
        label="Title (HTML allowed)"
        value={data.title}
        onChange={(v) => onChange({ ...data, title: v })}
        rows={2}
      />
      <FTextarea
        label="Subtitle"
        value={data.subtitle}
        onChange={(v) => onChange({ ...data, subtitle: v })}
      />

      <FieldDivider label="Primary Button" />
      <FInput label="Button Text" value={data.primaryCta.text} onChange={(v) => updatePrimaryCta({ text: v })} />
      <FInput label="Button URL" value={data.primaryCta.href} onChange={(v) => updatePrimaryCta({ href: v })} />

      <FieldDivider label="Secondary Button" />
      <FInput label="Button Text" value={data.secondaryCta.text} onChange={(v) => updateSecondaryCta({ text: v })} />
      <FInput label="Button URL" value={data.secondaryCta.href} onChange={(v) => updateSecondaryCta({ href: v })} />

      <FieldDivider label={`Trust Badges (${data.trustBadges.length})`} />

      {/* Icon hint */}
      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
        💡 Icon field accepts emoji <strong>(⚡)</strong> or React Icons name{" "}
        <strong>(BiSolidBolt, HiOutlineSparkles)</strong>.{" "}
        <a href="https://react-icons.github.io/react-icons" target="_blank" rel="noreferrer"
          style={{ color: "#6366f1", textDecoration: "none" }}>
          Browse icons →
        </a>
      </p>

      {data.trustBadges.map((b, i) => (
        <ItemCard
          key={i}
          header={
            <React.Fragment>
              {/* Live icon preview */}
              <span style={{
                width: 28, height: 28, borderRadius: 6,
                background: "#f1f5f9",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <DynamicIcon
                  name={b.icon || "BiStar"}
                  size={15}
                  color="#6366f1"
                  fallback={<span style={{ fontSize: 14 }}>⭐</span>}
                />
              </span>
              <RemoveButton onClick={() => onChange({
                ...data,
                trustBadges: data.trustBadges.filter((_, j) => j !== i),
              })} />
            </React.Fragment>
          }
        >
          <div style={{ display: "flex", gap: 6 }}>
            {/* Icon name input */}
            <InlineInput
              value={b.icon}
              onChange={(v) => updateBadge(i, { icon: v })}
              placeholder="BiSolidBolt"
              style={{ width: 90, marginBottom: 0, fontSize: 12 }}
            />
            {/* Badge text input */}
            <InlineInput
              value={b.text}
              onChange={(v) => updateBadge(i, { text: v })}
              placeholder="Label"
              style={{ flex: 1, marginBottom: 0 }}
            />
          </div>
        </ItemCard>
      ))}

      <AddButton
        label="Add Trust Badge"
        onClick={() => onChange({
          ...data,
          trustBadges: [...data.trustBadges, { icon: "BiSolidBolt", text: "New badge" }],
        })}
      />
    </React.Fragment>
  );
}

const heroSection: SectionDefinition<HeroData> = {
  type: "hero",
  label: "Hero Section",
  icon: "hero",
  Editor: HeroEditor,
  defaultData: {
    badge: "🚀 Free & Fast Web Tools",
    title: "Powerful <span>Web Tools</span> for<br />Developers & Marketers",
    subtitle: "Convert images, optimize SEO, generate content — no sign-up, no limits.",
    primaryCta: { text: "Try Tools", href: "/tools" },
    secondaryCta: { text: "View Pricing", href: "/pricing" },
    trustBadges: [
      { icon: "BiSolidBolt", text: "Instant results" },
      { icon: "BiLock", text: "Privacy-friendly" },
      { icon: "BiDesktop", text: "Built for productivity" },
    ],
  },
};

export default heroSection;