"use client";

import React, { useState } from "react";

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryLabel?: string;
}

interface AreaTimelineChartProps {
  data: ChartDataPoint[];
  color?: string;
  gradientId?: string;
  height?: number;
  unit?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function AreaTimelineChart({
  data,
  color = "#38bdf8",
  gradientId = "areaGrad",
  height = 190,
  unit = "ms",
  title,
  subtitle,
  badge,
}: AreaTimelineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        No telemetry data available.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, 1);
  const paddingX = 35;
  const paddingY = 25;
  const width = 600; // viewBox width

  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Normalized points
  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * plotWidth;
    // Map value to Y coordinate (inverted in SVG)
    const normalized = (item.value - Math.min(0, minVal)) / (maxVal - Math.min(0, minVal) || 1);
    const y = height - paddingY - normalized * plotHeight;
    return { x, y, ...item };
  });

  // Build smooth cubic bezier SVG path
  let pathD = "";
  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Close path for area gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Optional Title Bar */}
      {(title || badge) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            {title && (
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{title}</div>
            )}
            {subtitle && (
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                {subtitle}
              </div>
            )}
          </div>
          {badge && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                padding: "3px 10px",
                borderRadius: "9999px",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: `${height}px`, overflow: "visible" }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.38" />
              <stop offset="65%" stopColor={color} stopOpacity="0.10" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255, 255, 255, 0.08)"
          />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main Line with Glow */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={`url(#${gradientId}-glow)`}
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i}>
              {/* Invisible larger circle for easier hover */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={16}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === i ? 5.5 : 3.5}
                fill={hoverIndex === i ? "#fff" : color}
                stroke="#0b1120"
                strokeWidth={hoverIndex === i ? 3 : 2}
                style={{
                  transition: "all 0.15s ease",
                  pointerEvents: "none",
                }}
              />
            </g>
          ))}

          {/* Hover Crosshair Vertical Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeDasharray="2 2"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            style={{
              position: "absolute",
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
              transform: "translate(-50%, -125%)",
              background: "rgba(11, 17, 32, 0.95)",
              border: `1px solid ${color}88`,
              borderRadius: "8px",
              padding: "6px 10px",
              pointerEvents: "none",
              boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
              zIndex: 30,
              fontSize: "11px",
            }}
          >
            <div style={{ color: "#fff", fontWeight: 700 }}>
              {activePoint.value.toLocaleString()} {unit}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "10px" }}>
              {activePoint.secondaryLabel || activePoint.label}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Axis Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: `0 ${paddingX}px`,
          marginTop: "6px",
          fontSize: "11px",
          color: "#64748b",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
