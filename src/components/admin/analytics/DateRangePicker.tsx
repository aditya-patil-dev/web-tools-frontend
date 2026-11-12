"use client";

import { useState, useRef, useEffect } from "react";

export type DatePresetKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "last_month"
  | "quarter"
  | "ytd"
  | "all";

export interface DateRangeValue {
  preset: DatePresetKey | "custom";
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  label: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
}

const PRESET_OPTIONS: { key: DatePresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "ytd", label: "Year to Date" },
  { key: "all", label: "All Time" },
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar view year and month (base month is the left calendar)
  const [viewDate, setViewDate] = useState(() => {
    // If November 2026, set view around current or selected
    return new Date();
  });

  const [tempStart, setTempStart] = useState<string>(value.startDate || "");
  const [tempEnd, setTempEnd] = useState<string>(value.endDate || "");
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDateYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Select a preset immediately
  const handleSelectPreset = (key: DatePresetKey) => {
    const opt = PRESET_OPTIONS.find((p) => p.key === key);
    const now = new Date();
    let s = "";
    let e = formatDateYMD(now);

    if (key === "today") {
      s = formatDateYMD(now);
    } else if (key === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      s = formatDateYMD(y);
      e = formatDateYMD(y);
    } else if (key === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      s = formatDateYMD(d);
    } else if (key === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      s = formatDateYMD(d);
    } else if (key === "month") {
      s = formatDateYMD(new Date(now.getFullYear(), now.getMonth(), 1));
    } else if (key === "last_month") {
      s = formatDateYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      e = formatDateYMD(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (key === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      s = formatDateYMD(new Date(now.getFullYear(), q * 3, 1));
    } else if (key === "ytd") {
      s = formatDateYMD(new Date(now.getFullYear(), 0, 1));
    } else if (key === "all") {
      s = "2020-01-01";
    }

    onChange({
      preset: key,
      startDate: s,
      endDate: e,
      label: opt?.label || "Selected Range",
    });
    setTempStart(s);
    setTempEnd(e);
    setIsOpen(false);
  };

  // Day click logic for dual calendar
  const handleDayClick = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd("");
    } else if (tempStart && !tempEnd) {
      if (new Date(dateStr) < new Date(tempStart)) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const handleApplyCustom = () => {
    if (tempStart && tempEnd) {
      onChange({
        preset: "custom",
        startDate: tempStart,
        endDate: tempEnd,
        label: `${tempStart} to ${tempEnd}`,
      });
      setIsOpen(false);
    } else if (tempStart && !tempEnd) {
      onChange({
        preset: "custom",
        startDate: tempStart,
        endDate: tempStart,
        label: tempStart,
      });
      setIsOpen(false);
    }
  };

  const handleResetToAll = () => {
    handleSelectPreset("all");
  };

  // Generate calendar days for a given year & month
  const renderMonthCalendar = (year: number, month: number) => {
    const monthDate = new Date(year, month, 1);
    const monthName = monthDate.toLocaleString("en-US", { month: "long" });
    const firstDayIndex = monthDate.getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }

    return (
      <div style={{ flex: 1, minWidth: "220px" }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", marginBottom: "12px" }}>
          {monthName} {year}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center" }}>
          {days.map((day, i) => {
            if (!day) return <div key={i} style={{ height: "30px" }} />;

            const dateStr = formatDateYMD(new Date(year, month, day));
            const isStart = tempStart === dateStr;
            const isEnd = tempEnd === dateStr;
            const inRange =
              tempStart &&
              tempEnd &&
              new Date(dateStr) > new Date(tempStart) &&
              new Date(dateStr) < new Date(tempEnd);
            const inHoverRange =
              tempStart &&
              !tempEnd &&
              hoverDate &&
              new Date(dateStr) > new Date(tempStart) &&
              new Date(dateStr) <= new Date(hoverDate);

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                style={{
                  height: "30px",
                  borderRadius: isStart || isEnd ? "50%" : inRange || inHoverRange ? "0px" : "6px",
                  background: isStart || isEnd ? "#4f46e5" : inRange || inHoverRange ? "rgba(99, 102, 241, 0.12)" : "transparent",
                  color: isStart || isEnd ? "#ffffff" : "#1e293b",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: isStart || isEnd ? 700 : 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.1s ease",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const leftYear = viewDate.getFullYear();
  const leftMonth = viewDate.getMonth();
  const rightDate = new Date(leftYear, leftMonth + 1, 1);
  const rightYear = rightDate.getFullYear();
  const rightMonth = rightDate.getMonth();

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      {/* ── Top Trigger Bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 16px",
            borderRadius: "10px",
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            color: "#0f172a",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
            transition: "all 0.15s ease",
          }}
        >
          <i className="bi bi-calendar4-week" style={{ color: "var(--admin-accent)", fontSize: "1rem" }} />
          <span>{value.label || "Pick a date"}</span>
          <i className={`bi bi-chevron-${isOpen ? "up" : "down"}`} style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "4px" }} />
        </button>

        <button
          type="button"
          onClick={handleResetToAll}
          title="Reset to All Time"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          }}
        >
          <i className="bi bi-arrow-counterclockwise" />
        </button>
      </div>

      {/* ── Popover Dropdown Panel (matching Screenshot 3) ── */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 9999,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.05)",
            display: "flex",
            flexDirection: "row",
            width: "740px",
            maxWidth: "92vw",
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* Left Column: PRESETS */}
          <div
            style={{
              width: "160px",
              borderRight: "1px solid #f1f5f9",
              padding: "16px 12px",
              background: "#fafbfd",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px", paddingLeft: "8px" }}>
                Presets
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {PRESET_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectPreset(opt.key)}
                    style={{
                      textAlign: "left",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      background: value.preset === opt.key ? "rgba(79, 70, 229, 0.12)" : "transparent",
                      color: value.preset === opt.key ? "#4338ca" : "#334155",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: value.preset === opt.key ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToAll}
              style={{
                marginTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#64748b",
                cursor: "pointer",
                padding: "6px 8px",
              }}
            >
              <i className="bi bi-arrow-counterclockwise" />
              <span>Reset to all</span>
            </button>
          </div>

          {/* Right Main Area: Inputs + Dual Calendar + Actions */}
          <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Top Date Inputs & Year Nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ padding: "6px 12px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#334155" }}>
                  <span style={{ color: "#94a3b8", marginRight: "4px" }}>From:</span>
                  <strong>{tempStart || "Start date"}</strong>
                </div>
                <span style={{ color: "#94a3b8" }}>→</span>
                <div style={{ padding: "6px 12px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#334155" }}>
                  <span style={{ color: "#94a3b8", marginRight: "4px" }}>To:</span>
                  <strong>{tempEnd || "End date"}</strong>
                </div>
              </div>

              {/* Month / Year Arrows */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(leftYear - 1, leftMonth, 1))}
                  title="Previous Year"
                  style={{ padding: "3px 8px", borderRadius: "6px", background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}
                >
                  « Year
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(leftYear, leftMonth - 1, 1))}
                  title="Previous Month"
                  style={{ padding: "3px 8px", borderRadius: "6px", background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(leftYear, leftMonth + 1, 1))}
                  title="Next Month"
                  style={{ padding: "3px 8px", borderRadius: "6px", background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(leftYear + 1, leftMonth, 1))}
                  title="Next Year"
                  style={{ padding: "3px 8px", borderRadius: "6px", background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}
                >
                  Year »
                </button>
              </div>
            </div>

            {/* Dual Calendars */}
            <div style={{ display: "flex", gap: "28px", marginBottom: "20px" }}>
              {renderMonthCalendar(leftYear, leftMonth)}
              {renderMonthCalendar(rightYear, rightMonth)}
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
              <button
                type="button"
                onClick={() => {
                  setTempStart("");
                  setTempEnd("");
                }}
                style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}
              >
                Clear
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", background: "#f1f5f9", border: "none", color: "#475569", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    background: "#4f46e5",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

