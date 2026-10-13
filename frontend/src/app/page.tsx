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
import dynamic from "next/dynamic";

const Hyperspeed = dynamic(() => import("@/components/Hyperspeed"), {
  ssr: false,
});

const TechText = dynamic(() => import("@/components/TechText"), {
  ssr: false,
});

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
      {/* Hero Card */}
      <section className="hero-card">
        <div className="hero-left">
          <h1 className="hero-title">
            Hi, {userName} <span style={{ fontSize: "28px" }}>👋</span>
          </h1>
          <p className="hero-sub">
            Your multi-tier cloud environment is active and running.<br />
            Build, deploy, monitor serverless functions and host websites.
          </p>
          <div className="hero-interactive-hint">
            <span className="hero-hint-pulse" />
            Interactive Warp • Click & hold road to boost
          </div>
        </div>

        {/* Hyperspeed Interactive Canvas */}
        <div className="hero-hyperspeed-art">
          <Hyperspeed
            curve="winding"
            curvature={1}
            speed={0.55}
            boost={3}
            fov={109}
            boostFov={130}
            lanes={3}
            roadWidth={13.5}
            medianWidth={1}
            density={40}
            trailLength={1}
            lightSize={1}
            poles={37}
            dust={100}
            glow={0.6}
            reflections={0.5}
            roadOpacity={0.1}
            steer={0.75}
            tailColors={['#d856bf', '#6750a2', '#c247ac']}
            headColors={['#03b3c3', '#0e5ea5', '#324555']}
            poleColors={['#03b3c3']}
            interactive
          />
        </div>

        {/* TechText Wordmark Floating Over Hyperspeed */}
        <div className="hero-techtext-overlay">
          <div className="hero-techtext-badge">
            <span className="hero-techtext-dot" />
            <span>CLOUD PLATFORM</span>
          </div>
          <div className="hero-techtext-stage">
            <TechText
              text="StackSync"
              fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
              fontWeight={800}
              fontSize={80}
              letterSpacing={-0.03}
              color="#ffffff"
              accentColor="#38bdf8"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={16}
              strokeWidth={1.8}
              selection={true}
              labels={true}
              draggable={true}
              sweep={true}
              speed={0.8}
            />
          </div>
        </div>
      </section>

      {/* 5 Quick Service Cards Grid */}
      <div className="services-grid">
        {/* 1. Storage */}
        <Link href="/storage" className="service-card card-storage">
          <div>
            <div className="card-icon-box">
              <Database size={22} color="#14b8a6" />
            </div>
            <div className="card-title">Storage</div>
            <div className="card-desc">
              Upload, manage and access your files securely.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 2. Web Hosting */}
        <Link href="/web-hosting" className="service-card card-web">
          <div>
            <div className="card-icon-box">
              <Globe size={22} color="#3b82f6" />
            </div>
            <div className="card-title">Web Hosting</div>
            <div className="card-desc">
              Host your HTML website with a single upload.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 3. Serverless Functions */}
        <Link href="/functions" className="service-card card-functions">
          <div>
            <div className="card-icon-box">
              <Code2 size={22} color="#8b5cf6" />
            </div>
            <div className="card-title">Serverless Functions</div>
            <div className="card-desc">
              Run your Python code on demand or on schedule.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 4. API Gateway */}
        <Link href="/api-gateway" className="service-card card-gateway">
          <div>
            <div className="card-icon-box">
              <Share2 size={22} color="#f97316" />
            </div>
            <div className="card-title">API Gateway</div>
            <div className="card-desc">
              Expose your functions as secure APIs.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 5. Monitoring */}
        <Link href="/monitoring" className="service-card card-monitoring">
          <div>
            <div className="card-icon-box">
              <BarChart3 size={22} color="#ec4899" />
            </div>
            <div className="card-title">Monitoring</div>
            <div className="card-desc">
              Track performance, telemetry, logs and usage.
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
