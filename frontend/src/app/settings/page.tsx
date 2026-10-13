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
  Monitor
} from "lucide-react";
import { getDashboardSummary, getStoredUser, getStoredToken } from "@/lib/api";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

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
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
          <Settings size={26} color="#60a5fa" />
          Settings &amp; Quota Governance
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
          Manage your cloud identity credentials, API tokens, and inspect strict multi-tenant quotas.
        </p>
      </div>

      {/* User Plan Card */}
      <div
        className="panel-card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(13, 20, 36, 1) 100%)",
          borderColor: "rgba(59, 130, 246, 0.3)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div className="avatar-circle" style={{ width: "54px", height: "54px", fontSize: "22px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
            {(currentUser.full_name || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              {currentUser.full_name}
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{currentUser.email}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              User ID: <code>{currentUser.id}</code>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid #3b82f6",
              color: "#60a5fa",
              fontWeight: 700,
              fontSize: "13px",
              padding: "6px 16px",
              borderRadius: "9999px",
            }}
          >
            Universal Cloud Quota
          </span>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
            <span className="pulse-live-dot" /> Authenticated &amp; Verified
          </div>
        </div>
      </div>

      {/* Quota Governance Grid */}
      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
          Multi-Tenant Quota Limits &amp; Enforcement
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>
          Equal and fair resource allocation applied across all cloud tenants. No tiered restrictions.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {/* Storage Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Database size={16} color="#14b8a6" />
                <span>Storage Capacity</span>
              </div>
              <span style={{ fontWeight: 700, color: "#14b8a6" }}>
                {quotas.storage_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${quotas.storage_percent}%`, backgroundColor: "#14b8a6" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {formatBytes(quotas.storage_used_bytes)} used of {formatBytes(quotas.storage_max_bytes)} allocated
            </div>
          </div>

          {/* Websites Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Globe size={16} color="#ec4899" />
                <span>Hosted Websites</span>
              </div>
              <span style={{ fontWeight: 700, color: "#ec4899" }}>
                {quotas.websites_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${quotas.websites_percent}%`, backgroundColor: "#ec4899" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {quotas.websites_used} used of {quotas.websites_max} allocated
            </div>
          </div>

          {/* Functions Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Code2 size={16} color="#8b5cf6" />
                <span>Serverless Functions</span>
              </div>
              <span style={{ fontWeight: 700, color: "#8b5cf6" }}>
                {quotas.functions_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${quotas.functions_percent}%`, backgroundColor: "#8b5cf6" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {quotas.functions_used} used of {quotas.functions_max} function slots
            </div>
          </div>

          {/* API Daily Requests Quota */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#fff" }}>
                <Share2 size={16} color="#3b82f6" />
                <span>Daily API Gateway Calls</span>
              </div>
              <span style={{ fontWeight: 700, color: "#3b82f6" }}>
                {quotas.api_requests_percent}%
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", marginBottom: "8px" }}>
              <div className="usage-bar-fill" style={{ width: `${quotas.api_requests_percent}%`, backgroundColor: "#3b82f6" }} />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {quotas.api_requests_today} requests today of {quotas.api_requests_max} daily limit
            </div>
          </div>
        </div>
      </div>

      {/* API Authentication & Remote Access */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* API Bearer Token */}
        <div className="panel-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Key size={18} color="#f59e0b" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>API Access Token (JWT)</h3>
          </div>
          <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "16px" }}>
            Use this bearer token to authenticate programmatic REST API calls to the MiniAWS gateway from external scripts or CLI.
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            <span style={{ fontSize: "11px", color: "#60a5fa", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "340px" }}>
              {token ? `Bearer ${token}` : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active_cloud_token..."}
            </span>
            <button
              onClick={handleCopyToken}
              className="secondary-btn"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
            >
              {copiedToken ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              <span>{copiedToken ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Remote Desktop Credentials */}
        <div className="panel-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Monitor size={18} color="#34d399" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Remote Desktop (XRDP GUI)</h3>
          </div>
          <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "14px" }}>
            Connect to any of the 3 EC2 instances via Windows Remote Desktop (<code>mstsc.exe</code>) on port 3389 with XFCE GUI.
          </p>

          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "12px", lineHeight: "1.8" }}>
            <div>Username: <strong style={{ color: "#fff" }}>ec2-user</strong></div>
            <div>Password: <strong style={{ color: "#38bdf8" }}>MiniAWS@2026!</strong></div>
            <div style={{ color: "#64748b", fontSize: "11px" }}>Available on: 35.159.95.208, 3.127.237.130, 3.71.47.123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
