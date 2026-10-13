"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  Globe,
  Code2,
  Share2,
  BarChart3,
  Server,
  Settings,
  HelpCircle,
  Cloud,
  ShieldAlert,
  Sparkles,
  Activity
} from "lucide-react";

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Core Cloud",
    items: [
      { name: "Console Home", href: "/", icon: Home },
      { name: "S3 Object Storage", href: "/storage", icon: Database },
      { name: "Web Hosting", href: "/web-hosting", icon: Globe },
      { name: "Serverless Lambdas", href: "/functions", icon: Code2 },
      { name: "API Gateway", href: "/api-gateway", icon: Share2 },
    ],
  },
  {
    title: "Infrastructure & Ops",
    items: [
      { name: "EC2 Fleet", href: "/instances", icon: Server, badge: "3 Nodes" },
      { name: "CloudWatch Telemetry", href: "/monitoring", icon: BarChart3 },
      { name: "Admin Governance", href: "/admin-stats", icon: ShieldAlert },
    ],
  },
  {
    title: "Preferences",
    items: [
      { name: "Settings & Quotas", href: "/settings", icon: Settings },
      { name: "Architecture & Docs", href: "/help", icon: HelpCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" style={{ width: "256px", display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Brand Logo with Glow & Region Tag */}
      <Link href="/" className="sidebar-logo" style={{ textDecoration: "none", padding: "4px 8px 24px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon-wrap" style={{ position: "relative" }}>
            <Cloud size={22} color="#38bdf8" strokeWidth={2.4} />
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                Mini<span style={{ color: "#38bdf8" }}>AWS</span>
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                v2.4
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Cloud Control Fabric
            </div>
          </div>
        </div>
      </Link>

      {/* Main Categorized Navigation */}
      <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px", paddingRight: "4px" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "0 14px 6px 14px",
              }}
            >
              {section.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        color={isActive ? "#fff" : item.href === "/admin-stats" ? "#38bdf8" : "#94a3b8"}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "9999px",
                          background: isActive ? "rgba(255,255,255,0.2)" : "rgba(16, 185, 129, 0.15)",
                          color: isActive ? "#fff" : "#34d399",
                          border: isActive ? "none" : "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Cluster Health & Region Live Pill */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
              }}
            />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>eu-central-1</span>
          </div>
          <span style={{ fontSize: "10px", color: "#34d399", fontWeight: 600 }}>Operational</span>
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", display: "flex", justifyContent: "space-between" }}>
          <span>Multi-EC2 Fabric</span>
          <span style={{ color: "#38bdf8", fontWeight: 600 }}>3/3 Healthy</span>
        </div>
      </div>
    </aside>
  );
}
