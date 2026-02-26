"use client";
// src/features/online-store/sections/hero/index.tsx

import React from "react";
import {
  FInput, FTextarea, FieldDivider,
  ItemCard, RemoveButton, AddButton, InlineInput,
} from "../../components/FieldEditors";
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
      <FInput label="Badge Text" value={data.badge} onChange={(v) => onChange({ ...data, badge: v })} placeholder="🚀 Free & Fast Web Tools" />
      <FTextarea label="Title (HTML allowed)" value={data.title} onChange={(v) => onChange({ ...data, title: v })} rows={2} />
      <FTextarea label="Subtitle" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />

      <FieldDivider label="Primary Button" />
      <FInput label="Button Text" value={data.primaryCta.text} onChange={(v) => updatePrimaryCta({ text: v })} />
      <FInput label="Button URL" value={data.primaryCta.href} onChange={(v) => updatePrimaryCta({ href: v })} />

      <FieldDivider label="Secondary Button" />
      <FInput label="Button Text" value={data.secondaryCta.text} onChange={(v) => updateSecondaryCta({ text: v })} />
      <FInput label="Button URL" value={data.secondaryCta.href} onChange={(v) => updateSecondaryCta({ href: v })} />

      <FieldDivider label={`Trust Badges (${data.trustBadges.length})`} />
      {data.trustBadges.map((b, i) => (
        <ItemCard
          key={i}
          header={
            <React.Fragment>
              <span style={{ fontSize: 16 }}>{b.icon || "⭐"}</span>
              <RemoveButton onClick={() => onChange({ ...data, trustBadges: data.trustBadges.filter((_, j) => j !== i) })} />
            </React.Fragment>
          }
        >
          <div style={{ display: "flex", gap: 6 }}>
            <InlineInput value={b.icon} onChange={(v) => updateBadge(i, { icon: v })} placeholder="🔥" style={{ width: 48, textAlign: "center", fontSize: 17, marginBottom: 0 }} />
            <InlineInput value={b.text} onChange={(v) => updateBadge(i, { text: v })} placeholder="Label" style={{ flex: 1, marginBottom: 0 }} />
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add Trust Badge" onClick={() => onChange({ ...data, trustBadges: [...data.trustBadges, { icon: "⭐", text: "New badge" }] })} />
    </React.Fragment>
  );
}

// No cast needed — Editor in SectionDefinition is React.FC<EditorProps<any>>
// so HeroEditor (EditorProps<HeroData>) is directly assignable
const heroSection: SectionDefinition<HeroData> = {
  type: "hero",
  label: "Hero Section",
  icon: "🦸",
  Editor: HeroEditor,
  defaultData: {
    badge: "🚀 Free & Fast Web Tools",
    title: "Powerful <span>Web Tools</span> for<br />Developers & Marketers",
    subtitle: "Convert images, optimize SEO, generate content — no sign-up, no limits.",
    primaryCta: { text: "Try Tools", href: "/tools" },
    secondaryCta: { text: "View Pricing", href: "/pricing" },
    trustBadges: [
      { icon: "⚡", text: "Instant results" },
      { icon: "🔒", text: "Privacy-friendly" },
      { icon: "💻", text: "Built for productivity" },
    ],
  },
};

export default heroSection;