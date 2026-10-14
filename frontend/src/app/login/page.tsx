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
  Server,
  Globe,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { loginUser } from "@/lib/api";
import BorderGlow from "@/components/BorderGlow";
import Dither from "@/components/Dither";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="auth-page-wrapper">
      {/* Ambient background glowing orbs */}
      <div className="auth-ambient-orb-1" />
      <div className="auth-ambient-orb-2" />
      <div className="auth-ambient-grid" />

      {/* Interactive Dither Wave Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.75,
        }}
      >
        <Dither
          ditherMode="bayer"
          palette={['#040816', '#0a1d3d', '#114485', '#0284c7', '#38bdf8']}
          pixelSize={3}
          scale={1.25}
          waveSpeed={0.03}
          waveFrequency={2.2}
          waveAmplitude={0.32}
          contrast={1.2}
          brightness={0.01}
          mouseEffect="ripple"
          mouseRadius={0.38}
          mouseStrength={1.2}
          trail={0.28}
          clickRipple={true}
          intro={false}
        />
      </div>

      <div className="auth-glass-container">
        {/* Left Side: Modern Interactive Cloud Topology Hero Showcase */}
        <div className="auth-hero-pane" style={{ paddingRight: "10px" }}>
          {/* Unified Showcase Glass Card */}
          <div
            style={{
              background: "rgba(10, 16, 32, 0.78)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              borderRadius: "24px",
              padding: "26px 26px 22px 26px",
              marginBottom: "18px",
              boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03)",
            }}
          >
            {/* Cloud Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Sparkles size={14} className="spin-slow" />
              <span>StackSync Multi-Cloud Fabric • eu-central-1</span>
            </div>

            <h1
              style={{
                fontSize: "34px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                marginBottom: "14px",
              }}
            >
              <span style={{ color: "#ffffff", textShadow: "0 2px 20px rgba(0, 0, 0, 0.9)" }}>
                Next-Gen Multi-Tier
              </span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                Cloud Infrastructure.
              </span>
            </h1>

            <p style={{ color: "#cbd5e1", fontSize: "14.5px", lineHeight: 1.6, margin: 0, maxWidth: "480px" }}>
              Serverless functions with sub-millisecond execution, instant static hosting with custom domains, and governed AWS EC2 clusters.
            </p>

            {/* Elegant Translucent Divider between Hero & Telemetry */}
            <div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(56,189,248,0.2) 50%, rgba(255,255,255,0.04) 100%)",
                margin: "22px 0 18px 0",
              }}
            />
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
            {[
              { icon: CheckCircle2, color: "#38bdf8", text: "Multi-Tenant Namespace Quotas" },
              { icon: CheckCircle2, color: "#34d399", text: "Custom Subdomains & URLs" },
              { icon: CheckCircle2, color: "#c084fc", text: "Isolated Execution Sandboxes" },
              { icon: CheckCircle2, color: "#f59e0b", text: "Protected XRDP Linux Desktop GUI" },
            ].map((badge, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  background: "rgba(11, 18, 34, 0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "9px 13px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
                  fontWeight: 500,
                }}
              >
                <badge.icon size={14} color={badge.color} style={{ flexShrink: 0 }} />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: The Frosted Glassmorphism Login Console Card with Interactive Border Glow */}
        <BorderGlow
          className="auth-card"
          edgeSensitivity={30}
          glowColor="195 90 70"
          backgroundColor="#0c1427"
          borderRadius={28}
          glowRadius={36}
          glowIntensity={1.2}
          coneSpread={28}
          animated={true}
          colors={['#38bdf8', '#818cf8', '#c084fc']}
          fillOpacity={0}
        >
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
              Sign in to StackSync
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
              Enter your tenant credentials to access the cloud console
            </p>
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
            Don't have a StackSync tenant account?{" "}
            <Link href="/register" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>
              Create an account →
            </Link>
          </div>

          {/* Security footnote */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "18px", fontSize: "11px", color: "#64748b" }}>
            <Lock size={12} color="#64748b" />
            <span>256-bit PBKDF2 Encryption &amp; Multi-Tenant Isolation</span>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
