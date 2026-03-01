"use client";

// src/components/ui/DynamicIcon.tsx
//
// Renders ANY icon from ANY react-icons set using just the icon name string.
// User types "TbRocket" → renders TbRocket from react-icons/tb
// User types "FaGithub" → renders FaGithub from react-icons/fa
// User types "⚡" emoji → renders it as-is (backward compatible)
//
// SUPPORTED: All react-icons sets (Bi, Hi, Md, Ri, Ai, Fi, Fa, Fa6,
//            Bs, Tb, Si, Lu, Go, Io, Io5, Gi, Sl, Vsc, Wi, Cg, Ci ...)
//
// HOW IT WORKS:
//   1. Detect the icon set prefix from the name (e.g. "Tb" from "TbRocket")
//   2. Dynamically import only that icon set
//   3. Extract the specific icon component
//   4. Render it — cached so same set is never imported twice

import React, { useEffect, useState, useRef } from "react";
import type { IconType } from "react-icons";

// ── Icon set prefix → package path ───────────────────────────────────────────
// Maps the capitalized prefix of an icon name to its react-icons package
const PREFIX_TO_PACKAGE: Record<string, string> = {
    Ai: "ai",
    Bi: "bi",
    Bs: "bs",
    Ci: "ci",
    Cg: "cg",
    Di: "di",
    Fa: "fa",
    Fa6: "fa6",
    Fc: "fc",
    Fi: "fi",
    Gi: "gi",
    Go: "go",
    Gr: "gr",
    Hi: "hi",
    Hi2: "hi2",
    Im: "im",
    Io: "io",
    Io5: "io5",
    Lia: "lia",
    Lu: "lu",
    Md: "md",
    Pi: "pi",
    Px: "px",
    Ri: "ri",
    Rx: "rx",
    Si: "si",
    Sl: "sl",
    Tb: "tb",
    Tfi: "tfi",
    Ti: "ti",
    Vsc: "vsc",
    Wi: "wi",
};

// ── Module cache — each set is imported only once ─────────────────────────────
const moduleCache = new Map<string, Record<string, IconType>>();

// ── Detect prefix from icon name ──────────────────────────────────────────────
// e.g. "TbRocket" → "Tb", "HiOutlineSparkles" → "Hi", "Fa6Circle" → "Fa6"
function getPrefix(name: string): string | null {
    // Check 3-char prefixes first (Fa6, Hi2, Io5, Lia, Tfi)
    const three = name.slice(0, 3);
    if (PREFIX_TO_PACKAGE[three]) return three;

    // Check 2-char prefixes
    const two = name.slice(0, 2);
    if (PREFIX_TO_PACKAGE[two]) return two;

    return null;
}

// ── Load icon module dynamically ──────────────────────────────────────────────
async function loadIcon(name: string): Promise<IconType | null> {
    const prefix = getPrefix(name);
    if (!prefix) return null;

    const pkg = PREFIX_TO_PACKAGE[prefix];

    // Return from cache if already loaded
    if (moduleCache.has(pkg)) {
        const mod = moduleCache.get(pkg)!;
        return (mod[name] as IconType) ?? null;
    }

    // Dynamically import the icon set
    // Note: webpack requires string literals for static analysis,
    // so we use a switch statement
    try {
        let mod: Record<string, IconType>;

        switch (pkg) {
            case "ai": mod = await import("react-icons/ai") as any; break;
            case "bi": mod = await import("react-icons/bi") as any; break;
            case "bs": mod = await import("react-icons/bs") as any; break;
            case "ci": mod = await import("react-icons/ci") as any; break;
            case "cg": mod = await import("react-icons/cg") as any; break;
            case "di": mod = await import("react-icons/di") as any; break;
            case "fa": mod = await import("react-icons/fa") as any; break;
            case "fa6": mod = await import("react-icons/fa6") as any; break;
            case "fc": mod = await import("react-icons/fc") as any; break;
            case "fi": mod = await import("react-icons/fi") as any; break;
            case "gi": mod = await import("react-icons/gi") as any; break;
            case "go": mod = await import("react-icons/go") as any; break;
            case "gr": mod = await import("react-icons/gr") as any; break;
            case "hi": mod = await import("react-icons/hi") as any; break;
            case "hi2": mod = await import("react-icons/hi2") as any; break;
            case "im": mod = await import("react-icons/im") as any; break;
            case "io": mod = await import("react-icons/io") as any; break;
            case "io5": mod = await import("react-icons/io5") as any; break;
            case "lu": mod = await import("react-icons/lu") as any; break;
            case "md": mod = await import("react-icons/md") as any; break;
            case "pi": mod = await import("react-icons/pi") as any; break;
            case "ri": mod = await import("react-icons/ri") as any; break;
            case "rx": mod = await import("react-icons/rx") as any; break;
            case "si": mod = await import("react-icons/si") as any; break;
            case "sl": mod = await import("react-icons/sl") as any; break;
            case "tb": mod = await import("react-icons/tb") as any; break;
            case "ti": mod = await import("react-icons/ti") as any; break;
            case "vsc": mod = await import("react-icons/vsc") as any; break;
            case "wi": mod = await import("react-icons/wi") as any; break;
            default: return null;
        }

        moduleCache.set(pkg, mod);
        return (mod[name] as IconType) ?? null;

    } catch {
        return null;
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

    const [Icon, setIcon] = useState<IconType | null>(null);
    const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");
    const lastNameRef = useRef<string>("");

    useEffect(() => {
        if (!name) { setStatus("notfound"); return; }
        if (isEmoji(name)) { setStatus("found"); return; }
        if (name === lastNameRef.current && Icon) return; // already loaded

        lastNameRef.current = name;
        setStatus("loading");
        setIcon(null);

        loadIcon(name).then((ic) => {
            if (lastNameRef.current !== name) return; // stale
            if (ic) {
                setIcon(() => ic);
                setStatus("found");
            } else {
                setStatus("notfound");
            }
        });
    }, [name]);

    // Emoji — render as-is (backward compatible)
    if (isEmoji(name)) {
        return (
            <span style={{ fontSize: size, lineHeight: 1, ...style }} className={className}>
                {name}
            </span>
        );
    }

    if (status === "loading") return <>{placeholder}</>;
    if (status === "notfound") return <>{fallback}</>;
    if (!Icon) return null;

    return <Icon size={size} color={color} className={className} style={style} />;
}