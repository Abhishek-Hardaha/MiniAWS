"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  Play,
  Save,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Terminal,
  RefreshCw,
  X,
  FileCode,
  Zap
} from "lucide-react";
import {
  listFunctions,
  createFunction,
  updateFunction,
  testRunFunction,
  deleteFunction,
  getFunction
} from "@/lib/api";

const TEMPLATES: Record<string, string> = {
  data_processor: `def handler(event, context):
    """
    Processes incoming data items and returns aggregations.
    """
    import json
    data = event.get("data", [12, 45, 68, 89, 102, 140])
    total = sum(data)
    average = total / len(data) if data else 0
    
    print(f"StackSync Runner: Processing batch of {len(data)} items")
    print(f"Calculated Total: {total}, Average: {average:.2f}")
    
    return {
        "status": "success",
        "processed_count": len(data),
        "total": total,
        "average": average
    }`,
  math_fibonacci: `def handler(event, context):
    """
    Calculates Fibonacci sequence and prime numbers.
    """
    n = event.get("n", 15)
    
    def fib(count):
        seq = [0, 1]
        for i in range(2, count):
            seq.append(seq[-1] + seq[-2])
        return seq[:count]
        
    result = fib(n)
    print(f"Computed first {n} Fibonacci numbers: {result}")
    
    return {
        "n": n,
        "sequence": result,
        "last_number": result[-1] if result else 0
    }`,
  api_webhook: `def handler(event, context):
    """
    Handles API Gateway requests with query parameters and headers.
    """
    http_method = event.get("http_method", "GET")
    params = event.get("query_params", {})
    body = event.get("body", {})
    
    name = params.get("name") or body.get("name") or "Cloud Developer"
    print(f"Incoming {http_method} request for user: {name}")
    
    return {
        "message": f"Hello, {name}! Welcome to StackSync Serverless.",
        "method": http_method,
        "received_params": params
    }`,
};

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<any[]>([]);
  const [selectedFunc, setSelectedFunc] = useState<any | null>(null);
  const [code, setCode] = useState<string>(TEMPLATES.data_processor);
  const [testPayload, setTestPayload] = useState<string>('{\n  "data": [10, 20, 30, 40, 50]\n}');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New function form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTemplate, setNewTemplate] = useState("data_processor");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState("5m");

  const loadFunctions = () => {
    listFunctions()
      .then((res) => {
        setFunctions(res);
        if (res.length > 0 && !selectedFunc) {
          setSelectedFunc(res[0]);
          setCode(res[0].code);
          setIsScheduled(res[0].is_scheduled);
          setScheduleInterval(res[0].schedule_interval || "5m");
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadFunctions();
  }, []);

  const handleSelectFunction = (fn: any) => {
    setSelectedFunc(fn);
    setCode(fn.code);
    setIsScheduled(fn.is_scheduled);
    setScheduleInterval(fn.schedule_interval || "5m");
    setTestResult(null);
  };

  const handleSave = async () => {
    if (!selectedFunc) return;
    setSaving(true);
    try {
      const updated = await updateFunction(selectedFunc.id, {
        code,
        is_scheduled: isScheduled,
        schedule_interval: isScheduled ? scheduleInterval : null,
      });
      setSelectedFunc(updated);
      loadFunctions();
      alert("Function saved successfully and schedules synchronized!");
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!selectedFunc) return;
    setRunning(true);
    setTestResult(null);

    let parsedEvent = {};
    try {
      if (testPayload.trim()) {
        parsedEvent = JSON.parse(testPayload);
      }
    } catch {
      alert("Test Event payload is not valid JSON.");
      setRunning(false);
      return;
    }

    try {
      const res = await testRunFunction(selectedFunc.id, {
        code,
        event: parsedEvent,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        status: "error",
        duration_ms: 0,
        stderr: err.message,
        stdout: "",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const initialCode = TEMPLATES[newTemplate] || TEMPLATES.data_processor;
      const created = await createFunction({
        name: newName.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        description: newDesc,
        code: initialCode,
        is_scheduled: isScheduled,
        schedule_interval: isScheduled ? scheduleInterval : null,
      });
      setNewModalOpen(false);
      setNewName("");
      setNewDesc("");
      loadFunctions();
      handleSelectFunction(created);
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    }
  };

  const handleDelete = async (funcId: string) => {
    if (!confirm("Are you sure you want to delete this serverless function?")) return;
    try {
      await deleteFunction(funcId);
      setSelectedFunc(null);
      loadFunctions();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Code2 size={26} color="#8b5cf6" />
            Serverless Functions (AWS Lambda)
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Build, test and schedule lightweight Python 3 functions isolated on EC2 Execution Tier.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setNewModalOpen(true)}>
          <Plus size={16} />
          <span>New Function</span>
        </button>
      </div>

      {/* Execution Tier & Runner Status Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(13, 20, 36, 0.8) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          borderRadius: "16px",
          padding: "16px 22px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Code2 size={20} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px" }}>
              Tier 3 Execution Runner Engine Active
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              EC2-3 (172.31.3.155:5001) • Sandboxed sub-millisecond execution
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "12px" }}>
          <div>
            <span style={{ color: "#64748b" }}>Quota: </span>
            <strong style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{functions.length} / 5 slots</strong>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Scheduler: </span>
            <strong style={{ color: "#34d399" }}>APScheduler (:5002)</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 700 }}>
            <span className="pulse-live-dot" /> Runner Online
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Function List & Code Editor */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
        {/* Left Column: Function Selector List */}
        <div className="panel-card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Functions ({functions.length} / 5)
            </span>
            <button className="icon-btn" style={{ width: "26px", height: "26px" }} onClick={loadFunctions}>
              <RefreshCw size={13} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {functions.map((fn) => {
              const isSelected = selectedFunc?.id === fn.id;
              return (
                <div
                  key={fn.id}
                  onClick={() => handleSelectFunction(fn)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: isSelected ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isSelected ? "rgba(139, 92, 246, 0.4)" : "var(--border-subtle)"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: isSelected ? "#c084fc" : "#fff" }}>
                      {fn.name}
                    </div>
                    {fn.is_scheduled && (
                      <span style={{ fontSize: "10px", background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", padding: "2px 6px", borderRadius: "6px" }}>
                        {fn.schedule_interval}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Python 3.9 • {fn.timeout_seconds || 5}s timeout
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Editor & Runner */}
        {selectedFunc ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Function Control Bar */}
            <div className="panel-card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{selectedFunc.name}</span>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400, fontFamily: "var(--font-mono)" }}>
                      ({selectedFunc.id})
                    </span>
                  </h2>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    {selectedFunc.description || "No description provided."}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                    <Save size={15} />
                    <span>{saving ? "Saving..." : "Save Code"}</span>
                  </button>
                  <button className="btn-primary" onClick={handleTestRun} disabled={running}>
                    <Play size={15} />
                    <span>{running ? "Executing..." : "Test Run"}</span>
                  </button>
                  <button
                    className="icon-btn"
                    style={{ color: "#f87171" }}
                    onClick={() => handleDelete(selectedFunc.id)}
                    title="Delete Function"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Schedule Settings Row */}
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#e2e8f0" }}>
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    style={{ accentColor: "#8b5cf6" }}
                  />
                  <span>Enable CloudWatch Scheduled Execution</span>
                </label>

                {isScheduled && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Interval:</span>
                    <select
                      className="form-select"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      value={scheduleInterval}
                      onChange={(e) => setScheduleInterval(e.target.value)}
                    >
                      <option value="1m">Every 1 minute</option>
                      <option value="2m">Every 2 minutes</option>
                      <option value="5m">Every 5 minutes</option>
                      <option value="15m">Every 15 minutes</option>
                      <option value="1h">Every 1 hour</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor Box */}
            <div className="code-editor-box">
              <div className="code-editor-bar">
                <span style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                  lambda_function.py (Python 3.9)
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  Runs on EC2 Instance 3 (172.31.3.155:5001)
                </span>
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>

            {/* Test Event Payload & Execution Console */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Event Payload */}
              <div className="panel-card" style={{ padding: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  Test Event (JSON input)
                </div>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "140px", fontSize: "12px" }}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  placeholder="{}"
                />
              </div>

              {/* Console Output */}
              <div className="panel-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Terminal size={15} color="#34d399" />
                    <span>Execution Console</span>
                  </div>
                  {testResult && (
                    <span className={`status-pill ${testResult.status === "success" ? "status-success" : "status-error"}`}>
                      {testResult.duration_ms} ms
                    </span>
                  )}
                </div>

                <div className="terminal-console" style={{ minHeight: "140px" }}>
                  {running && <div style={{ color: "#60a5fa" }}>Invoking function on EC2 Execution Tier...</div>}
                  {!running && !testResult && (
                    <div style={{ color: "#64748b" }}>Click &quot;Test Run&quot; to execute function and view stdout logs.</div>
                  )}
                  {!running && testResult && (
                    <div>
                      {testResult.stdout && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#94a3b8" }}>[STDOUT]:</span>
                          <pre style={{ color: "#38bdf8", marginTop: "2px" }}>{testResult.stdout}</pre>
                        </div>
                      )}
                      {testResult.return_value && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#94a3b8" }}>[RETURN VALUE]:</span>
                          <pre style={{ color: "#34d399", marginTop: "2px" }}>{testResult.return_value}</pre>
                        </div>
                      )}
                      {testResult.stderr && (
                        <div style={{ color: "#f87171" }}>
                          <span>[STDERR]:</span>
                          <pre style={{ marginTop: "2px" }}>{testResult.stderr}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel-card" style={{ textAlign: "center", padding: "64px" }}>
            <FileCode size={36} color="#64748b" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "16px", color: "#fff", marginBottom: "8px" }}>No Function Selected</h3>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Create or select a function from the left to start coding.</p>
          </div>
        )}
      </div>

      {/* Create Function Modal */}
      {newModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                Create Serverless Function
              </h2>
              <button className="icon-btn" onClick={() => setNewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Function Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. data_aggregator"
                  className="form-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  placeholder="What does this function do?"
                  className="form-input"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Starter Template</label>
                <select
                  className="form-select"
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                >
                  <option value="data_processor">Data Processor (Aggregations &amp; JSON)</option>
                  <option value="math_fibonacci">Math &amp; Fibonacci Generator</option>
                  <option value="api_webhook">API Gateway Webhook Handler</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setNewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Function
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
