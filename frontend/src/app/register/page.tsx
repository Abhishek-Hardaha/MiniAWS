"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Check,
  Sparkles,
  Server,
  Database,
  Globe,
  Zap,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derive preview username slug
  const previewUsername = email.includes("@")
    ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "")
    : fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "username";

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "Enter password", color: "#64748b" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
    if (score === 2) return { score: 2, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 3, label: "Good", color: "#38bdf8" };
    return { score: 4, label: "Strong", color: "#34d399" };
  };

  const strength = getPasswordStrength();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        full_name: fullName,
        email,
        password,
      });
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Email may already be registered.");
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

      <div className="auth-glass-container">
        {/* Left Side: Modern Interactive Plan & Quota Showcase */}
        <div className="auth-hero-pane" style={{ paddingRight: "10px" }}>
          {/* Cloud Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(168, 85, 247, 0.1)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              color: "#c084fc",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "20px",
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.15)",
            }}
          >
            <Sparkles size={14} className="spin-slow" />
            <span>Instant Developer Tier Provisioning</span>
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
            Deploy Faster with <br />
            <span
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Isolated Sandboxes.
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.6, marginBottom: "26px", maxWidth: "480px" }}>
            Every account receives dedicated namespace quotas on our 3-tier AWS EC2 cloud cluster with zero setup required.
          </p>

          {/* Interactive Included Cloud Quotas Card */}
          <div
            style={{
              background: "rgba(10, 16, 30, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "20px",
              backdropFilter: "blur(16px)",
              marginBottom: "26px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#e2e8f0" }}>
                <Cpu size={15} color="#38bdf8" />
                <span>Default Free Tier Allowances</span>
              </div>
              <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "9999px" }}>
                FREE FOREVER
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Quota 1 */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Database size={15} color="#14b8a6" />
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Cloud Storage</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>100 MB Limit</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Isolated MinIO Bucket</div>
              </div>

              {/* Quota 2 */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Globe size={15} color="#3b82f6" />
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Static Web Hosting</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>3 Live Websites</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Nginx Edge Virtual Hosts</div>
              </div>

              {/* Quota 3 */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Zap size={15} color="#a855f7" />
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Lambda Functions</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>5 Serverless APIs</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Python 3.9 MicroVMs</div>
              </div>

              {/* Quota 4 */}
              <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Server size={15} color="#f59e0b" />
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Invocations</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>1,000 / Month</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Live CloudWatch Telemetry</div>
              </div>
            </div>
          </div>

          {/* Feature Badges List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <CheckCircle2 size={14} color="#34d399" />
              <span>Full API Gateway access with custom route mappings</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <CheckCircle2 size={14} color="#34d399" />
              <span>Dedicated static URL: <code style={{ color: "#38bdf8" }}>/sites/{previewUsername}/</code></span>
            </div>
          </div>
        </div>

        {/* Right Side: The Frosted Glassmorphism Registration Console Card */}
        <div className="auth-card">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(56, 189, 248, 0.3))",
                border: "1px solid rgba(168, 85, 247, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 0 24px rgba(168, 85, 247, 0.35)",
              }}
            >
              <Cloud size={30} color="#c084fc" />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Create Cloud Account
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
              Provision your isolated developer workspace on StackSync
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

          <form onSubmit={handleRegister}>
            {/* Full Name */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="auth-interactive-input"
                />
              </div>
            </div>

            {/* Email Address */}
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
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Tenant URL slug:</span>
                <code style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                  /sites/{previewUsername}/
                </code>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                Password (min. 6 characters)
              </label>
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

              {/* Interactive Animated Password Strength Meter */}
              {password.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>Password Strength</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px", height: "4px" }}>
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          flex: 1,
                          height: "100%",
                          borderRadius: "2px",
                          background: step <= strength.score ? strength.color : "rgba(255, 255, 255, 0.08)",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
              style={{ marginTop: "8px" }}
            >
              <span>{loading ? "Provisioning Sandbox..." : "Create Free Cloud Account"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Login Link */}
          <div style={{ marginTop: "22px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#c084fc", fontWeight: 700, textDecoration: "none" }}>
              Sign in to Console →
            </Link>
          </div>

          {/* Security footnote */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "18px", fontSize: "11px", color: "#64748b" }}>
            <ShieldCheck size={13} color="#34d399" />
            <span>Multi-Tenant VPC Network Isolation &amp; Zero Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
