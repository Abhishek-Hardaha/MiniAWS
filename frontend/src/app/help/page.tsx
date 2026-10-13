"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Monitor,
  Terminal,
  Server,
  Database,
  Globe,
  Code2,
  Share2,
  BarChart3,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Info,
  BookOpen,
  Cpu,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Zap,
  ArrowRight
} from "lucide-react";

export default function HelpPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"architecture" | "rdp" | "services" | "cli">("architecture");
  const [rdpClientTab, setRdpClientTab] = useState<"windows" | "mac" | "linux">("windows");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    showToast(`Copied to clipboard!`, "success");
    setTimeout(() => setCopiedText(null), 2500);
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
          <HelpCircle size={28} color="#38bdf8" />
          <span>Documentation &amp; Cloud Operations Center</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
          Comprehensive AWS 3-Tier architecture specifications, Remote Desktop connection guides, and operational references.
        </p>
      </div>

      {/* Nav Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "architecture", label: "3-Tier Cloud Architecture", icon: Server },
          { id: "rdp", label: "Remote Desktop (XRDP GUI)", icon: Monitor },
          { id: "services", label: "Cloud Services Reference", icon: BookOpen },
          { id: "cli", label: "SSH & CLI Operations", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={isActive ? "primary-btn" : "secondary-btn"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                fontSize: "13px",
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ARCHITECTURE */}
      {activeSection === "architecture" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Interactive Topology Visual Diagram */}
          <div className="panel-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Server size={20} color="#38bdf8" />
              <span>Multi-Tier 3× EC2 Architecture Topology</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              MiniAWS is engineered on a distributed 3-tier enterprise cloud topology deployed across AWS EC2 instances in the <code>eu-central-1</code> (Frankfurt) region, interconnected via private VPC subnets:
            </p>

            {/* Visual Topology Diagram Flow */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                overflowX: "auto",
              }}
            >
              <div style={{ textAlign: "center", minWidth: "120px" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Internet Ingress</div>
                <div style={{ fontSize: "13px", color: "#38bdf8", fontWeight: 700, marginTop: "4px" }}>HTTP/HTTPS :80/:443</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Cloudflare / Direct IP</div>
              </div>

              <ArrowRight size={20} color="#64748b" />

              <div style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.4)", borderRadius: "10px", padding: "12px 16px", minWidth: "180px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700 }}>Tier 1: App Gateway</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>EC2-1 (35.159.95.208)</div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>Next.js (:3000) • FastAPI (:8000)</div>
              </div>

              <ArrowRight size={20} color="#64748b" />

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "rgba(20, 184, 166, 0.15)", border: "1px solid rgba(20, 184, 166, 0.4)", borderRadius: "10px", padding: "10px 14px", minWidth: "180px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#14b8a6", fontWeight: 700 }}>Tier 2: Data &amp; Storage</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>EC2-2 (3.127.237.130)</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>Postgres (:5432) • S3 Storage (:9000)</div>
                </div>

                <div style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: "10px", padding: "10px 14px", minWidth: "180px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#a855f7", fontWeight: 700 }}>Tier 3: Execution Tier</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>EC2-3 (3.71.47.123)</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>Python 3.9 (:5001) • Cron (:5002)</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {/* Tier 1 Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(59, 130, 246, 0.35)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#60a5fa" }}>Tier 1: Application</span>
                  <span className="status-pill status-success">SG: launch-wizard-2</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  EC2 Instance 1 (35.159.95.208)
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  Private VPC IP: <code>172.31.9.80</code>
                </div>
                <ul style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.7", paddingLeft: "16px", margin: 0 }}>
                  <li><strong>Next.js 14 App Router</strong>: Production dashboard on :3000</li>
                  <li><strong>FastAPI Core Gateway</strong>: Async REST API engine on :8000</li>
                  <li><strong>Nginx Reverse Proxy</strong>: Ingress traffic director on :80</li>
                  <li><strong>XRDP GUI Server</strong>: Remote desktop session on :3389</li>
                </ul>
              </div>

              {/* Tier 2 Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(20, 184, 166, 0.35)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#14b8a6" }}>Tier 2: Data &amp; Storage</span>
                  <span className="status-pill status-success">SG: launch-wizard-3</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  EC2 Instance 2 (3.127.237.130)
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  Private VPC IP: <code>172.31.12.181</code>
                </div>
                <ul style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.7", paddingLeft: "16px", margin: 0 }}>
                  <li><strong>PostgreSQL 16</strong>: Persistent relational store on :5432</li>
                  <li><strong>S3 Storage Engine</strong>: Object storage microservice on :9000</li>
                  <li><strong>Nginx Static Hosting</strong>: Public site web server on :8080</li>
                  <li><strong>XRDP GUI Server</strong>: Remote desktop session on :3389</li>
                </ul>
              </div>

              {/* Tier 3 Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(168, 85, 247, 0.35)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#a855f7" }}>Tier 3: Execution Tier</span>
                  <span className="status-pill status-success">SG: launch-wizard-1</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  EC2 Instance 3 (3.71.47.123)
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  Private VPC IP: <code>172.31.3.155</code>
                </div>
                <ul style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.7", paddingLeft: "16px", margin: 0 }}>
                  <li><strong>Python 3.9 Runner</strong>: Sandboxed code runner on :5001</li>
                  <li><strong>APScheduler Daemon</strong>: Cron automated scheduler on :5002</li>
                  <li><strong>Telemetry Reporter</strong>: CloudWatch health collector</li>
                  <li><strong>XRDP GUI Server</strong>: Remote desktop session on :3389</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: RDP GUIDE */}
      {activeSection === "rdp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="panel-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Monitor size={20} color="#34d399" />
              <span>Connecting via Windows Remote Desktop (XRDP GUI)</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              Every EC2 instance in MiniAWS has been provisioned with the ultra-responsive, lightweight <strong>XFCE 4.18 Desktop Environment</strong> and configured with <strong>XRDP</strong> listening on port <code>3389</code>.
            </p>

            {/* Credentials Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 20, 36, 1) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px"
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>DEFAULT USERNAME</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
                  ec2-user
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>RDP PASSWORD</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <code style={{ fontSize: "14px", fontWeight: 700, color: "#38bdf8" }}>🔒 Admin-Only (See Admin Stats)</code>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>FIREWALL PORT &amp; SESSION</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                  Port 3389 (Xorg Session)
                </div>
              </div>
            </div>

            {/* Client OS Selector Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                onClick={() => setRdpClientTab("windows")}
                className={rdpClientTab === "windows" ? "primary-btn" : "secondary-btn"}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                Windows (mstsc.exe)
              </button>
              <button
                onClick={() => setRdpClientTab("mac")}
                className={rdpClientTab === "mac" ? "primary-btn" : "secondary-btn"}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                macOS (Microsoft Remote Desktop)
              </button>
              <button
                onClick={() => setRdpClientTab("linux")}
                className={rdpClientTab === "linux" ? "primary-btn" : "secondary-btn"}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                Linux (Remmina)
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {rdpClientTab === "windows" && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                    Windows Remote Desktop Connection (mstsc.exe)
                  </h3>
                  <ol style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.8", paddingLeft: "20px", margin: 0 }}>
                    <li>Press <code>Win + R</code>, type <code>mstsc</code>, and hit Enter.</li>
                    <li>In the Computer field, enter:
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "6px" }}>
                          <span>EC2-1 App Tier: <code>35.159.95.208:3389</code></span>
                          <button onClick={() => copyToClipboard("35.159.95.208:3389", "ip1")} className="icon-btn" style={{ width: "24px", height: "24px" }}>
                            {copiedText === "ip1" ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "6px" }}>
                          <span>EC2-2 Data Tier: <code>3.127.237.130:3389</code></span>
                          <button onClick={() => copyToClipboard("3.127.237.130:3389", "ip2")} className="icon-btn" style={{ width: "24px", height: "24px" }}>
                            {copiedText === "ip2" ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "6px" }}>
                          <span>EC2-3 Exec Tier: <code>3.71.47.123:3389</code></span>
                          <button onClick={() => copyToClipboard("3.71.47.123:3389", "ip3")} className="icon-btn" style={{ width: "24px", height: "24px" }}>
                            {copiedText === "ip3" ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li style={{ marginTop: "8px" }}>Click <strong>Connect</strong>, accept the self-signed certificate warning, and log in with <code>ec2-user</code>.</li>
                  </ol>
                </div>
              )}

              {rdpClientTab === "mac" && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                    macOS Connection via Microsoft Remote Desktop
                  </h3>
                  <ol style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.8", paddingLeft: "20px", margin: 0 }}>
                    <li>Download <strong>Windows App / Microsoft Remote Desktop</strong> from the Mac App Store.</li>
                    <li>Click <strong>Add PC</strong> and enter the PC Name as <code>35.159.95.208:3389</code>.</li>
                    <li>Under User Account, add <code>ec2-user</code> and enter your administrator password.</li>
                    <li>Double click the saved card to start the high-speed XFCE desktop session.</li>
                  </ol>
                </div>
              )}

              {rdpClientTab === "linux" && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                    Linux Remmina Connection
                  </h3>
                  <ol style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.8", paddingLeft: "20px", margin: 0 }}>
                    <li>Select <strong>RDP</strong> protocol in the Remmina connection bar.</li>
                    <li>Enter <code>35.159.95.208:3389</code> and press Enter.</li>
                    <li>Accept the TLS fingerprint certificate and enjoy full desktop GUI control.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICES */}
      {activeSection === "services" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {/* Storage */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Database size={20} color="#14b8a6" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>S3 Object Storage</h3>
              </div>
              <a href="/storage" className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}>
                Open S3 Console
              </a>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Securely store documents, images, and datasets with 5.0 GB multi-tenant storage quota. Supports drag-and-drop uploads, presigned URLs, SHA-256 verification, and direct blob streaming on the Data Tier (:9000).
            </p>
          </div>

          {/* Web Hosting */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={20} color="#3b82f6" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Static Web Hosting</h3>
              </div>
              <a href="/web-hosting" className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}>
                Open Web Host
              </a>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Deploy production HTML/CSS/JS websites with drag &amp; drop zip upload support. Automatic subdomain slug routing and instant Nginx virtual host reloading on EC2-2 Data Tier (:8080).
            </p>
          </div>

          {/* Serverless Functions */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Code2 size={20} color="#8b5cf6" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>AWS Lambda Functions</h3>
              </div>
              <a href="/functions" className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}>
                Open Lambda Studio
              </a>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Run Python 3.9 serverless functions with isolated process sandboxing on EC2-3 Execution Tier. Supports interactive JSON event test runs or automated cron schedules via APScheduler (:5002).
            </p>
          </div>

          {/* API Gateway */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Share2 size={20} color="#f97316" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Amazon API Gateway</h3>
              </div>
              <a href="/api-gateway" className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px", textDecoration: "none" }}>
                Open Gateway
              </a>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Expose your Python functions as RESTful public or authenticated API endpoints. Includes request validation, rate limiting (RPM), interactive request runner, and cURL command generators.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: CLI OPERATIONS */}
      {activeSection === "cli" && (
        <div className="panel-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={20} color="#f59e0b" />
            <span>SSH Terminal Commands &amp; Operational Scripts</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
            Use your <code>Inst1.pem</code> key pair to SSH directly into any of the 3 instances, or restart background daemons:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              {
                title: "EC2-1 Application Tier (Next.js, FastAPI, Nginx)",
                cmd: "ssh -i Inst1.pem ec2-user@35.159.95.208"
              },
              {
                title: "EC2-2 Data & Storage Tier (Postgres, S3 Storage, Web Server)",
                cmd: "ssh -i Inst1.pem ec2-user@3.127.237.130"
              },
              {
                title: "EC2-3 Execution Tier (Python Runner, APScheduler)",
                cmd: "ssh -i Inst1.pem ec2-user@3.71.47.123"
              },
              {
                title: "Restart Application Backend Service (EC2-1)",
                cmd: "ssh -i Inst1.pem ec2-user@35.159.95.208 \"sudo systemctl restart miniaws-backend\""
              },
              {
                title: "Restart Next.js Frontend Console (EC2-1)",
                cmd: "ssh -i Inst1.pem ec2-user@35.159.95.208 \"sudo systemctl restart miniaws-frontend\""
              },
              {
                title: "Check Systemd Status & Live Logs (EC2-1)",
                cmd: "ssh -i Inst1.pem ec2-user@35.159.95.208 \"journalctl -u miniaws-backend -f\""
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{item.title}</div>
                  <code style={{ fontSize: "13px", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{item.cmd}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(item.cmd, `cli-${idx}`)}
                  className="secondary-btn"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
                >
                  {copiedText === `cli-${idx}` ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  <span>{copiedText === `cli-${idx}` ? "Copied" : "Copy"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
