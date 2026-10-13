"use client";

import React, { useState } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  subLabel?: string;
}

interface DonutRingChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerPrimary?: string | number;
  centerSecondary?: string;
  title?: string;
}

export default function DonutRingChart({
  segments,
  size = 170,
  strokeWidth = 16,
  centerPrimary,
  centerSecondary,
  title,
}: DonutRingChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets
  let accumulatedPercent = 0;
  const calculatedSegments = segments.map((seg) => {
    const percent = total > 0 ? seg.value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...seg,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div style={{ width: "100%" }}>
      {title && (
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>
          {title}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {/* SVG Ring */}
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {/* Background Base Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Colored Segment Arcs */}
            {calculatedSegments.map((seg, idx) => {
              if (seg.value === 0) return null;
              const isHovered = hoverIndex === idx;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="butt"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : "none",
                  }}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Info Text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
              {hoverIndex !== null
                ? calculatedSegments[hoverIndex].value
                : centerPrimary !== undefined
                ? centerPrimary
                : total}
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
              {hoverIndex !== null
                ? calculatedSegments[hoverIndex].label
                : centerSecondary || "Total"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minWidth: "140px" }}>
          {calculatedSegments.map((seg, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <div
                key={seg.label}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: "8px",
                  background: isHovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "3px",
                      backgroundColor: seg.color,
                      boxShadow: isHovered ? `0 0 8px ${seg.color}` : "none",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: isHovered ? "#fff" : "#cbd5e1", fontWeight: 500 }}>
                    {seg.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>
                    {seg.value}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    {seg.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
