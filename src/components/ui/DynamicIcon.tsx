"use client";

import React, { useMemo } from "react";
import { Icon } from "@iconify/react";

// ── Name Mapper ────────────────────────────────────────────────────────────────
function mapReactIconToIconify(name: string): string {
  if (!name) return "";

  // 1. Detect prefix (2 or 3 chars)
  let prefix = "";
  const prefixes3 = ["Fa6", "Hi2", "Io5", "Lia", "Tfi"];
  const p3 = name.slice(0, 3);
  if (prefixes3.includes(p3)) {
    prefix = p3;
  } else {
    prefix = name.slice(0, 2);
  }

  const pureName = name.slice(prefix.length);
  const kebabName = pureName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/-+/g, "-") // handle cases like "Fa6Web-Awesome"
    .toLowerCase();

  switch (prefix) {
    case "Ai":
      return `ant-design:${kebabName}`;
    case "Bi":
      if (kebabName.startsWith("solid-"))
        return `bxs:${kebabName.replace("solid-", "")}`;
      if (kebabName.startsWith("logos-"))
        return `bxl:${kebabName.replace("logos-", "")}`;
      return `bx:${kebabName}`;
    case "Bs":
      return `bi:${kebabName}`;
    case "Ci":
      return `ci:${kebabName}`;
    case "Cg":
      return `cssgg:${kebabName}`;
    case "Di":
      return `devicon:${kebabName}`;
    case "Fa":
      if (kebabName.startsWith("reg-"))
        return `fa-regular:${kebabName.replace("reg-", "")}`;
      // Note: FA icons in Iconify are split between solid, brands, etc.
      // fa-solid satisfies most needs.
      return `fa-solid:${kebabName}`;
    case "Fa6":
      if (kebabName.startsWith("reg-"))
        return `fa6-regular:${kebabName.replace("reg-", "")}`;
      return `fa6-solid:${kebabName}`;
    case "Fc":
      return `flat-color-icons:${kebabName}`;
    case "Fi":
      return `feather:${kebabName}`;
    case "Gi":
      return `gi:${kebabName}`;
    case "Go":
      return `octicon:${kebabName}`;
    case "Gr":
      return `grommet-icons:${kebabName}`;
    case "Hi":
      return `heroicons-outline:${kebabName}`;
    case "Hi2":
      return `heroicons:${kebabName}`;
    case "Im":
      return `icomoon-free:${kebabName}`;
    case "Io":
      return `ion:${kebabName}`;
    case "Io5":
      return `ion:${kebabName}`;
    case "Lu":
      return `lucide:${kebabName}`;
    case "Md":
      return `mdi:${kebabName}`;
    case "Pi":
      return `ph:${kebabName}`;
    case "Ri":
      return `ri:${kebabName}`;
    case "Rx":
      return `radix-icons:${kebabName}`;
    case "Si":
      return `simple-icons:${kebabName}`;
    case "Sl":
      return `simple-line-icons:${kebabName}`;
    case "Tb":
      return `tabler:${kebabName}`;
    case "Tfi":
      return `tfi:${kebabName}`;
    case "Ti":
      return `typcn:${kebabName}`;
    case "Vsc":
      return `vscode-icons:${kebabName}`;
    case "Wi":
      return `wi:${kebabName}`;
    default:
      // If no known prefix, check if it's already an Iconify name (contains colon)
      if (name.includes(":")) return name;
      return `${prefix.toLowerCase()}:${kebabName}`;
  }
}

// ── Is emoji? ─────────────────────────────────────────────────────────────────
function isEmoji(str: string): boolean {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && !/^[a-zA-Z]/.test(str);
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Shown while loading */
  placeholder?: React.ReactNode;
  /** Shown if icon not found */
  fallback?: React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DynamicIcon({
  name,
  size = 16,
  color,
  className,
  style,
  placeholder = null,
  fallback = null,
}: DynamicIconProps) {
  const iconName = useMemo(() => {
    if (!name || isEmoji(name)) return "";
    return mapReactIconToIconify(name);
  }, [name]);

  // Emoji — render as-is (backward compatible)
  if (isEmoji(name)) {
    return (
      <span
        style={{ fontSize: size, lineHeight: 1, ...style }}
        className={className}
      >
        {name}
      </span>
    );
  }

  if (!name) return <>{fallback}</>;

  return (
    <Icon
      icon={iconName}
      width={size}
      height={size}
      color={color}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    />
  );
}
