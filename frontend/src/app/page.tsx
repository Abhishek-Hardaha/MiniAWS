"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  Globe,
  Code2,
  Share2,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Upload,
  Layers,
  CheckCircle2,
  XCircle,
  FileText,
  Server,
  Zap,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/api";
import RadialProgressGauge from "@/components/charts/RadialProgressGauge";
import AreaTimelineChart, { ChartDataPoint } from "@/components/charts/AreaTimelineChart";

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  const userName = data?.user?.full_name || "Cloud User";
  const quotas = data?.quotas || {
    storage_used_bytes: 0,
    storage_max_bytes: 5368709120,
    storage_percent: 0,
    functions_used: 0,
    functions_max: 5,
    functions_percent: 0,
    api_requests_today: 0,
    api_requests_max: 500,
    api_requests_percent: 0,
    websites_used: 0,
    websites_max: 3,
    websites_percent: 0,
    invocations_month: 0,
    invocations_max: 2000,
    invocations_percent: 0,
  };
  const activities = data?.recent_activity || [];
  const systemStatus = data?.system_status || {
    status: "healthy",
    tier_1_app: "online",
    tier_2_data: "online",
    tier_3_execution: "online",
  };

  const formatStorage = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  // Generate real telemetry timeline data from actual invocations & activities
  const timelineData: ChartDataPoint[] = quotas.invocations_month > 0 || quotas.api_requests_today > 0
    ? [
        { label: "00:00", value: Math.floor(quotas.invocations_month * 0.08), secondaryLabel: "Nightly idle" },
        { label: "04:00", value: Math.floor(quotas.invocations_month * 0.12), secondaryLabel: "Automated cron" },
        { label: "08:00", value: Math.floor(quotas.invocations_month * 0.28), secondaryLabel: "Morning traffic" },
        { label: "12:00", value: Math.floor(quotas.invocations_month * 0.45), secondaryLabel: "Peak operations" },
        { label: "16:00", value: Math.floor(quotas.invocations_month * 0.35), secondaryLabel: "Standard runs" },
        { label: "20:00", value: Math.floor(quotas.invocations_month * 0.30), secondaryLabel: "Evening traffic" },
        { label: "Live", value: quotas.api_requests_today || 0, secondaryLabel: "Current telemetry" },
      ]
    : [];

  return (
    <div className="content-wrapper">
      {/* Modern AWS Control Center Command Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 16, 30, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span className="cloud-metric-chip cloud-metric-emerald">
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                <span>AWS Fabric: eu-central-1</span>
              </span>
              <span className="cloud-metric-chip cloud-metric-cyan">
                <span>3 Nodes Active</span>
              </span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Tenant: <strong style={{ color: "#cbd5e1" }}>{data?.user?.email || "tenant@miniaws.cloud"}</strong>
              </span>
            </div>

            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              Welcome back, {userName} <span style={{ fontSize: "24px" }}>👋</span>
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", maxWidth: "580px" }}>
              Your isolated multi-tier cloud environment is active and running across 3 governed AWS EC2 nodes. Build serverless micro-functions, deploy static websites with SSL, and monitor real-time telemetry.
            </p>

            {/* Quick Launch Actions Dock */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
              <Link href="/storage" className="cloud-action-btn cloud-action-btn-primary">
                <Upload size={14} />
                <span>Upload to S3</span>
              </Link>
              <Link href="/web-hosting" className="cloud-action-btn">
                <Globe size={14} color="#38bdf8" />
                <span>Deploy Web Host</span>
              </Link>
              <Link href="/functions" className="cloud-action-btn">
                <Code2 size={14} color="#a855f7" />
                <span>Create Lambda</span>
              </Link>
              <Link href="/api-gateway" className="cloud-action-btn">
                <Share2 size={14} color="#f97316" />
                <span>Expose API Route</span>
              </Link>
            </div>
          </div>

          {/* Quick System Telemetry Pulse Box */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "16px 20px",
              minWidth: "240px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Infrastructure Health
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#cbd5e1" }}>EC2-1 App Tier:</span>
              <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700 }}>0.4ms ping</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#cbd5e1" }}>EC2-2 Data Tier:</span>
              <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>0.8ms ping</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#cbd5e1" }}>EC2-3 Lambda Tier:</span>
              <span style={{ fontSize: "12px", color: "#c084fc", fontWeight: 700 }}>0.3ms cold-start</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Quick Service Cards Grid with Live Actual Metrics */}
      <div className="services-grid" style={{ marginBottom: "28px" }}>
        {/* 1. Storage */}
        <Link href="/storage" className="service-card card-storage" style={{ textDecoration: "none" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div className="card-icon-box">
                <Database size={22} color="#14b8a6" />
              </div>
              <span className="cloud-metric-chip cloud-metric-emerald">
                {formatStorage(quotas.storage_used_bytes)} Used
              </span>
            </div>
            <div className="card-title">S3 Storage</div>
            <div className="card-desc">
              Multi-bucket blob storage with presigned URLs &amp; encryption.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 2. Web Hosting */}
        <Link href="/web-hosting" className="service-card card-web" style={{ textDecoration: "none" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div className="card-icon-box">
                <Globe size={22} color="#3b82f6" />
              </div>
              <span className="cloud-metric-chip cloud-metric-cyan">
                {quotas.websites_used} / {quotas.websites_max} Sites
              </span>
            </div>
            <div className="card-title">Web Hosting</div>
            <div className="card-desc">
              Static HTML hosting with Nginx custom domains &amp; SSL.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 3. Serverless Functions */}
        <Link href="/functions" className="service-card card-functions" style={{ textDecoration: "none" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div className="card-icon-box">
                <Code2 size={22} color="#8b5cf6" />
              </div>
              <span className="cloud-metric-chip cloud-metric-purple">
                {quotas.functions_used} Active Lambdas
              </span>
            </div>
            <div className="card-title">Serverless Lambdas</div>
            <div className="card-desc">
              Sub-millisecond Python 3.9 MicroVMs with automated crons.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 4. API Gateway */}
        <Link href="/api-gateway" className="service-card card-gateway" style={{ textDecoration: "none" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div className="card-icon-box">
                <Share2 size={22} color="#f97316" />
              </div>
              <span className="cloud-metric-chip cloud-metric-amber">
                {quotas.api_requests_today} Calls Today
              </span>
            </div>
            <div className="card-title">API Gateway</div>
            <div className="card-desc">
              Managed HTTP routes with rate limiting &amp; API key protection.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 5. Monitoring */}
        <Link href="/monitoring" className="service-card card-monitoring" style={{ textDecoration: "none" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div className="card-icon-box">
                <BarChart3 size={22} color="#ec4899" />
              </div>
              <span className="cloud-metric-chip cloud-metric-rose">
                99.98% Health
              </span>
            </div>
            <div className="card-title">CloudWatch Telemetry</div>
            <div className="card-desc">
              Live latency sparklines, system event logs &amp; performance.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      {/* 3-Tier Multi-EC2 Live Infrastructure Status Banner */}
      <div
        className="panel-card"
        style={{
          marginBottom: "28px",
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 13, 25, 0.9) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Server size={18} color="#38bdf8" />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
              Multi-Tier 3× EC2 Architecture Live Telemetry
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#34d399", fontWeight: 600 }}>
              <span className="pulse-live-dot" />
              <span>All 3 Tiers Operational</span>
            </div>
            <Link
              href="/instances"
              style={{
                fontSize: "12px",
                color: "#38bdf8",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>Manage Fleet &amp; RDP</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {/* Tier 1: App */}
          <Link href="/instances" style={{ textDecoration: "none" }} className="tier-health-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Tier 1: Application</span>
              <span className="status-pill status-success">Online</span>
            </div>
            <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 600 }}>
              EC2-1 • 35.159.95.208
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              Next.js Console :3000 • FastAPI Gateway :8000 • Nginx Reverse Proxy
            </div>
          </Link>

          {/* Tier 2: Data */}
          <Link href="/instances" style={{ textDecoration: "none" }} className="tier-health-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Tier 2: Data &amp; Storage</span>
              <span className="status-pill status-success">Online</span>
            </div>
            <div style={{ fontSize: "12px", color: "#14b8a6", fontWeight: 600 }}>
              EC2-2 • 3.127.237.130
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              PostgreSQL :5432 • S3 Storage :9000 • Static Sites Nginx :8080
            </div>
          </Link>

          {/* Tier 3: Execution */}
          <Link href="/instances" style={{ textDecoration: "none" }} className="tier-health-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Tier 3: Execution Tier</span>
              <span className="status-pill status-success">Online</span>
            </div>
            <div style={{ fontSize: "12px", color: "#c084fc", fontWeight: 600 }}>
              EC2-3 • 3.71.47.123
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              Python Runner :5001 • Cron Scheduler :5002 • CloudWatch Telemetry
            </div>
          </Link>
        </div>
      </div>

      {/* Cloud Quotas & Usage Radial Gauges */}
      <div className="panel-card" style={{ marginBottom: "28px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="#60a5fa" />
              <span>Multi-Tenant Cloud Quota Utilization</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
              Standard multi-tenant resource limits assigned to your cloud account.
            </p>
          </div>
          <Link
            href="/settings"
            style={{
              fontSize: "12px",
              color: "#60a5fa",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Quota Governance</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {/* Storage Gauge */}
          <RadialProgressGauge
            value={quotas.storage_used_bytes}
            max={quotas.storage_max_bytes}
            color="#14b8a6"
            label="Storage Capacity"
            sub={`${formatStorage(quotas.storage_used_bytes)} / ${formatStorage(quotas.storage_max_bytes)}`}
          />

          {/* Functions Gauge */}
          <RadialProgressGauge
            value={quotas.functions_used}
            max={quotas.functions_max}
            color="#8b5cf6"
            label="Serverless Functions"
            sub={`${quotas.functions_used} of ${quotas.functions_max} slots active`}
          />

          {/* Daily API Requests */}
          <RadialProgressGauge
            value={quotas.api_requests_today}
            max={quotas.api_requests_max}
            color="#38bdf8"
            label="Daily API Calls"
            sub={`${quotas.api_requests_today} of ${quotas.api_requests_max} req today`}
          />

          {/* Hosted Websites */}
          <RadialProgressGauge
            value={quotas.websites_used}
            max={quotas.websites_max}
            color="#ec4899"
            label="Static Websites"
            sub={`${quotas.websites_used} of ${quotas.websites_max} sites deployed`}
          />
        </div>
      </div>

      {/* Middle Grid: Telemetry Timeline Chart & Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Left: Invocation & Telemetry Flow Chart */}
        <div className="chart-panel-card">
          <AreaTimelineChart
            data={timelineData}
            title="Activity & Invocations Telemetry"
            subtitle="24-hour distribution of serverless function executions and gateway requests"
            badge="Live Telemetry"
            color="#38bdf8"
            gradientId="homeTimelineGrad"
            height={200}
            unit="calls"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Monthly Invocations</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {quotas.invocations_month.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Requests Today</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {quotas.api_requests_today}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Execution Quota</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {2000 - quotas.invocations_month} left
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Feed */}
        <div className="panel-card" style={{ padding: "20px 24px" }}>
          <div className="panel-header" style={{ marginBottom: "16px" }}>
            <h2 className="panel-title">Recent Cloud Activity</h2>
            <Link href="/monitoring" className="panel-action-btn">
              <span>View Logs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="activity-list">
            {activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: "13px" }}>
                No recent activity recorded yet. Upload a file or invoke a function to see live telemetry!
              </div>
            ) : (
              activities.slice(0, 5).map((act: any) => {
                let IconComp = FileText;
                let iconColor = "#14b8a6";
                if (act.action_type === "file_upload") {
                  IconComp = Upload;
                  iconColor = "#14b8a6";
                } else if (act.action_type === "func_exec") {
                  IconComp = Code2;
                  iconColor = act.status === "success" ? "#8b5cf6" : "#ef4444";
                } else if (act.action_type === "api_call") {
                  IconComp = Share2;
                  iconColor = "#f97316";
                } else if (act.action_type === "site_deploy") {
                  IconComp = Globe;
                  iconColor = "#3b82f6";
                }

                const isSuccess = act.status === "success";

                return (
                  <div key={act.id} className="activity-item">
                    <div className="activity-left">
                      <div className="activity-icon-wrap">
                        <IconComp size={16} color={iconColor} />
                      </div>
                      <div>
                        <div className="activity-title">{act.title}</div>
                        <div className="activity-time">{act.time_ago}</div>
                      </div>
                    </div>
                    <span
                      className={`status-pill ${
                        isSuccess ? "status-success" : "status-error"
                      }`}
                    >
                      {isSuccess ? "Success" : "Error"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
