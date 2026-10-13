"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cloud, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { loginUser } from "@/lib/api";

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

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginUser({ email: demoEmail, password: "password123" });
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in with demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 20%, #111a33 0%, #060b13 70%, #03060a 100%)",
        padding: "20px",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "rgba(13, 20, 36, 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "36px 32px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
            }}
          >
            <Cloud size={28} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Sign in to Mini AWS
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
            Multi-Tier Cloud Control Console (3× EC2 Tiers)
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "20px",
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

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>
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
                placeholder="aarav@miniaws.com"
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "12px 14px 12px 42px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1" }}>
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
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "12px 42px 12px 42px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                }}
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
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "transform 0.15s, opacity 0.15s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span>{loading ? "Authenticating..." : "Sign In to Console"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Login Section */}
        <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, textAlign: "center", marginBottom: "14px" }}>
            1-Click Quick Demo Sign In
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("aarav@miniaws.com")}
              style={{
                padding: "10px 12px",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "10px",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
              }}
            >
              <div style={{ fontWeight: 700 }}>Aarav Sharma</div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>aarav@miniaws.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("sarah@miniaws.com")}
              style={{
                padding: "10px 12px",
                background: "rgba(168, 85, 247, 0.08)",
                border: "1px solid rgba(168, 85, 247, 0.25)",
                borderRadius: "10px",
                color: "#c084fc",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
              }}
            >
              <div style={{ fontWeight: 700 }}>Sarah Connor</div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>sarah@miniaws.com</div>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
