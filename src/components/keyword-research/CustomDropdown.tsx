// src/components/keyword-research/CustomDropdown.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import styles from "./CustomDropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
  headerTitle?: string;
  defaultIcon?: React.ReactNode;
  className?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  disabled = false,
  headerTitle,
  defaultIcon,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  // Keyboard navigation (Escape closes)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""} ${
          disabled ? styles.triggerDisabled : ""
        }`}
      >
        <div className={styles.triggerContent}>
          <span className={styles.triggerIcon}>
            {selectedOption?.icon || defaultIcon}
          </span>
          <span className={styles.triggerLabel}>
            {selectedOption?.label}
            {selectedOption?.badge && (
              <span style={{ marginLeft: "0.35rem", color: "#64748b", fontWeight: 600 }}>
                ({selectedOption.badge})
              </span>
            )}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={styles.dropdownMenu}
            role="listbox"
          >
            {headerTitle && (
              <div className={styles.menuHeader}>
                <span>{headerTitle}</span>
                <span>{options.length} available</span>
              </div>
            )}

            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`${styles.optionItem} ${
                    isSelected ? styles.optionItemActive : ""
                  }`}
                >
                  <div className={styles.optionLeft}>
                    {opt.icon && (
                      <span className={styles.optionIconWrap}>{opt.icon}</span>
                    )}
                    <span className={styles.optionLabelText}>
                      {opt.label}
                      {opt.subLabel && (
                        <span className={styles.optionSubText}>
                          ({opt.subLabel})
                        </span>
                      )}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {opt.badge && (
                      <span
                        className={`${styles.badgePill} ${
                          isSelected ? styles.badgePillActive : ""
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}

                    {isSelected && (
                      <Check size={14} className={styles.checkIcon} />
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
