// src/components/keyword-research/CountryFlag.tsx
import React from "react";

interface Props {
  code: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function CountryFlag({
  code,
  width = 20,
  height = 14,
  className = "",
}: Props) {
  const c = code.toLowerCase();

  const flagStyle: React.CSSProperties = {
    display: "inline-block",
    borderRadius: "2px",
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.08)",
    verticalAlign: "middle",
    flexShrink: 0,
  };

  switch (c) {
    case "us":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <g fillRule="evenodd">
            <path fill="#bd3d44" d="M0 0h640v480H0" />
            <path
              stroke="#fff"
              strokeWidth="37"
              d="M0 55.4h640M0 129.2h640M0 203.1h640M0 276.9h640M0 350.8h640M0 424.6h640"
            />
            <path fill="#192f5d" d="M0 0h364.8v258.5H0z" />
            {/* Star pattern simplified for small size */}
            <g fill="#fff">
              <circle cx="60" cy="50" r="14" />
              <circle cx="140" cy="50" r="14" />
              <circle cx="220" cy="50" r="14" />
              <circle cx="300" cy="50" r="14" />
              <circle cx="100" cy="100" r="14" />
              <circle cx="180" cy="100" r="14" />
              <circle cx="260" cy="100" r="14" />
              <circle cx="60" cy="150" r="14" />
              <circle cx="140" cy="150" r="14" />
              <circle cx="220" cy="150" r="14" />
              <circle cx="300" cy="150" r="14" />
              <circle cx="100" cy="200" r="14" />
              <circle cx="180" cy="200" r="14" />
              <circle cx="260" cy="200" r="14" />
            </g>
          </g>
        </svg>
      );

    case "in":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#f93" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#128807" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="56" fill="none" stroke="#008" strokeWidth="8" />
          <circle cx="320" cy="240" r="14" fill="#008" />
          {/* Wheel spokes */}
          <path
            stroke="#008"
            strokeWidth="3.5"
            d="M320 184v112M264 240h112M280 200l80 80M360 200l-80 80M296 188l48 104M344 188l-48 104M268 216l104 48M268 264l104-48"
          />
        </svg>
      );

    case "gb":
    case "uk":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path
            stroke="#fff"
            strokeWidth="60"
            d="m0 0 640 480M640 0 0 480"
          />
          <path
            stroke="#c8102e"
            strokeWidth="40"
            d="m0 0 640 480M640 0 0 480"
          />
          <path
            stroke="#fff"
            strokeWidth="100"
            d="M320 0v480M0 240h640"
          />
          <path
            stroke="#c8102e"
            strokeWidth="60"
            d="M320 0v480M0 240h640"
          />
        </svg>
      );

    case "ca":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#f00" d="M0 0h160v480H0zM480 0h160v480H480z" />
          <path fill="#fff" d="M160 0h320v480H160z" />
          {/* Maple Leaf */}
          <path
            fill="#f00"
            d="M320 100l22 45 35-15-10 40 45 15-25 35 25 20-55 10 5 45-42-20-42 20 5-45-55-10 25-20-25-35 45-15-10-40 35 15z"
          />
          <path fill="#f00" d="M312 300h16v60h-16z" />
        </svg>
      );

    case "au":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#00008b" d="M0 0h640v480H0z" />
          {/* Mini Union Jack canton */}
          <g>
            <path fill="#012169" d="M0 0h320v240H0z" />
            <path stroke="#fff" strokeWidth="30" d="m0 0 320 240M320 0 0 240" />
            <path stroke="#c8102e" strokeWidth="20" d="m0 0 320 240M320 0 0 240" />
            <path stroke="#fff" strokeWidth="50" d="M160 0v240M0 120h320" />
            <path stroke="#c8102e" strokeWidth="30" d="M160 0v240M0 120h320" />
          </g>
          {/* Commonwealth Star */}
          <circle cx="160" cy="360" r="30" fill="#fff" />
          {/* Southern cross dots */}
          <circle cx="480" cy="90" r="14" fill="#fff" />
          <circle cx="420" cy="200" r="14" fill="#fff" />
          <circle cx="530" cy="240" r="14" fill="#fff" />
          <circle cx="480" cy="360" r="14" fill="#fff" />
          <circle cx="510" cy="285" r="9" fill="#fff" />
        </svg>
      );

    case "de":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#000" d="M0 0h640v160H0z" />
          <path fill="#d00" d="M0 160h640v160H0z" />
          <path fill="#ffce00" d="M0 320h640v160H0z" />
        </svg>
      );

    case "fr":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#002395" d="M0 0h213.3v480H0z" />
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#ed2939" d="M426.7 0H640v480H426.7z" />
        </svg>
      );

    case "jp":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#fff" d="M0 0h640v480H0z" />
          <circle cx="320" cy="240" r="120" fill="#bc002d" />
        </svg>
      );

    case "br":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#009b3a" d="M0 0h640v480H0z" />
          <path fill="#fedf00" d="m320 50 260 190-260 190L60 240z" />
          <circle cx="320" cy="240" r="90" fill="#002776" />
        </svg>
      );

    case "es":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#aa151b" d="M0 0h640v120H0zM0 360h640v120H0z" />
          <path fill="#f1bf00" d="M0 120h640v240H0z" />
        </svg>
      );

    case "it":
      return (
        <svg
          style={flagStyle}
          className={className}
          width={width}
          height={height}
          viewBox="0 0 640 480"
        >
          <path fill="#009246" d="M0 0h213.3v480H0z" />
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
        </svg>
      );

    default:
      return (
        <span
          style={{
            ...flagStyle,
            width,
            height,
            background: "#94a3b8",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {c.toUpperCase().slice(0, 2)}
        </span>
      );
  }
}
