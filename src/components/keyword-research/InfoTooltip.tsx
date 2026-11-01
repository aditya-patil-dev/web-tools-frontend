// src/components/keyword-research/InfoTooltip.tsx
"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import styles from "./InfoTooltip.module.css";

interface Props {
  content: string | React.ReactNode;
  position?: "top" | "bottom";
  size?: number;
  className?: string;
}

export default function InfoTooltip({
  content,
  position = "top",
  size = 13,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className={`${styles.tooltipContainer} ${
        position === "bottom" ? styles.tooltipBottom : ""
      } ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}
      role="tooltip"
      tabIndex={0}
      aria-label={typeof content === "string" ? content : "Info"}
    >
      <Info size={size} className={styles.infoIcon} />
      <span
        className={styles.tooltipContent}
        style={{
          opacity: isOpen ? 1 : undefined,
          visibility: isOpen ? "visible" : undefined,
          pointerEvents: isOpen ? "auto" : undefined,
        }}
      >
        {content}
      </span>
    </span>
  );
}
