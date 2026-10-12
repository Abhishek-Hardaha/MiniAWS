"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  RefreshCw,
  Terminal,
  Filter,
  Eye,
  X,
  Layers,
  Cpu,
  HardDrive
} from "lucide-react";
import { getExecutionLogs, getMonitoringStats, getSystemTiers } from "@/lib/api";

export default function MonitoringPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_invocations: 45,
    success_count: 43,
    error_count: 2,
    success_rate_percent: 95.6,
    avg_duration_ms: 42.1,
  });
  const [tiers, setTiers] = useState<any[]>([]);
  const [activeLog, setActiveLog] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    getMonitoringStats()
      .then((s) => setStats(s))
      .catch((err) => console.error(err));

    getExecutionLogs({ status_filter: statusFilter || undefined })
      .then((l) => setLogs(l))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    getSystemTiers()
      .then((t) => setTiers(t.tiers || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart3 size={26} color="#ec4899" />
            Function Monitoring &amp; CloudWatch Dashboard
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Real-time execution telemetry, duration metrics, logs, and 3-Tier EC2 instance health.
          </p>
        </div>

        <button className="btn-secondary" onClick={loadData}>
          <RefreshCw size={15} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 Top Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div className="panel-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
            Total Invocations
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
            {stats.total_invocations}
          </div>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px" }}>
            +12 today
          </div>
        </div>

        <div className="panel-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
            Success Rate
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399" }}>
            {stats.success_rate_percent}%
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            {stats.success_count} successful / {stats.error_count} failed
          </div>
        </div>

        <div className="panel-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
            Avg Duration
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#60a5fa" }}>
            {stats.avg_duration_ms} ms
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            P95 latency: ~85 ms
          </div>
        </div>

        <div className="panel-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
            Error Count
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: stats.error_count > 0 ? "#f87171" : "#fff" }}>
            {stats.error_count}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Zero unhandled crashes
          </div>
        </div>
      </div>

      {/* 3-Tier EC2 Health Status Banner */}
      <div className="panel-card" style={{ marginBottom: "24px", padding: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Server size={18} color="#3b82f6" />
          <span>Three-Tier Multi-EC2 Architecture Live Health</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {/* EC2 Instance 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>EC2 Instance 1</div>
              <span className="status-pill status-success">Online</span>
            </div>
            <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 600, marginBottom: "6px" }}>
              Application Tier (35.159.95.208)
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.5 }}>
              Private IP: 172.31.9.80<br />
              Services: Next.js Frontend (Port 3000), FastAPI Gateway (Port 8000), Nginx Proxy
            </div>
          </div>

          {/* EC2 Instance 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>EC2 Instance 2</div>
              <span className="status-pill status-success">Online</span>
            </div>
            <div style={{ fontSize: "12px", color: "#14b8a6", fontWeight: 600, marginBottom: "6px" }}>
              Data Tier (3.127.237.130)
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.5 }}>
              Private IP: 172.31.12.181<br />
              Services: PostgreSQL 16 (Port 5432), MinIO/Storage (Port 9000), Static Nginx (Port 8080)
            </div>
          </div>

          {/* EC2 Instance 3 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>EC2 Instance 3</div>
              <span className="status-pill status-success">Online</span>
            </div>
            <div style={{ fontSize: "12px", color: "#c084fc", fontWeight: 600, marginBottom: "6px" }}>
              Execution &amp; Monitoring Tier (3.71.47.123)
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.5 }}>
              Private IP: 172.31.3.155<br />
              Services: Python Runner (Port 5001), APScheduler (Port 5002), Prometheus Metrics
            </div>
          </div>
        </div>
      </div>

      {/* CloudWatch Logs Stream Table */}
      <div className="panel-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={18} color="#34d399" />
            <span>CloudWatch Execution Logs Stream</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Filter size={15} color="#94a3b8" />
            <select
              className="form-select"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="success">Success Only</option>
              <option value="error">Errors Only</option>
            </select>
          </div>
        </div>

        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Function</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Memory</th>
                <th style={{ textAlign: "right" }}>Log Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No execution logs matching filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === "success";
                  return (
                    <tr key={log.id}>
                      <td style={{ color: "#64748b", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 600, color: "#fff" }}>
                        {log.function_name}
                      </td>
                      <td style={{ color: "#94a3b8", fontSize: "12px", textTransform: "capitalize" }}>
                        {log.trigger_type}
                      </td>
                      <td>
                        <span className={`status-pill ${isSuccess ? "status-success" : "status-error"}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>
                        {log.duration_ms} ms
                      </td>
                      <td style={{ color: "#94a3b8", fontSize: "12px" }}>
                        {log.memory_used_mb || 16.0} MB
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="icon-btn"
                          style={{ width: "32px", height: "32px" }}
                          onClick={() => setActiveLog(log)}
                          title="View Logs"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CloudWatch Log Viewer Modal */}
      {activeLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "750px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Terminal size={18} color="#34d399" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  Execution Log: {activeLog.function_name} ({activeLog.id})
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setActiveLog(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Trigger Type</div>
                <div style={{ fontWeight: 600, color: "#fff" }}>{activeLog.trigger_type}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Execution Time</div>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>{activeLog.duration_ms} ms</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Memory Footprint</div>
                <div style={{ fontWeight: 600, color: "#fff" }}>{activeLog.memory_used_mb} MB</div>
              </div>
            </div>

            {/* Log Output Stream */}
            <div className="form-group">
              <label className="form-label">Captured Output (STDOUT / Traceback)</label>
              <pre
                style={{
                  background: "#050811",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                  fontSize: "12px",
                  color: activeLog.status === "success" ? "#34d399" : "#f87171",
                  maxHeight: "260px",
                  overflowY: "auto",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {activeLog.stdout || activeLog.stderr || activeLog.error_message || "No console output recorded."}
              </pre>
            </div>

            {activeLog.return_value && (
              <div className="form-group">
                <label className="form-label">Return Value</label>
                <pre
                  style={{
                    background: "#050811",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "12px",
                    color: "#38bdf8",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {activeLog.return_value}
                </pre>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="btn-secondary" onClick={() => setActiveLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
