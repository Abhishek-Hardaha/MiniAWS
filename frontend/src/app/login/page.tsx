"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Server,
  Zap,
  Globe,
  Terminal,
  Activity,
  Cpu,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginUser({ email, password });
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, personaKey: string) => {
    setActivePersona(personaKey);
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginUser({ email: demoEmail, password: "password123" });
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in with persona account.");
    } finally {
      setLoading(false);
      setActivePersona(null);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Ambient background glowing orbs */}
      <div className="auth-ambient-orb-1" />
      <div className="auth-ambient-orb-2" />
      <div className="auth-ambient-grid" />

      <div className="auth-glass-container">
        {/* Left Side: Modern Interactive Cloud Topology Hero Showcase */}
        <div className="auth-hero-pane" style={{ paddingRight: "10px" }}>
          {/* Cloud Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "20px",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.15)",
            }}
          >
            <Sparkles size={14} className="spin-slow" />
            <span>MiniAWS Multi-Cloud Fabric • eu-central-1</span>
          </div>

          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            Next-Gen Multi-Tier <br />
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cloud Infrastructure.
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px", maxWidth: "480px" }}>
            Serverless functions with sub-millisecond execution, instant static hosting with custom domains, and governed AWS EC2 clusters.
          </p>

          {/* Interactive Live 3-Tier Multi-EC2 Topology Card */}
          <div
            style={{
              background: "rgba(10, 16, 30, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "20px",
              backdropFilter: "blur(16px)",
              marginBottom: "28px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#e2e8f0" }}>
                <Activity size={15} color="#34d399" />
                <span>3-Tier Multi-EC2 Telemetry Fabric</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
                <span className="pulse-live-dot" />
                <span>All Nodes Healthy</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Node 1: App Tier */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Server size={14} color="#60a5fa" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>EC2-1: App &amp; Gateway Tier</div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontFamily: "var(--font-mono)" }}>35.159.95.208 • Next.js &amp; FastAPI</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "var(--font-mono)", fontWeight: 600 }}>0.4ms ping</span>
              </div>

              {/* Node 2: Data Tier */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(20, 184, 166, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Globe size={14} color="#14b8a6" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>EC2-2: Data &amp; Hosting Tier</div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontFamily: "var(--font-mono)" }}>3.127.237.130 • PostgreSQL 16 &amp; Nginx</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "#14b8a6", fontFamily: "var(--font-mono)", fontWeight: 600 }}>0.8ms ping</span>
              </div>

              {/* Node 3: Execution Tier */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={14} color="#a855f7" />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>EC2-3: Execution Lambda Tier</div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontFamily: "var(--font-mono)" }}>3.71.47.123 • MicroVM Runner &amp; Cron</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "#c084fc", fontFamily: "var(--font-mono)", fontWeight: 600 }}>0.3ms cold start</span>
              </div>
            </div>
          </div>

          {/* Feature Badges Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <CheckCircle2 size={14} color="#38bdf8" />
              <span>Multi-Tenant Namespace Quotas</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <CheckCircle2 size={14} color="#34d399" />
              <span>Custom Subdomains &amp; URLs</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <CheckCircle2 size={14} color="#a855f7" />
              <span>Isolated Execution Sandboxes</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <CheckCircle2 size={14} color="#f59e0b" />
              <span>Protected XRDP Linux Desktop GUI</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Frosted Glassmorphism Login Console Card */}
        <div className="auth-card">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(168, 85, 247, 0.3))",
                border: "1px solid rgba(56, 189, 248, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 0 24px rgba(56, 189, 248, 0.35)",
              }}
            >
              <Cloud size={30} color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Sign in to Mini AWS
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
              Authenticate with your tenant account or select a quick persona
            </p>
          </div>

          {/* Quick Demo Sign-in Personas */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", textAlign: "center", marginBottom: "10px" }}>
              ⚡ 1-Click Fast Persona Sign In
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Admin Persona: Abhishek */}
              <button
                type="button"
                className="auth-quick-persona-btn"
                onClick={() => handleQuickLogin("abhishek.hardaha.0111@gmail.com", "admin")}
                disabled={loading}
                style={{
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  background: activePersona === "admin" ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.05)",
                }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShieldCheck size={16} color="#f59e0b" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>Abhishek</span>
                    <span style={{ fontSize: "10px", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                      ROOT ADMIN
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Full Admin Stats &amp; Protected XRDP GUI
                  </div>
                </div>
              </button>

              {/* Developer Persona: Aarav */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  className="auth-quick-persona-btn"
                  onClick={() => handleQuickLogin("aarav@miniaws.com", "aarav")}
                  disabled={loading}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Zap size={14} color="#38bdf8" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "12px" }}>Aarav Sharma</div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>Developer</div>
                  </div>
                </button>

                <button
                  type="button"
                  className="auth-quick-persona-btn"
                  onClick={() => handleQuickLogin("sarah@miniaws.com", "sarah")}
                  disabled={loading}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Terminal size={14} color="#c084fc" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "12px" }}>Sarah Connor</div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>DevOps</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
            <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
              Or sign in with email
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                padding: "12px 14px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#f87171",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="auth-interactive-input"
                />
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-interactive-input"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Console"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Register Link */}
          <div style={{ marginTop: "22px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
            Don't have a MiniAWS tenant account?{" "}
            <Link href="/register" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>
              Create an account →
            </Link>
          </div>

          {/* Security footnote */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "18px", fontSize: "11px", color: "#64748b" }}>
            <Lock size={12} color="#64748b" />
            <span>256-bit PBKDF2 Encryption &amp; Multi-Tenant Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
