"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Database,
  Globe,
  Code2,
  Share2,
  Activity,
  Cpu,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Download,
  Terminal,
  RefreshCw,
  Check,
  Copy,
  Server,
  Layers,
  Clock,
  HardDrive,
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { getAdminStats, getRdpDownloadUrl } from "@/lib/api";

export default function AdminStatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchTenant, setSearchTenant] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = () => {
    setLoading(true);
    setErrorMsg(null);
    getAdminStats()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load admin stats:", err);
        setErrorMsg(err.message || "Admin access required. Please sign in as platform administrator.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Copied ${label} to clipboard!`, "success");
    setTimeout(() => setCopiedText(null), 2500);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const pStats = data?.platform_stats || {
    total_storage_bytes: 0,
    total_websites: 0,
    total_functions: 0,
    total_routes: 0,
    total_invocations: 0,
  };

  const usersList = data?.users_usage || [];
  const ec2Fleet = data?.resources?.ec2_fleet || [];
  const secureRdp = data?.resources?.secure_rdp || null;

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldAlert size={28} color="#38bdf8" />
            <span>Admin Stats &amp; Infrastructure Governance</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Overall multi-tenant platform metrics, user usages, 3-tier EC2 resources, and protected administrator controls.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="primary-btn"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {errorMsg ? (
        <div className="panel-card" style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.08)", padding: "24px", textAlign: "center" }}>
          <ShieldAlert size={36} color="#ef4444" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: "18px", color: "#fff", marginBottom: "8px" }}>Access Restricted</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>{errorMsg}</p>
        </div>
      ) : (
        <>
          {/* Platform Overall Totals Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "28px" }}>
            {/* 1. Total Users */}
            <div className="panel-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                <Users size={16} color="#60a5fa" />
                <span>Total Tenants</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginTop: "6px" }}>
                {data?.total_users || 0}
              </div>
              <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="pulse-live-dot" /> Verified in PostgreSQL
              </div>
            </div>

            {/* 2. Platform Storage */}
            <div className="panel-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                <Database size={16} color="#14b8a6" />
                <span>Storage Utilized</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#14b8a6", marginTop: "6px" }}>
                {formatBytes(pStats.total_storage_bytes)}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                Across all buckets
              </div>
            </div>

            {/* 3. Total Websites */}
            <div className="panel-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                <Globe size={16} color="#3b82f6" />
                <span>Hosted Websites</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#3b82f6", marginTop: "6px" }}>
                {pStats.total_websites}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                Active Nginx VHosts
              </div>
            </div>

            {/* 4. Functions & Routes */}
            <div className="panel-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                <Code2 size={16} color="#8b5cf6" />
                <span>Functions / APIs</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#a855f7", marginTop: "6px" }}>
                {pStats.total_functions} / {pStats.total_routes}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                Serverless &amp; Gateway
              </div>
            </div>

            {/* 5. Invocations */}
            <div className="panel-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                <Activity size={16} color="#ec4899" />
                <span>Invocations</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#ec4899", marginTop: "6px" }}>
                {pStats.total_invocations}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                CloudWatch telemetry
              </div>
            </div>
          </div>

          {/* Protected Remote Desktop (XRDP GUI) Administration Section */}
          <div
            className="panel-card"
            style={{
              marginBottom: "28px",
              background: "linear-gradient(135deg, rgba(30, 58, 138, 0.22) 0%, rgba(13, 20, 36, 0.95) 100%)",
              borderColor: "rgba(59, 130, 246, 0.4)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Monitor size={22} color="#38bdf8" />
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  Private Administrator Remote Desktop (XRDP GUI)
                </h2>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Lock size={12} />
                <span>Admin Only • Protected</span>
              </span>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
              Access the high-performance <strong>XFCE 4.18 Desktop GUI</strong> configured on port <code>3389</code>. Credentials and RDP profiles are restricted to your authenticated administrator account and not exposed in public repositories.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
              {/* Credentials Box */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                  RDP Session Credentials
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Username:</span>
                    <code style={{ fontSize: "14px", color: "#fff", fontWeight: 700 }}>
                      {secureRdp?.user || "ec2-user"}
                    </code>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Password:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <code style={{ fontSize: "13px", color: secureRdp?.is_authorized ? "#38bdf8" : "#94a3b8", fontWeight: 700 }}>
                        {secureRdp?.is_authorized ? (showPassword ? secureRdp?.password : "••••••••••••") : "Protected (Root Admin)"}
                      </code>
                      {secureRdp?.is_authorized && (
                        <>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                            title={showPassword ? "Hide password" : "Reveal password"}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(secureRdp?.password || "", "pwd")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                            title="Copy password"
                          >
                            {copiedText === "pwd" ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#cbd5e1" }}>XRDP Port:</span>
                    <span style={{ fontSize: "13px", color: "#a855f7", fontWeight: 600 }}>3389 (Xorg Session)</span>
                  </div>
                </div>
              </div>

              {/* One-Click RDP Profiles */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                    One-Click .RDP File Downloads
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                    {secureRdp?.is_authorized
                      ? "Download pre-configured Windows Remote Desktop connection files:"
                      : "Remote Desktop connection files are reserved for the root administrator (Abhishek)."}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {secureRdp?.is_authorized ? (
                    <>
                      <a
                        href={getRdpDownloadUrl("i-miniaws-ec2-1-app")}
                        download="ec2-1-app.rdp"
                        className="primary-btn"
                        style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                      >
                        <Download size={13} />
                        <span>EC2-1 App</span>
                      </a>
                      <a
                        href={getRdpDownloadUrl("i-miniaws-ec2-2-data")}
                        download="ec2-2-data.rdp"
                        className="primary-btn"
                        style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                      >
                        <Download size={13} />
                        <span>EC2-2 Data</span>
                      </a>
                      <a
                        href={getRdpDownloadUrl("i-miniaws-ec2-3-exec")}
                        download="ec2-3-exec.rdp"
                        className="primary-btn"
                        style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                      >
                        <Download size={13} />
                        <span>EC2-3 Exec</span>
                      </a>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                      🔒 Administrator login required to download .RDP profiles
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Tier EC2 Hardware Telemetry Cards */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Server size={18} color="#38bdf8" />
              <span>3-Tier Infrastructure Live Telemetry</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {ec2Fleet.map((node: any) => (
                <div key={node.id} className="panel-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{node.name}</h3>
                      <div style={{ fontSize: "12px", color: "#60a5fa", marginTop: "2px" }}>
                        {node.public_ip} • <span style={{ color: "#94a3b8" }}>{node.private_ip}</span>
                      </div>
                    </div>
                    <span className="status-pill status-success">Running</span>
                  </div>

                  {/* CPU & Memory Gauges */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "14px 0" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>CPU Load</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>
                        {node.cpu_percent}%
                      </div>
                      <div className="usage-bar-track" style={{ height: "4px", marginTop: "4px" }}>
                        <div className="usage-bar-fill" style={{ width: `${Math.min(100, node.cpu_percent * 2)}%`, backgroundColor: "#38bdf8" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Memory Used</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#a855f7", marginTop: "2px" }}>
                        {node.memory_percent}%
                      </div>
                      <div className="usage-bar-track" style={{ height: "4px", marginTop: "4px" }}>
                        <div className="usage-bar-fill" style={{ width: `${node.memory_percent}%`, backgroundColor: "#a855f7" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span>Uptime: <strong style={{ color: "#fff" }}>{node.uptime}</strong></span>
                    <span>Ping: <strong style={{ color: "#34d399" }}>{node.latency_ms} ms</strong></span>
                  </div>

                  {/* Services */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {node.services?.map((svc: string) => (
                      <span
                        key={svc}
                        style={{
                          fontSize: "11px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          color: "#cbd5e1"
                        }}
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Tenant User Usages Table */}
          <div className="panel-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={18} color="#38bdf8" />
                  <span>Tenant Usages &amp; Resource Consumption</span>
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "2px" }}>
                  Live breakdown of storage, hosted websites, serverless functions, and API consumption per tenant.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} color="#64748b" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search tenant..."
                    className="form-input"
                    style={{ paddingLeft: "32px", paddingRight: "10px", paddingTop: "6px", paddingBottom: "6px", fontSize: "12px", width: "180px" }}
                    value={searchTenant}
                    onChange={(e) => setSearchTenant(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Total: <strong style={{ color: "#fff" }}>{usersList.length} Accounts</strong>
                </span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#64748b", textTransform: "uppercase", fontSize: "11px" }}>
                    <th style={{ padding: "12px 14px" }}>Tenant</th>
                    <th style={{ padding: "12px 14px" }}>Username</th>
                    <th style={{ padding: "12px 14px" }}>Storage Consumed</th>
                    <th style={{ padding: "12px 14px" }}>Websites</th>
                    <th style={{ padding: "12px 14px" }}>Functions</th>
                    <th style={{ padding: "12px 14px" }}>API Routes</th>
                    <th style={{ padding: "12px 14px" }}>Invocations</th>
                    <th style={{ padding: "12px 14px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter((u: any) => {
                      if (!searchTenant) return true;
                      const q = searchTenant.toLowerCase();
                      return (
                        u.full_name?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        u.username?.toLowerCase().includes(q)
                      );
                    })
                    .map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 600, color: "#fff" }}>{u.full_name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{u.email}</div>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <code style={{ color: "#38bdf8", fontSize: "12px", background: "rgba(56,189,248,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                            @{u.username}
                          </code>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ color: "#14b8a6", fontWeight: 600 }}>
                            {formatBytes(u.storage_used_bytes)} ({u.files_count} files)
                          </div>
                          <div className="usage-bar-track" style={{ height: "4px", width: "100px", marginTop: "4px" }}>
                            <div className="usage-bar-fill" style={{ width: `${Math.min(100, Math.round((u.storage_used_bytes / (5 * 1024 ** 3)) * 100))}%`, backgroundColor: "#14b8a6" }} />
                          </div>
                        </td>
                        <td style={{ padding: "14px", color: "#3b82f6", fontWeight: 600 }}>
                          {u.websites_count} / 3
                        </td>
                        <td style={{ padding: "14px", color: "#a855f7", fontWeight: 600 }}>
                          {u.functions_count} / 5
                        </td>
                        <td style={{ padding: "14px", color: "#f97316", fontWeight: 600 }}>
                          {u.api_routes_count} / 5
                        </td>
                        <td style={{ padding: "14px", color: "#ec4899", fontWeight: 600 }}>
                          {u.invocations_count}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span className="status-pill status-success">Active</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Floating Toast Notification */}
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
    </div>
  );
}
