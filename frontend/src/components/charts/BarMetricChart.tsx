"use client";

import React from "react";

export interface BarMetricItem {
  label: string;
  value: number;
  max: number;
  displayValue?: string;
  color: string;
  icon?: React.ReactNode;
}

interface BarMetricChartProps {
  items: BarMetricItem[];
  title?: string;
  subtitle?: string;
}

export default function BarMetricChart({ items, title, subtitle }: BarMetricChartProps) {
  return (
    <div style={{ width: "100%" }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: "16px" }}>
          {title && (
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{title}</div>
          )}
          {subtitle && (
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {items.map((item, idx) => {
          const percent = item.max > 0 ? Math.min(Math.round((item.value / item.max) * 100), 100) : 0;
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1", fontWeight: 600 }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {item.displayValue || item.value}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "11px" }}>
                    ({percent}%)
                  </span>
                </div>
              </div>

              {/* Bar Track */}
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "9999px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    backgroundColor: item.color,
                    borderRadius: "9999px",
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 0 10px ${item.color}88`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
