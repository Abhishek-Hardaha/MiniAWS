"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Database,
  Globe,
  Code2,
  Share2,
  Cpu,
  Key,
  UserCheck,
  Check,
  Zap,
  Info,
  Copy,
  Lock,
  Monitor,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Terminal
} from "lucide-react";
import { getDashboardSummary, getStoredUser, getStoredToken } from "@/lib/api";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedAuthHeader, setCopiedAuthHeader] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) setUser(storedUser);
    const storedTok = getStoredToken();
    if (storedTok) setToken(storedTok);

    getDashboardSummary()
      .then((res) => {
        setData(res);
        if (res?.user) setUser(res.user);
      })
      .catch((err) => console.error("Error loading dashboard summary:", err));
  }, []);

  const quotas = data?.quotas || {
    storage_used_bytes: 0,
    storage_max_bytes: 5368709120,
    storage_percent: 0,
    websites_used: 0,
    websites_max: 3,
    websites_percent: 0,
    functions_used: 0,
    functions_max: 5,
    functions_percent: 0,
    api_routes_used: 0,
    api_routes_max: 5,
    api_routes_percent: 0,
    api_requests_today: 0,
    api_requests_max: 500,
    api_requests_percent: 0,
    invocations_month: 0,
    invocations_max: 2000,
    invocations_percent: 0,
  };

  const currentUser = user || {
    full_name: "Abhishek Hardaha",
    email: "abhishek@miniaws.cloud",
    username: "abhishek",
    id: "usr_cloud_admin"
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      showToast("API Bearer Token copied to clipboard!", "success");
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleCopyAuthHeader = () => {
    if (token) {
      navigator.clipboard.writeText(`Authorization: Bearer ${token}`);
      setCopiedAuthHeader(true);
      showToast("HTTP Authorization header copied!", "success");
      setTimeout(() => setCopiedAuthHeader(false), 2500);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
          <Settings size={26} color="#60a5fa" />
          <span>Identity, Security &amp; Quota Governance (AWS IAM)</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
          Manage your cloud IAM principal credentials, JWT access tokens, security posture, and inspect multi-tenant quotas.
        </p>
      </div>

      {/* IAM Principal Identity Card */}
      <div
        className="panel-card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(13, 20, 36, 1) 100%)",
          borderColor: "rgba(59, 130, 246, 0.35)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div className="avatar-circle" style={{ width: "56px", height: "56px", fontSize: "22px", background: "linear-gradient(135deg, #2563eb, #8b5cf6)" }}>
            {(currentUser.full_name || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{currentUser.full_name}</span>
              <span className="cloud-metric-chip cloud-metric-emerald">IAM Authenticated</span>
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>{currentUser.email}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              arn:miniaws:iam::tenant:{currentUser.id || "usr_cloud_admin"}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
            <span
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid #3b82f6",
                color: "#60a5fa",
                fontWeight: 700,
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "9999px",
              }}
            >
              Universal Cloud Quota
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
            <span className="pulse-live-dot" /> eu-central-1 Frankfurt (AZ 1a)
          </div>
        </div>
      </div>

      {/* Quota Governance Grid */}
      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>
            Multi-Tenant Resource Quotas &amp; Enforcement
          </h2>
          <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>
            Strict PostgreSQL Ledger Enforcement
          </span>
        </div>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>
          Universal allocations guaranteed across all cloud tenants. Real-time consumption tracks active resources.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {/* Storage Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Database size={16} color="#14b8a6" />
                <span>S3 Storage Capacity</span>
              </div>
              <span style={{ fontWeight: 700, color: "#14b8a6" }}>
                {quotas.storage_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${Math.max(2, quotas.storage_percent)}%`, backgroundColor: "#14b8a6" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>{formatBytes(quotas.storage_used_bytes)} used</span>
              <span>{formatBytes(quotas.storage_max_bytes)} allocated</span>
            </div>
          </div>

          {/* Websites Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Globe size={16} color="#ec4899" />
                <span>Static Web Hosting (Nginx)</span>
              </div>
              <span style={{ fontWeight: 700, color: "#ec4899" }}>
                {quotas.websites_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${Math.max(2, quotas.websites_percent)}%`, backgroundColor: "#ec4899" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>{quotas.websites_used} sites active</span>
              <span>{quotas.websites_max} allocated</span>
            </div>
          </div>

          {/* Functions Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Code2 size={16} color="#8b5cf6" />
                <span>Serverless Lambdas (EC2-3)</span>
              </div>
              <span style={{ fontWeight: 700, color: "#8b5cf6" }}>
                {quotas.functions_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${Math.max(2, quotas.functions_percent)}%`, backgroundColor: "#8b5cf6" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>{quotas.functions_used} functions registered</span>
              <span>{quotas.functions_max} function slots</span>
            </div>
          </div>

          {/* API Daily Requests Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Share2 size={16} color="#3b82f6" />
                <span>Daily API Gateway Calls (EC2-1)</span>
              </div>
              <span style={{ fontWeight: 700, color: "#3b82f6" }}>
                {quotas.api_requests_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${Math.max(2, quotas.api_requests_percent)}%`, backgroundColor: "#3b82f6" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>{quotas.api_requests_today} requests today</span>
              <span>{quotas.api_requests_max} daily limit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Programmatic Access & Security Audit Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
        {/* API Bearer Token Management */}
        <div className="panel-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Key size={18} color="#f59e0b" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Programmatic API Access Token (JWT)</h3>
          </div>
          <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "16px" }}>
            Authenticate REST requests against your MiniAWS API Gateway, S3 storage buckets, and Lambda execution endpoints.
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px"
            }}
          >
            <span style={{ fontSize: "11px", color: "#60a5fa", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "340px" }}>
              {token
                ? showToken
                  ? `Bearer ${token}`
                  : `Bearer ${token.slice(0, 15)}••••••••••••••••••••••••${token.slice(-10)}`
                : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active_cloud_token..."}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setShowToken(!showToken)}
                className="icon-btn"
                style={{ width: "28px", height: "28px" }}
                title={showToken ? "Mask token" : "Reveal token"}
              >
                {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={handleCopyToken}
                className="secondary-btn"
                style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", padding: "4px 10px" }}
              >
                {copiedToken ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedToken ? "Copied" : "Copy Token"}</span>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Expires in 30 days • Scopes: <code>storage:rw</code>, <code>functions:exec</code>
            </span>
            <button
              onClick={handleCopyAuthHeader}
              className="secondary-btn"
              style={{ fontSize: "11px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              {copiedAuthHeader ? <Check size={12} color="#34d399" /> : <Terminal size={12} />}
              <span>Copy Auth Header</span>
            </button>
          </div>
        </div>

        {/* Security & Compliance Audit Panel */}
        <div className="panel-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <ShieldCheck size={18} color="#34d399" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Security &amp; Encryption Audit</h3>
          </div>
          <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "14px" }}>
            AWS VPC isolation, TLS encryption in-flight, and hardened Linux kernel enforcement.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px" }}>
              <span style={{ color: "#cbd5e1" }}>Transport Encryption:</span>
              <span className="cloud-metric-chip cloud-metric-emerald">TLS 1.3 Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px" }}>
              <span style={{ color: "#cbd5e1" }}>VPC Ingress Protection:</span>
              <span className="cloud-metric-chip cloud-metric-cyan">Security Groups Enforced</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px" }}>
              <span style={{ color: "#cbd5e1" }}>Remote Desktop (XRDP):</span>
              <a href="/admin-stats" style={{ color: "#38bdf8", textDecoration: "underline", fontWeight: 600 }}>
                Port 3389 Admin Protected
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
