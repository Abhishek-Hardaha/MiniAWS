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
  Info
} from "lucide-react";
import { getDashboardSummary } from "@/lib/api";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

  const quotas = data?.quotas || {
    storage_used_bytes: 671088640,
    storage_max_bytes: 5368709120,
    storage_percent: 12,
    websites_used: 1,
    websites_max: 3,
    websites_percent: 33,
    functions_used: 2,
    functions_max: 5,
    functions_percent: 40,
    api_routes_used: 1,
    api_routes_max: 5,
    api_routes_percent: 20,
    api_requests_today: 128,
    api_requests_max: 500,
    api_requests_percent: 26,
    invocations_month: 45,
    invocations_max: 2000,
    invocations_percent: 2.25,
    plan_tier: "Developer",
  };

  const user = data?.user || {
    full_name: "Aarav Sharma",
    email: "aarav@miniaws.com",
    plan_tier: "Developer",
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
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
          Monitor your assigned multi-tenant resource quotas and manage account credentials.
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
          <div className="avatar-circle" style={{ width: "54px", height: "54px", fontSize: "22px" }}>
            {user.full_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{user.email}</div>
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
            {quotas.plan_tier} Plan
          </span>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
            Status: Active &amp; Verified
          </div>
        </div>
      </div>

      {/* Quota Governance Grid */}
      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
          Resource Quota Limits &amp; Enforcement
        </h2>

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
              {quotas.api_requests_today} requests today of {quotas.api_requests_max} limit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
