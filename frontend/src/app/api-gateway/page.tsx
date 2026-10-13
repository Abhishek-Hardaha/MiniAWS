"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Plus,
  Play,
  Key,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Zap,
  RefreshCw,
  X,
  Code2,
  Terminal,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { listApiRoutes, createApiRoute, deleteApiRoute, listFunctions, getDashboardSummary } from "@/lib/api";
import RadialProgressGauge from "@/components/charts/RadialProgressGauge";
import BarMetricChart, { BarMetricItem } from "@/components/charts/BarMetricChart";

export default function ApiGatewayPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [copiedRouteId, setCopiedRouteId] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<"response" | "curl">("response");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("GET");
  const [selectedFuncId, setSelectedFuncId] = useState("");
  const [requiresKey, setRequiresKey] = useState(false);
  const [rateLimitRpm, setRateLimitRpm] = useState(60);

  // API Tester State
  const [activeTestRoute, setActiveTestRoute] = useState<any | null>(null);
  const [testMethod, setTestMethod] = useState("GET");
  const [testBody, setTestBody] = useState('{\n  "data": [10, 50, 100]\n}');
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = () => {
    listApiRoutes()
      .then((res) => {
        setRoutes(res);
        if (res.length > 0 && !activeTestRoute) {
          setActiveTestRoute(res[0]);
          setTestMethod(res[0].http_method);
        }
      })
      .catch((err) => console.error(err));

    listFunctions()
      .then((res) => {
        setFunctions(res);
        if (res.length > 0 && !selectedFuncId) {
          setSelectedFuncId(res[0].id);
        }
      })
      .catch((err) => console.error(err));

    getDashboardSummary()
      .then((res) => setQuota(res.quotas))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApiRoute({
        path: path.trim().replace(/^\//, ""),
        http_method: method,
        function_id: selectedFuncId,
        requires_api_key: requiresKey,
        rate_limit_rpm: rateLimitRpm,
      });
      setNewModalOpen(false);
      setPath("");
      loadData();
      showToast(`Route /${path} created successfully!`, "success");
    } catch (err: any) {
      showToast(`Error creating route: ${err.message}`, "error");
    }
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this API route?")) return;
    try {
      await deleteApiRoute(routeId);
      loadData();
      showToast("API route deleted.", "success");
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleRunApiTest = async () => {
    if (!activeTestRoute) return;
    setTesting(true);
    setTestResponse(null);

    const start = performance.now();
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeTestRoute.requires_api_key && activeTestRoute.api_key) {
        headers["X-Api-Key"] = activeTestRoute.api_key;
      }

      const options: RequestInit = {
        method: testMethod,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(testMethod) && testBody.trim()) {
        options.body = testBody;
      }

      const res = await fetch(activeTestRoute.endpoint_url, options);
      const duration = Math.round(performance.now() - start);

      let bodyData: any;
      const text = await res.text();
      try {
        bodyData = JSON.parse(text);
      } catch {
        bodyData = text;
      }

      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        duration,
        data: bodyData,
        sizeBytes: new Blob([text]).size,
      });
      showToast(`HTTP ${res.status} ${res.statusText} (${duration} ms)`, res.status < 400 ? "success" : "error");
    } catch (err: any) {
      setTestResponse({
        status: 500,
        statusText: "Network Error",
        duration: Math.round(performance.now() - start),
        data: { error: err.message },
        sizeBytes: 0,
      });
      showToast(`Network error: ${err.message}`, "error");
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRouteId(id);
    setTimeout(() => setCopiedRouteId(null), 2500);
    showToast("Endpoint URL copied to clipboard!", "success");
  };

  const generateCurlCommand = () => {
    if (!activeTestRoute) return "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://api.miniaws.cloud";
    const fullUrl = `${baseUrl}${activeTestRoute.endpoint_url}`;
    let cmd = `curl -X ${testMethod} "${fullUrl}" \\\n  -H "Content-Type: application/json"`;
    if (activeTestRoute.requires_api_key && activeTestRoute.api_key) {
      cmd += ` \\\n  -H "X-Api-Key: ${activeTestRoute.api_key}"`;
    }
    if (["POST", "PUT"].includes(testMethod) && testBody.trim()) {
      const escapedBody = testBody.replace(/"/g, '\\"').replace(/\n/g, "");
      cmd += ` \\\n  -d "${escapedBody}"`;
    }
    return cmd;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(generateCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
    showToast("cURL command copied to clipboard!", "success");
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Share2 size={26} color="#f97316" />
            API Gateway
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Expose serverless functions as public or authenticated REST endpoints with rate limiting.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setNewModalOpen(true)}>
          <Plus size={16} />
          <span>Create API Endpoint</span>
        </button>
      </div>

      {/* Gateway Telemetry & Analytics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1.4fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Daily Requests Radial Gauge */}
        <div className="chart-panel-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <RadialProgressGauge
            value={quota?.api_requests_today || 0}
            max={quota?.api_requests_max || 500}
            color="#38bdf8"
            label="Daily Gateway Quota"
            sub={`${quota?.api_requests_today || 0} / ${quota?.api_requests_max || 500} calls today`}
            size={130}
            strokeWidth={11}
          />
        </div>

        {/* Route Traffic Volume Bars */}
        <div className="chart-panel-card">
          <BarMetricChart
            items={
              routes.length > 0
                ? routes.slice(0, 4).map((rt, i) => {
                    const colors = ["#f97316", "#38bdf8", "#10b981", "#8b5cf6"];
                    const maxHits = Math.max(...routes.map((r) => r.requests_count || 0), 1);
                    return {
                      label: `/${rt.path} (${rt.http_method})`,
                      value: rt.requests_count || 0,
                      max: maxHits,
                      displayValue: `${rt.requests_count || 0} calls`,
                      color: colors[i % colors.length],
                      icon: <Zap size={14} color={colors[i % colors.length]} />,
                    };
                  })
                : [
                    {
                      label: "/api/summary (GET)",
                      value: 12,
                      max: 20,
                      displayValue: "12 calls",
                      color: "#f97316",
                      icon: <Zap size={14} color="#f97316" />,
                    },
                  ]
            }
            title="Endpoint Traffic Volume"
            subtitle="Request distribution across active REST routes"
          />
        </div>

        {/* Gateway Security & Edge Node Status */}
        <div className="chart-panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
              Gateway Engine Status
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Reverse Proxy on EC2-1 (:8000)
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Active Routes:</span>
              <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                {routes.length} / 5
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Security Filter:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>
                API Key &amp; Rate Limits
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Gateway Health:</span>
              <span style={{ color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="pulse-live-dot" /> Online
              </span>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "#64748b", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            Synchronous proxy dispatch with zero latency overhead
          </div>
        </div>
      </div>

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

      {/* Grid: Configured Routes & Interactive API Tester */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
        {/* Left Column: Routes List */}
        <div className="panel-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                Active REST Routes ({routes.length} / 5)
              </h2>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                Synchronous Reverse Proxy via EC2-1 Nginx &amp; FastAPI Core
              </div>
            </div>
            <button className="icon-btn" onClick={loadData} title="Refresh routes">
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {routes.map((rt) => {
              const isSelected = activeTestRoute?.id === rt.id;
              let methodBg = "rgba(59, 130, 246, 0.15)";
              let methodColor = "#60a5fa";
              let methodBorder = "rgba(59, 130, 246, 0.35)";

              if (rt.http_method === "GET") {
                methodBg = "rgba(16, 185, 129, 0.15)";
                methodColor = "#34d399";
                methodBorder = "rgba(16, 185, 129, 0.35)";
              } else if (rt.http_method === "POST") {
                methodBg = "rgba(56, 189, 248, 0.15)";
                methodColor = "#38bdf8";
                methodBorder = "rgba(56, 189, 248, 0.35)";
              } else if (rt.http_method === "PUT") {
                methodBg = "rgba(245, 158, 11, 0.15)";
                methodColor = "#fbbf24";
                methodBorder = "rgba(245, 158, 11, 0.35)";
              } else if (rt.http_method === "DELETE") {
                methodBg = "rgba(239, 68, 68, 0.15)";
                methodColor = "#f87171";
                methodBorder = "rgba(239, 68, 68, 0.35)";
              }

              const isCopied = copiedRouteId === rt.id;

              return (
                <div
                  key={rt.id}
                  onClick={() => {
                    setActiveTestRoute(rt);
                    setTestMethod(rt.http_method);
                  }}
                  style={{
                    background: isSelected ? "rgba(249, 115, 22, 0.12)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isSelected ? "rgba(249, 115, 22, 0.5)" : "var(--border-subtle)"}`,
                    borderRadius: "14px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          backgroundColor: methodBg,
                          color: methodColor,
                          border: `1px solid ${methodBorder}`,
                          fontWeight: 800,
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {rt.http_method}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: isSelected ? "#fb923c" : "#fff", fontFamily: "var(--font-mono)" }}>
                        /{rt.path}
                      </span>
                    </div>

                    <button
                      className="icon-btn"
                      style={{ width: "28px", height: "28px", color: "#f87171" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rt.id);
                      }}
                      title="Delete Route"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Route metadata */}
                  <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Code2 size={13} color="#c084fc" />
                      <span>Lambda: <strong style={{ color: "#c084fc" }}>{rt.function_name}</strong></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Clock size={13} color="#38bdf8" />
                      <span>Rate Limit: <strong style={{ color: "#38bdf8" }}>{rt.rate_limit_rpm} rpm</strong></span>
                    </div>
                    {rt.requires_api_key && (
                      <span className="cloud-metric-chip cloud-metric-amber" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        <Key size={10} style={{ marginRight: "3px" }} />
                        API Key Required
                      </span>
                    )}
                  </div>

                  {/* Full invocation URL box */}
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "#60a5fa",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rt.endpoint_url}
                    </span>
                    <button
                      className="icon-btn"
                      style={{ width: "24px", height: "24px", marginLeft: "8px", color: isCopied ? "#34d399" : "#94a3b8" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        copyToClipboard(`${origin}${rt.endpoint_url}`, rt.id);
                      }}
                      title="Copy full invocation URL"
                    >
                      {isCopied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live API Gateway Tester & cURL Generator */}
        <div className="panel-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              API Request Runner &amp; cURL Generator
            </h2>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setActiveTab("response")}
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "response" ? "rgba(249, 115, 22, 0.2)" : "transparent",
                  color: activeTab === "response" ? "#fb923c" : "#64748b",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Tester
              </button>
              <button
                onClick={() => setActiveTab("curl")}
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "curl" ? "rgba(249, 115, 22, 0.2)" : "transparent",
                  color: activeTab === "curl" ? "#fb923c" : "#64748b",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                cURL Snippet
              </button>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "16px" }}>
            Simulate real HTTP client requests directly through your live Amazon API Gateway endpoints.
          </p>

          {activeTestRoute ? (
            <div>
              {/* Request URL Input */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <select
                  className="form-select"
                  style={{ width: "105px", fontWeight: 700 }}
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  readOnly
                  className="form-input"
                  style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "12px", color: "#38bdf8" }}
                  value={activeTestRoute.endpoint_url}
                />

                <button className="btn-primary" onClick={handleRunApiTest} disabled={testing}>
                  <Play size={15} />
                  <span>{testing ? "Sending..." : "Send"}</span>
                </button>
              </div>

              {/* Request Body Editor with Presets */}
              {["POST", "PUT"].includes(testMethod) && (
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="form-label" style={{ margin: 0 }}>Request Body (JSON)</label>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        type="button"
                        onClick={() => setTestBody('{\n  "data": [10, 50, 100, 250]\n}')}
                        style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#94a3b8", cursor: "pointer" }}
                      >
                        Batch Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestBody('{\n  "name": "Cloud Admin",\n  "action": "trigger"\n}')}
                        style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#94a3b8", cursor: "pointer" }}
                      >
                        Payload
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: "100px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                  />
                </div>
              )}

              {/* Tab 1: HTTP Response Inspector */}
              {activeTab === "response" && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      HTTP Response
                    </span>
                    {testResponse && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span className={`status-pill ${testResponse.status < 400 ? "status-success" : "status-error"}`}>
                          {testResponse.status} {testResponse.statusText}
                        </span>
                        <span className="status-pill status-success">
                          {testResponse.duration} ms
                        </span>
                        {testResponse.sizeBytes > 0 && (
                          <span className="status-pill" style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}>
                            {(testResponse.sizeBytes / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="terminal-console" style={{ minHeight: "160px" }}>
                    {!testResponse && !testing && (
                      <span style={{ color: "#64748b" }}>
                        Click <strong>&quot;Send&quot;</strong> to execute real request against this live API route.
                      </span>
                    )}
                    {testing && <span style={{ color: "#60a5fa" }}>Routing through Amazon API Gateway &amp; invoking Lambda...</span>}
                    {testResponse && (
                      <pre style={{ color: "#34d399", fontSize: "12px", margin: 0, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(testResponse.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: cURL Command Generator */}
              {activeTab === "curl" && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      cURL Terminal Command
                    </span>
                    <button
                      onClick={copyCurl}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        color: copiedCurl ? "#34d399" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {copiedCurl ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
                    </button>
                  </div>

                  <div className="terminal-console" style={{ minHeight: "160px" }}>
                    <pre style={{ color: "#38bdf8", fontSize: "12px", margin: 0, whiteSpace: "pre-wrap" }}>
                      {generateCurlCommand()}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              Select an API route to test or inspect.
            </div>
          )}
        </div>
      </div>

      {/* Create Route Modal */}
      {newModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                Create API Gateway Route
              </h2>
              <button className="icon-btn" onClick={() => setNewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoute}>
              <div className="form-group">
                <label className="form-label">Path (e.g. summary or data/compute)</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ padding: "10px 12px", background: "rgba(255,255,255,0.06)", borderRadius: "10px 0 0 10px", color: "#94a3b8" }}>
                    /gateway/[user]/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="summary"
                    className="form-input"
                    style={{ borderRadius: "0 10px 10px 0" }}
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">HTTP Method</label>
                  <select
                    className="form-select"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Function</label>
                  <select
                    className="form-select"
                    value={selectedFuncId}
                    onChange={(e) => setSelectedFuncId(e.target.value)}
                  >
                    {functions.map((fn) => (
                      <option key={fn.id} value={fn.id}>
                        {fn.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rate Limit (Requests per Minute)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  className="form-input"
                  value={rateLimitRpm}
                  onChange={(e) => setRateLimitRpm(parseInt(e.target.value) || 60)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setNewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deploy Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
