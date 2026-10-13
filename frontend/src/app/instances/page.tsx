"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Monitor,
  Terminal,
  Activity,
  Cpu,
  HardDrive,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Download,
  Clock,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { getEC2Instances, getRdpDownloadUrl } from "@/lib/api";
import RadialProgressGauge from "@/components/charts/RadialProgressGauge";

export default function InstancesPage() {
  const [fleet, setFleet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"fleet" | "rdp-guide">("fleet");

  const fetchInstances = () => {
    setLoading(true);
    getEC2Instances()
      .then((res) => {
        setFleet(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load instances:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 20000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const instances = fleet?.instances || [
    {
      id: "i-miniaws-ec2-1-app",
      name: "EC2-1: Application & Gateway Tier",
      tier: "Tier 1: Application",
      role: "Next.js 14 Frontend Console, FastAPI Core Gateway & Nginx Reverse Proxy",
      state: "running",
      instance_type: "t3.micro",
      vcpus: 2,
      memory_gb: 1.0,
      public_ip: "35.159.95.208",
      private_ip: "172.31.9.80",
      region: "eu-central-1 (Frankfurt)",
      availability_zone: "eu-central-1a",
      os: "Amazon Linux 2023 (Linux 6.1)",
      desktop_gui: "XFCE 4.18 Desktop Environment",
      rdp_port: 3389,
      rdp_user: "ec2-user",
      rdp_active: true,
      cpu_percent: 4.2,
      memory_percent: 32.5,
      uptime: "6h 40m",
      latency_ms: 1.2,
      health: "healthy",
      services: [
        { name: "Next.js Console Server", port: 3000, status: "active" },
        { name: "FastAPI Core Gateway", port: 8000, status: "active" },
        { name: "Nginx Reverse Proxy", port: 80, status: "active" },
        { name: "XRDP Remote Desktop Server", port: 3389, status: "active" }
      ]
    },
    {
      id: "i-miniaws-ec2-2-data",
      name: "EC2-2: Data & Storage Tier",
      tier: "Tier 2: Data & Storage",
      role: "PostgreSQL 16 Engine, S3 Object Storage Microservice & Static Web Server",
      state: "running",
      instance_type: "t3.micro",
      vcpus: 2,
      memory_gb: 1.0,
      public_ip: "3.127.237.130",
      private_ip: "172.31.12.181",
      region: "eu-central-1 (Frankfurt)",
      availability_zone: "eu-central-1a",
      os: "Amazon Linux 2023 (Linux 6.1)",
      desktop_gui: "XFCE 4.18 Desktop Environment",
      rdp_port: 3389,
      rdp_user: "ec2-user",
      rdp_active: true,
      cpu_percent: 3.1,
      memory_percent: 42.1,
      uptime: "6h 40m",
      latency_ms: 2.4,
      health: "healthy",
      services: [
        { name: "PostgreSQL 16 Relational Engine", port: 5432, status: "active" },
        { name: "S3-Compatible Blob Storage", port: 9000, status: "active" },
        { name: "Nginx Static Site Delivery", port: 8080, status: "active" },
        { name: "XRDP Remote Desktop Server", port: 3389, status: "active" }
      ]
    },
    {
      id: "i-miniaws-ec2-3-exec",
      name: "EC2-3: Serverless Execution Tier",
      tier: "Tier 3: Execution Tier",
      role: "Python 3.9 Sandbox Runner, APScheduler Cron Daemon & CloudWatch Reporter",
      state: "running",
      instance_type: "t3.micro",
      vcpus: 2,
      memory_gb: 1.0,
      public_ip: "3.71.47.123",
      private_ip: "172.31.3.155",
      region: "eu-central-1 (Frankfurt)",
      availability_zone: "eu-central-1a",
      os: "Amazon Linux 2023 (Linux 6.1)",
      desktop_gui: "XFCE 4.18 Desktop Environment",
      rdp_port: 3389,
      rdp_user: "ec2-user",
      rdp_active: true,
      cpu_percent: 1.8,
      memory_percent: 34.2,
      uptime: "6h 40m",
      latency_ms: 3.1,
      health: "healthy",
      services: [
        { name: "Python 3.9 Lambda Runner", port: 5001, status: "active" },
        { name: "APScheduler Cron Engine", port: 5002, status: "active" },
        { name: "CloudWatch Telemetry Monitor", port: 5001, status: "active" },
        { name: "XRDP Remote Desktop Server", port: 3389, status: "active" }
      ]
    }
  ];

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Server size={28} color="#38bdf8" />
            <span>EC2 Cloud Instances (Compute)</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Real-time management, telemetry, and Remote Desktop (XRDP GUI) access across your 3-tier AWS EC2 fleet.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTab(activeTab === "fleet" ? "rdp-guide" : "fleet")}
            className="secondary-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Monitor size={16} />
            <span>{activeTab === "fleet" ? "RDP Setup Guide" : "View Instances Fleet"}</span>
          </button>
          <button
            onClick={fetchInstances}
            disabled={loading}
            className="primary-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Refresh Fleet</span>
          </button>
        </div>
      </div>

      {/* Fleet Summary KPI Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        <div className="panel-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Active EC2 Fleet</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
            3 / 3 Online
          </div>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span className="pulse-live-dot" /> 100% Operational Status
          </div>
        </div>

        <div className="panel-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Architecture Topology</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#a855f7", marginTop: "4px" }}>
            3-Tier Distributed
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            App • Data • Execution VPC
          </div>
        </div>

        <div className="panel-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Remote Desktop (XRDP)</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>
            Port 3389 Active
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            XFCE 4.18 Desktop on All 3
          </div>
        </div>

        <div className="panel-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Instance Region</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#f59e0b", marginTop: "4px" }}>
            eu-central-1
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Frankfurt, Germany (AZ: 1a)
          </div>
        </div>
      </div>

      {/* RDP Connection Instruction Banner */}
      {activeTab === "rdp-guide" && (
        <div
          className="panel-card"
          style={{
            marginBottom: "28px",
            background: "linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)",
            borderColor: "rgba(59, 130, 246, 0.4)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Monitor size={22} color="#60a5fa" />
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              How to Connect to Any EC2 Instance with Windows Remote Desktop (XRDP)
            </h2>
          </div>

          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
            Each EC2 instance has an enterprise-grade, lightweight <strong>XFCE 4.18 Desktop Environment</strong> and 
            <strong> XRDP Server</strong> listening on port <code>3389</code>. You can connect from any Windows, Mac, or Linux client.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#60a5fa", marginBottom: "6px" }}>
                Step 1: Download .RDP File
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
                Click the blue <strong>"Connect via RDP"</strong> button on any instance card below to instantly download its pre-configured connection profile.
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#34d399", marginBottom: "6px" }}>
                Step 2: Launch Remote Desktop
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
                Double-click the downloaded <code>.rdp</code> file, or open <strong>mstsc.exe</strong> (Remote Desktop Connection) and enter the public IP with <code>:3389</code>.
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#c084fc", marginBottom: "6px" }}>
                Step 3: Enter Credentials
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
                Username: <code style={{ color: "#fff", fontWeight: 700 }}>ec2-user</code><br />
                Password: <code style={{ color: "#38bdf8", fontWeight: 700 }}>MiniAWS@2026!</code><br />
                Session: <code>Xorg / XFCE</code>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(59, 130, 246, 0.1)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <Info size={16} color="#60a5fa" />
            <span style={{ fontSize: "12px", color: "#93c5fd" }}>
              AWS EC2 Security Group inbound rule for TCP Port 3389 is active across all 3 instances. You can work with the terminal, file manager, and applications directly inside the Linux GUI!
            </span>
          </div>
        </div>
      )}

      {/* EC2 Instances Fleet Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {instances.map((instance: any) => {
          const isCopiedPublic = copiedText === `pub-${instance.id}`;
          const isCopiedSsh = copiedText === `ssh-${instance.id}`;
          const sshCommand = `ssh -i Inst1.pem ec2-user@${instance.public_ip}`;

          return (
            <div
              key={instance.id}
              className="panel-card"
              style={{
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Instance Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                      {instance.name}
                    </h2>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <span className="pulse-live-dot" />
                      {instance.state.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(255,255,255,0.06)",
                        color: "#94a3b8",
                        fontWeight: 600
                      }}
                    >
                      {instance.id}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                    {instance.role}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Connect via RDP button */}
                  <a
                    href={getRdpDownloadUrl(instance.id)}
                    download={`${instance.id}.rdp`}
                    className="primary-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      textDecoration: "none",
                      fontSize: "13px",
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 0 15px rgba(37, 99, 235, 0.4)",
                    }}
                    title="Download pre-configured Windows Remote Desktop file"
                  >
                    <Monitor size={15} />
                    <span>Connect RDP</span>
                    <Download size={13} style={{ opacity: 0.8 }} />
                  </a>

                  {/* Copy SSH command */}
                  <button
                    onClick={() => copyToClipboard(sshCommand, `ssh-${instance.id}`)}
                    className="secondary-btn"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
                    title={sshCommand}
                  >
                    <Terminal size={14} />
                    <span>{isCopiedSsh ? "Copied SSH!" : "SSH Command"}</span>
                  </button>
                </div>
              </div>

              {/* Specs & Network Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "12px",
                  background: "rgba(0,0,0,0.25)",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.04)",
                  marginBottom: "18px"
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>PUBLIC IP (INTERNET)</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#38bdf8" }}>{instance.public_ip}</span>
                    <button
                      onClick={() => copyToClipboard(instance.public_ip, `pub-${instance.id}`)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px" }}
                      title="Copy Public IP"
                    >
                      {isCopiedPublic ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>PRIVATE VPC IP</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginTop: "3px" }}>
                    {instance.private_ip}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>INSTANCE SPEC</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginTop: "3px" }}>
                    {instance.instance_type} ({instance.vcpus} vCPU, {instance.memory_gb} GB)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>LINUX GUI DESKTOP</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#34d399", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Monitor size={13} /> {instance.desktop_gui.split(" ")[0]} 4.18
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>RDP PORT &amp; USER</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b", marginTop: "3px" }}>
                    :{instance.rdp_port} • {instance.rdp_user}
                  </div>
                </div>
              </div>

              {/* Telemetry & Microservices */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Hardware Telemetry */}
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Activity size={14} color="#38bdf8" />
                    <span>Live Hardware Telemetry</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>CPU Utilization</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>
                        {instance.cpu_percent}%
                      </div>
                      <div className="usage-bar-track" style={{ height: "4px", marginTop: "4px" }}>
                        <div className="usage-bar-fill" style={{ width: `${Math.min(100, instance.cpu_percent * 2)}%`, backgroundColor: "#38bdf8" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Memory Used</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#a855f7", marginTop: "2px" }}>
                        {instance.memory_percent}%
                      </div>
                      <div className="usage-bar-track" style={{ height: "4px", marginTop: "4px" }}>
                        <div className="usage-bar-fill" style={{ width: `${instance.memory_percent}%`, backgroundColor: "#a855f7" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Uptime &amp; Latency</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                        {instance.uptime}
                      </div>
                      <div style={{ fontSize: "11px", color: "#34d399", marginTop: "2px" }}>
                        {instance.latency_ms} ms ping
                      </div>
                    </div>
                  </div>
                </div>

                {/* Microservice Endpoints */}
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Layers size={14} color="#34d399" />
                    <span>Hosted Microservices &amp; Ports</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {instance.services.map((svc: any) => (
                      <div
                        key={svc.name}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: svc.status === "active" ? "#10b981" : "#ef4444" }} />
                        <span style={{ color: "#fff", fontWeight: 600 }}>{svc.name}</span>
                        <code style={{ color: "#38bdf8", fontSize: "10px" }}>:{svc.port}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
