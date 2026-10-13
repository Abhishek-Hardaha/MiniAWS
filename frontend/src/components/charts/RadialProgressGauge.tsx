"use client";

import React from "react";

interface RadialProgressGaugeProps {
  value: number;
  max: number;
  color: string;
  label: string;
  sub: string;
  size?: number;
  strokeWidth?: number;
}

export default function RadialProgressGauge({
  value,
  max,
  color,
  label,
  sub,
  size = 110,
  strokeWidth = 9,
}: RadialProgressGaugeProps) {
  const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "16px",
        position: "relative",
        transition: "all 0.25s ease",
      }}
      className="radial-gauge-card"
    >
      <div style={{ position: "relative", width: size, height: size, marginBottom: "12px" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "19px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            {percent}%
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", marginBottom: "3px" }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
