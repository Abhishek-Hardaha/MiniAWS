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
  Cpu
} from "lucide-react";

export default function HelpPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"architecture" | "rdp" | "services" | "cli">("architecture");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
          <HelpCircle size={28} color="#38bdf8" />
          <span>Documentation &amp; Cloud Operations Center</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
          Comprehensive architecture specifications, Remote Desktop connection guides, and operational references.
        </p>
      </div>

      {/* Nav Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
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
          <div className="panel-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Server size={20} color="#38bdf8" />
              <span>Multi-Tier 3× EC2 Architecture Overview</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              MiniAWS is engineered on a distributed 3-tier enterprise cloud topology deployed across AWS EC2 instances in the <code>eu-central-1</code> (Frankfurt) region:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {/* Tier 1 Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#60a5fa" }}>Tier 1: Application</span>
                  <span className="status-pill status-success">Port 80 / 3000</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  EC2 Instance 1 (35.159.95.208)
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  Private VPC IP: 172.31.9.80
                </div>
                <ul style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.7", paddingLeft: "16px", margin: 0 }}>
                  <li><strong>Next.js 14 App Router</strong>: Production dashboard on :3000</li>
                  <li><strong>FastAPI Core Gateway</strong>: Async REST API engine on :8000</li>
                  <li><strong>Nginx Reverse Proxy</strong>: Ingress traffic director on :80</li>
                  <li><strong>XRDP GUI Server</strong>: Remote desktop session on :3389</li>
                </ul>
              </div>

              {/* Tier 2 Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(20, 184, 166, 0.3)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#14b8a6" }}>Tier 2: Data &amp; Storage</span>
                  <span className="status-pill status-success">Port 5432 / 9000</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  EC2 Instance 2 (3.127.237.130)
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  Private VPC IP: 172.31.12.181
                </div>
                <ul style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.7", paddingLeft: "16px", margin: 0 }}>
                  <li><strong>PostgreSQL 16</strong>: Persistent relational store on :5432</li>
                  <li><strong>S3 Storage Engine</strong>: Object storage microservice on :9000</li>
                  <li><strong>Nginx Static Hosting</strong>: Public site web server on :8080</li>
                  <li><strong>XRDP GUI Server</strong>: Remote desktop session on :3389</li>
                </ul>
              </div>

              {/* Tier 3 Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#a855f7" }}>Tier 3: Execution Tier</span>
                  <span className="status-pill status-success">Port 5001 / 5002</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  EC2 Instance 3 (3.71.47.123)
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
                  Private VPC IP: 172.31.3.155
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
                <div style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>DEFAULT PASSWORD</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <code style={{ fontSize: "18px", fontWeight: 800, color: "#38bdf8" }}>MiniAWS@2026!</code>
                  <button
                    onClick={() => copyToClipboard("MiniAWS@2026!", "rdp-pwd")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                  >
                    {copiedText === "rdp-pwd" ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>FIREWALL PORT &amp; SESSION</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                  Port 3389 (Xorg Session)
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                  Method 1: One-Click Connection with .RDP File
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
                  Navigate to the <strong>EC2 Instances</strong> page in the sidebar. Next to any of the 3 instances, click the blue <strong>"Connect RDP"</strong> button. Double-click the downloaded <code>.rdp</code> file, click "Connect", enter password <code>MiniAWS@2026!</code>, and your XFCE Linux desktop will immediately open in full screen.
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                  Method 2: Windows Remote Desktop Connection (mstsc.exe)
                </h3>
                <ol style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.8", paddingLeft: "20px", margin: 0 }}>
                  <li>Press <code>Windows + R</code>, type <code>mstsc</code>, and hit Enter.</li>
                  <li>In the Computer field, enter:
                    <ul style={{ listStyle: "none", paddingLeft: "10px", marginTop: "4px" }}>
                      <li>• EC2-1 App Tier: <code>35.159.95.208:3389</code></li>
                      <li>• EC2-2 Data Tier: <code>3.127.237.130:3389</code></li>
                      <li>• EC2-3 Exec Tier: <code>3.71.47.123:3389</code></li>
                    </ul>
                  </li>
                  <li>Click <strong>Connect</strong>, accept the certificate prompt, and log in with <code>ec2-user</code>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICES */}
      {activeSection === "services" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {/* Storage */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Database size={20} color="#14b8a6" />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>S3 Object Storage</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Securely store documents, images, and datasets with 5.0 GB multi-tenant storage quota. Supports direct file streaming, public downloads, file inspection, and hash verification on the Data Tier.
            </p>
          </div>

          {/* Web Hosting */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Globe size={20} color="#3b82f6" />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Static Web Hosting</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Deploy modern HTML/CSS/JS websites with drag &amp; drop file upload support. Automatic subdomain slug routing and instant Nginx virtual host reloading on EC2-2 Data Tier.
            </p>
          </div>

          {/* Serverless Functions */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Code2 size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Serverless Functions</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Run Python 3.9 serverless functions with isolated process sandboxing on EC2-3 Execution Tier. Supports manual test triggers or automated cron schedules via APScheduler.
            </p>
          </div>

          {/* API Gateway */}
          <div className="panel-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Share2 size={20} color="#f97316" />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>API Gateway</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
              Expose your Python functions as RESTful public or authenticated API endpoints. Includes request validation, live latency metrics, and API test console.
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
            Use your <code>Inst1.pem</code> key pair to SSH directly into any of the 3 instances:
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
                title: "Restart Application Backend Service",
                cmd: "ssh -i Inst1.pem ec2-user@35.159.95.208 \"sudo systemctl restart miniaws-backend\""
              },
              {
                title: "Restart Next.js Frontend Console",
                cmd: "ssh -i Inst1.pem ec2-user@35.159.95.208 \"sudo systemctl restart miniaws-frontend\""
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
                  <code style={{ fontSize: "13px", color: "#38bdf8", fontFamily: "monospace" }}>{item.cmd}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(item.cmd, `cli-${idx}`)}
                  className="secondary-btn"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
                >
                  {copiedText === `cli-${idx}` ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  <span>Copy</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
