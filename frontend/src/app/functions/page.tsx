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
  Zap,
  Check,
  Copy,
  ChevronRight,
  Cpu,
  Sparkles,
  Layers,
  Sliders,
  ExternalLink
} from "lucide-react";
import {
  listFunctions,
  createFunction,
  updateFunction,
  testRunFunction,
  deleteFunction,
  getFunction
} from "@/lib/api";

const TEMPLATES: Record<string, { title: string; desc: string; code: string; defaultPayload: string }> = {
  data_processor: {
    title: "Batch Data Aggregator",
    desc: "Processes numeric arrays with min, max, total, and average statistics",
    defaultPayload: '{\n  "data": [12, 45, 68, 89, 102, 140, 220]\n}',
    code: `def handler(event, context):
    """
    MiniAWS Lambda Handler: Data Aggregation Engine
    Runs in isolated sub-process on EC2-3 (172.31.3.155)
    """
    import json
    data = event.get("data", [12, 45, 68, 89, 102, 140])
    total = sum(data)
    average = total / len(data) if data else 0
    
    print(f"MiniAWS Runner: Processing batch of {len(data)} items")
    print(f"Calculated Total: {total}, Average: {average:.2f}")
    
    return {
        "status": "success",
        "processed_count": len(data),
        "total": total,
        "average": round(average, 2),
        "min": min(data) if data else None,
        "max": max(data) if data else None
    }`
  },
  math_fibonacci: {
    title: "Fibonacci & Prime Sequence",
    desc: "Computes sequence terms and identifies primes on EC2-3 runner",
    defaultPayload: '{\n  "n": 15\n}',
    code: `def handler(event, context):
    """
    MiniAWS Lambda Handler: Fibonacci Sequence Generator
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
        "last_number": result[-1] if result else 0,
        "sum_of_terms": sum(result)
    }`
  },
  api_webhook: {
    title: "REST Webhook Handler",
    desc: "Parses API Gateway HTTP query parameters and JSON body payloads",
    defaultPayload: '{\n  "http_method": "POST",\n  "query_params": {"env": "production"},\n  "body": {"name": "Cloud Engineer", "action": "deploy"}\n}',
    code: `def handler(event, context):
    """
    MiniAWS Lambda Handler: API Gateway Webhook Dispatcher
    """
    http_method = event.get("http_method", "GET")
    params = event.get("query_params", {})
    body = event.get("body", {})
    
    name = params.get("name") or body.get("name") or "Cloud Developer"
    print(f"Incoming {http_method} request for user: {name}")
    
    return {
        "message": f"Hello, {name}! Welcome to Mini AWS Serverless.",
        "method": http_method,
        "received_params": params,
        "received_body": body,
        "timestamp_status": "dispatched"
    }`
  },
  s3_event_hook: {
    title: "S3 Object Notification Hook",
    desc: "Simulates S3 object put/get lifecycle trigger transformations",
    defaultPayload: '{\n  "bucket": "assets-bucket",\n  "key": "documents/report-q4.pdf",\n  "size_bytes": 1048576\n}',
    code: `def handler(event, context):
    """
    MiniAWS Lambda Handler: S3 Blob Storage Event Trigger
    """
    bucket = event.get("bucket", "default-bucket")
    key = event.get("key", "sample.txt")
    size = event.get("size_bytes", 0)
    
    print(f"S3 Event received for bucket '{bucket}', key '{key}' ({size} bytes)")
    
    return {
        "status": "processed",
        "bucket": bucket,
        "key": key,
        "size_kb": round(size / 1024, 2),
        "target_storage_class": "STANDARD",
        "action_taken": "indexed"
    }`
  }
};

const CRON_PRESETS = [
  { value: "1m", label: "Every 1 min", cron: "* * * * *" },
  { value: "5m", label: "Every 5 min", cron: "*/5 * * * *" },
  { value: "15m", label: "Every 15 min", cron: "*/15 * * * *" },
  { value: "1h", label: "Every 1 hour", cron: "0 * * * *" },
  { value: "daily", label: "Daily (00:00 UTC)", cron: "0 0 * * *" },
];

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<any[]>([]);
  const [selectedFunc, setSelectedFunc] = useState<any | null>(null);
  const [code, setCode] = useState<string>(TEMPLATES.data_processor.code);
  const [testPayload, setTestPayload] = useState<string>(TEMPLATES.data_processor.defaultPayload);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<"logs" | "payload" | "diagnostics">("logs");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New function form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTemplate, setNewTemplate] = useState("data_processor");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState("5m");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast("Function saved successfully & schedule synchronized!", "success");
    } catch (err: any) {
      showToast(`Save error: ${err.message}`, "error");
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
      showToast("Test Event payload is not valid JSON.", "error");
      setRunning(false);
      return;
    }

    try {
      const res = await testRunFunction(selectedFunc.id, {
        code,
        event: parsedEvent,
      });
      setTestResult(res);
      showToast(`Executed in ${res.duration_ms} ms with status: ${res.status}`, res.status === "success" ? "success" : "error");
    } catch (err: any) {
      setTestResult({
        status: "error",
        duration_ms: 0,
        stderr: err.message,
        stdout: "",
      });
      showToast(`Execution failed: ${err.message}`, "error");
    } finally {
      setRunning(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const initialCode = TEMPLATES[newTemplate]?.code || TEMPLATES.data_processor.code;
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
      showToast(`Function '${created.name}' created!`, "success");
    } catch (err: any) {
      showToast(`Creation failed: ${err.message}`, "error");
    }
  };

  const handleDelete = async (funcId: string) => {
    if (!confirm("Are you sure you want to delete this serverless function?")) return;
    try {
      await deleteFunction(funcId);
      setSelectedFunc(null);
      loadFunctions();
      showToast("Function deleted successfully.", "success");
    } catch (err: any) {
      showToast(`Delete error: ${err.message}`, "error");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const loadTemplateIntoEditor = (tplKey: string) => {
    const tpl = TEMPLATES[tplKey];
    if (tpl) {
      setCode(tpl.code);
      setTestPayload(tpl.defaultPayload);
      showToast(`Loaded '${tpl.title}' starter template into editor!`, "success");
    }
  };

  return (
    <div className="content-wrapper">
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

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Code2 size={26} color="#8b5cf6" />
            Serverless Functions Studio (AWS Lambda)
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Author, test, and schedule serverless Python 3 microservices isolated on EC2 Execution Tier 3.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setNewModalOpen(true)}>
          <Plus size={16} />
          <span>New Lambda Function</span>
        </button>
      </div>

      {/* AWS Lambda Runtime Specification Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(13, 20, 36, 0.85) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: "16px",
          padding: "16px 22px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={22} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>AWS Lambda Architecture Tier 3</span>
              <span className="cloud-metric-chip cloud-metric-purple">Python 3.9 Runtime</span>
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              Dedicated Execution Engine at <code>172.31.3.155:5001</code> • APScheduler Cron Engine at <code>:5002</code>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>Allocated Memory:</span>
            <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>128 MB RAM</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>Execution Quota:</span>
            <strong style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{functions.length} / 5 slots</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 700 }}>
            <span className="pulse-live-dot" /> Runner Ready (0.3ms Ping)
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Function List & Code Editor */}
      <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "20px" }}>
        {/* Left Column: Function Selector List */}
        <div className="panel-card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Lambda Functions ({functions.length} / 5)
            </span>
            <button className="icon-btn" style={{ width: "26px", height: "26px" }} onClick={loadFunctions} title="Refresh functions">
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
                    background: isSelected ? "rgba(139, 92, 246, 0.16)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isSelected ? "rgba(139, 92, 246, 0.5)" : "var(--border-subtle)"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: isSelected ? "#c084fc" : "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Code2 size={15} color={isSelected ? "#c084fc" : "#94a3b8"} />
                      <span>{fn.name}</span>
                    </div>
                    {fn.is_scheduled && (
                      <span className="cloud-metric-chip cloud-metric-cyan" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        <Clock size={10} style={{ marginRight: "3px" }} />
                        {fn.schedule_interval}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", justifyContent: "space-between" }}>
                    <span>Python 3.9 • {fn.timeout_seconds || 5}s timeout</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "#94a3b8" }}>{fn.id.slice(0, 8)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Starter Templates Guide in Sidebar */}
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={12} color="#c084fc" />
              <span>Insert Starter Template</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => loadTemplateIntoEditor(key)}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "12px",
                    color: "#cbd5e1",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)")}
                >
                  <span style={{ fontWeight: 600 }}>{tpl.title}</span>
                  <ChevronRight size={12} color="#64748b" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Runner */}
        {selectedFunc ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Function Control Bar */}
            <div className="panel-card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{selectedFunc.name}</span>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400, fontFamily: "var(--font-mono)" }}>
                      arn:miniaws:lambda:eu-central-1:func:{selectedFunc.id}
                    </span>
                  </h2>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    {selectedFunc.description || "Production Lambda function deployed on Tier 3 runner."}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                    <Save size={15} />
                    <span>{saving ? "Deploying..." : "Deploy Code"}</span>
                  </button>
                  <button className="btn-primary" onClick={handleTestRun} disabled={running}>
                    <Play size={15} />
                    <span>{running ? "Invoking..." : "Test Run"}</span>
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

              {/* CloudWatch Schedule Settings Row with Interactive Chips */}
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#e2e8f0" }}>
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    style={{ accentColor: "#8b5cf6", width: "16px", height: "16px" }}
                  />
                  <span style={{ fontWeight: 600 }}>Enable CloudWatch EventBridge Cron Schedule</span>
                </label>

                {isScheduled && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Trigger Interval:</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {CRON_PRESETS.map((preset) => {
                        const isPresetActive = scheduleInterval === preset.value;
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setScheduleInterval(preset.value)}
                            style={{
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "6px",
                              border: isPresetActive ? "1px solid #8b5cf6" : "1px solid rgba(255, 255, 255, 0.1)",
                              background: isPresetActive ? "rgba(139, 92, 246, 0.25)" : "rgba(255, 255, 255, 0.04)",
                              color: isPresetActive ? "#c084fc" : "#94a3b8",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor Box */}
            <div className="code-editor-box">
              <div className="code-editor-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#38bdf8", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    lambda_function.py
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Python 3.9 (Sandboxed subprocess)
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "none",
                      borderRadius: "6px",
                      color: copiedCode ? "#34d399" : "#94a3b8",
                      padding: "4px 8px",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                    }}
                    title="Copy code to clipboard"
                  >
                    {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    EC2-3:5001
                  </span>
                </div>
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={16}
              />
            </div>

            {/* Test Event Payload & Execution Console */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
              {/* Event Payload Editor */}
              <div className="panel-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                    Test Event JSON (event dict)
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setTestPayload('{\n  "data": [10, 20, 30, 40, 50]\n}')}
                      style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#94a3b8", cursor: "pointer" }}
                    >
                      Batch
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPayload('{\n  "n": 20\n}')}
                      style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#94a3b8", cursor: "pointer" }}
                    >
                      Fib N=20
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPayload('{\n  "http_method": "POST",\n  "body": {"status": "ok"}\n}')}
                      style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#94a3b8", cursor: "pointer" }}
                    >
                      Webhook
                    </button>
                  </div>
                </div>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "150px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  placeholder="{}"
                />
              </div>

              {/* Execution Console & Diagnostics */}
              <div className="panel-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Terminal size={15} color="#34d399" />
                      <span>Execution Output</span>
                    </div>

                    <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
                      <button
                        onClick={() => setActiveOutputTab("logs")}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "none",
                          background: activeOutputTab === "logs" ? "rgba(255,255,255,0.12)" : "transparent",
                          color: activeOutputTab === "logs" ? "#fff" : "#64748b",
                          cursor: "pointer",
                        }}
                      >
                        Logs &amp; Output
                      </button>
                      <button
                        onClick={() => setActiveOutputTab("diagnostics")}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "none",
                          background: activeOutputTab === "diagnostics" ? "rgba(255,255,255,0.12)" : "transparent",
                          color: activeOutputTab === "diagnostics" ? "#fff" : "#64748b",
                          cursor: "pointer",
                        }}
                      >
                        Diagnostics
                      </button>
                    </div>
                  </div>

                  {testResult && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className={`status-pill ${testResult.status === "success" ? "status-success" : "status-error"}`}>
                        {testResult.status.toUpperCase()}
                      </span>
                      <span className="status-pill status-success">
                        {testResult.duration_ms} ms
                      </span>
                    </div>
                  )}
                </div>

                <div className="terminal-console" style={{ minHeight: "150px" }}>
                  {running && <div style={{ color: "#60a5fa" }}>Invoking function on EC2 Tier 3 Execution Runner...</div>}
                  {!running && !testResult && (
                    <div style={{ color: "#64748b" }}>
                      Click <strong>&quot;Test Run&quot;</strong> to invoke function and view real-time logs &amp; execution diagnostics.
                    </div>
                  )}

                  {!running && testResult && activeOutputTab === "logs" && (
                    <div>
                      {testResult.stdout && (
                        <div style={{ marginBottom: "10px" }}>
                          <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>[STDOUT STREAM]:</span>
                          <pre style={{ color: "#38bdf8", marginTop: "2px", whiteSpace: "pre-wrap" }}>{testResult.stdout}</pre>
                        </div>
                      )}
                      {testResult.return_value && (
                        <div style={{ marginBottom: "10px" }}>
                          <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>[RETURN PAYLOAD]:</span>
                          <pre style={{ color: "#34d399", marginTop: "2px", whiteSpace: "pre-wrap" }}>
                            {typeof testResult.return_value === "object"
                              ? JSON.stringify(testResult.return_value, null, 2)
                              : testResult.return_value}
                          </pre>
                        </div>
                      )}
                      {testResult.stderr && (
                        <div style={{ color: "#f87171" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700 }}>[STDERR / TRACEBACK]:</span>
                          <pre style={{ marginTop: "2px", whiteSpace: "pre-wrap" }}>{testResult.stderr}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {!running && testResult && activeOutputTab === "diagnostics" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Execution Engine:</span>
                        <span style={{ color: "#c084fc", fontFamily: "var(--font-mono)" }}>EC2-3 (172.31.3.155)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Actual Duration:</span>
                        <span style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>{testResult.duration_ms} ms</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Billed Duration:</span>
                        <span style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{Math.max(100, Math.ceil(testResult.duration_ms / 100) * 100)} ms</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Memory Size:</span>
                        <span style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>128 MB</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Cold Start:</span>
                        <span style={{ color: "#34d399" }}>False (Warm Container)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8" }}>Exit Code:</span>
                        <span style={{ color: testResult.status === "success" ? "#34d399" : "#f87171", fontFamily: "var(--font-mono)" }}>
                          {testResult.status === "success" ? "0 (SUCCESS)" : "1 (ERROR)"}
                        </span>
                      </div>
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
                Create Serverless Function (Lambda)
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
                  {Object.entries(TEMPLATES).map(([key, tpl]) => (
                    <option key={key} value={key}>
                      {tpl.title} - {tpl.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setNewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deploy Function
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
