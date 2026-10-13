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
  Clock,
  ShieldCheck,
  Zap,
  RefreshCw,
  X,
  Code2
} from "lucide-react";
import { listApiRoutes, createApiRoute, deleteApiRoute, listFunctions, getDashboardSummary } from "@/lib/api";
import RadialProgressGauge from "@/components/charts/RadialProgressGauge";
import BarMetricChart, { BarMetricItem } from "@/components/charts/BarMetricChart";

export default function ApiGatewayPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

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
    } catch (err: any) {
      alert(`Error creating route: ${err.message}`);
    }
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this API route?")) return;
    try {
      await deleteApiRoute(routeId);
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
      });
    } catch (err: any) {
      setTestResponse({
        status: 500,
        statusText: "Network Error",
        duration: Math.round(performance.now() - start),
        data: { error: err.message },
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
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

      {/* Grid: Configured Routes & Interactive API Tester */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
        {/* Left Column: Routes List */}
        <div className="panel-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              Active Routes ({routes.length} / 5)
            </h2>
            <button className="icon-btn" onClick={loadData}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {routes.map((rt) => {
              const isSelected = activeTestRoute?.id === rt.id;
              let methodBg = "#3b82f6";
              if (rt.http_method === "GET") methodBg = "#10b981";
              if (rt.http_method === "POST") methodBg = "#3b82f6";
              if (rt.http_method === "DELETE") methodBg = "#ef4444";

              return (
                <div
                  key={rt.id}
                  onClick={() => {
                    setActiveTestRoute(rt);
                    setTestMethod(rt.http_method);
                  }}
                  style={{
                    background: isSelected ? "rgba(249, 115, 22, 0.12)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isSelected ? "rgba(249, 115, 22, 0.4)" : "var(--border-subtle)"}`,
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
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {rt.http_method}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "#fff", fontFamily: "var(--font-mono)" }}>
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
                  <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", gap: "16px", marginBottom: "10px" }}>
                    <div>
                      Target Function: <strong style={{ color: "#c084fc" }}>{rt.function_name}</strong>
                    </div>
                    <div>
                      Rate Limit: <strong style={{ color: "#38bdf8" }}>{rt.rate_limit_rpm} rpm</strong>
                    </div>
                  </div>

                  {/* Full invocation URL box */}
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.35)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "#60a5fa",
                    }}
                  >
                    <span>{rt.endpoint_url}</span>
                    <button
                      className="icon-btn"
                      style={{ width: "24px", height: "24px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(`${window.location.origin}${rt.endpoint_url}`);
                      }}
                      title="Copy URL"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live API Gateway Tester */}
        <div className="panel-card" style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            Integrated API Tester (Postman style)
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "16px" }}>
            Simulate incoming client HTTP requests against your live API Gateway.
          </p>

          {activeTestRoute ? (
            <div>
              {/* Request URL Input */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <select
                  className="form-select"
                  style={{ width: "100px", fontWeight: 700 }}
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

              {/* Request Body Editor */}
              {["POST", "PUT"].includes(testMethod) && (
                <div className="form-group">
                  <label className="form-label">Request Body (JSON)</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: "100px", fontSize: "12px" }}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                  />
                </div>
              )}

              {/* Response Panel */}
              <div style={{ marginTop: "16px" }}>
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
                    </div>
                  )}
                </div>

                <div className="terminal-console" style={{ minHeight: "160px" }}>
                  {!testResponse && !testing && (
                    <span style={{ color: "#64748b" }}>Click &quot;Send&quot; to test API route execution.</span>
                  )}
                  {testing && <span style={{ color: "#60a5fa" }}>Routing through API Gateway...</span>}
                  {testResponse && (
                    <pre style={{ color: "#34d399", fontSize: "12px" }}>
                      {JSON.stringify(testResponse.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              Select an API route to test.
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
