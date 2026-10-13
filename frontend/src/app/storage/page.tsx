"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Upload,
  Download,
  Eye,
  Trash2,
  File,
  Image,
  FileCode,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  HardDrive,
  PieChart,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { listFiles, uploadFile, deleteFile, getDashboardSummary } from "@/lib/api";
import RadialProgressGauge from "@/components/charts/RadialProgressGauge";
import BarMetricChart, { BarMetricItem } from "@/components/charts/BarMetricChart";

export default function StoragePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");

  const loadData = () => {
    listFiles()
      .then((res) => setFiles(res))
      .catch((err) => console.error(err));

    getDashboardSummary()
      .then((res) => setQuota(res.quotas))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setErrorMsg(null);
    setUploading(true);
    try {
      await uploadFile(file);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file? This will free up your storage quota.")) return;
    try {
      await deleteFile(fileId);
      loadData();
    } catch (err: any) {
      alert(`Error deleting file: ${err.message}`);
    }
  };

  const handlePreview = async (file: any) => {
    setPreviewFile(file);
    setPreviewContent("Loading preview...");
    try {
      const res = await fetch(`/api/storage/download/${file.id}?preview=true`);
      if (file.mime_type.startsWith("image/")) {
        setPreviewContent("image");
      } else {
        const text = await res.text();
        setPreviewContent(text.slice(0, 10000));
      }
    } catch {
      setPreviewContent("Failed to load file preview.");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <Image size={18} color="#06b6d4" />;
    if (mime.includes("json") || mime.includes("javascript") || mime.includes("python") || mime.includes("html"))
      return <FileCode size={18} color="#8b5cf6" />;
    if (mime.includes("pdf") || mime.includes("text")) return <FileText size={18} color="#10b981" />;
    return <File size={18} color="#94a3b8" />;
  };

  // Compute breakdown by file category
  const categories = files.reduce((acc: Record<string, { bytes: number; count: number }>, f: any) => {
    let cat = "Other";
    if (f.mime_type?.startsWith("image/")) cat = "Images & Media";
    else if (f.mime_type?.includes("pdf") || f.mime_type?.includes("text")) cat = "Documents (PDF/Text)";
    else if (f.mime_type?.includes("json") || f.mime_type?.includes("python") || f.mime_type?.includes("javascript")) cat = "Code & Scripts";

    if (!acc[cat]) acc[cat] = { bytes: 0, count: 0 };
    acc[cat].bytes += f.file_size || 0;
    acc[cat].count += 1;
    return acc;
  }, {});

  const totalUsedBytes = quota?.storage_used_bytes || files.reduce((s, f) => s + (f.file_size || 0), 0) || 1;
  const maxStorageBytes = quota?.storage_max_bytes || 5368709120; // 5 GB

  const storageBarItems: BarMetricItem[] = [
    {
      label: "Documents (PDF / Text)",
      value: categories["Documents (PDF/Text)"]?.bytes || 0,
      max: totalUsedBytes,
      displayValue: formatBytes(categories["Documents (PDF/Text)"]?.bytes || 0),
      color: "#10b981",
      icon: <FileText size={15} color="#10b981" />,
    },
    {
      label: "Images & Media",
      value: categories["Images & Media"]?.bytes || 0,
      max: totalUsedBytes,
      displayValue: formatBytes(categories["Images & Media"]?.bytes || 0),
      color: "#06b6d4",
      icon: <Image size={15} color="#06b6d4" />,
    },
    {
      label: "Code & Configuration",
      value: categories["Code & Scripts"]?.bytes || 0,
      max: totalUsedBytes,
      displayValue: formatBytes(categories["Code & Scripts"]?.bytes || 0),
      color: "#8b5cf6",
      icon: <FileCode size={15} color="#8b5cf6" />,
    },
  ];

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={26} color="#14b8a6" />
            Storage &amp; File Hosting (S3)
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Store, view, download and manage your files securely on the EC2-2 Data Tier with 5 GB storage isolation.
          </p>
        </div>

        <label className="btn-primary" style={{ cursor: "pointer" }}>
          <Upload size={16} />
          <span>{uploading ? "Uploading..." : "Upload File"}</span>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Storage Analytics Row: Radial Gauge + File Breakdown + Node Health */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1.4fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Radial Storage Gauge */}
        <div className="chart-panel-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <RadialProgressGauge
            value={quota?.storage_used_bytes || 0}
            max={maxStorageBytes}
            color="#14b8a6"
            label="5 GB S3 Capacity"
            sub={`${formatBytes(quota?.storage_used_bytes || 0)} used`}
            size={130}
            strokeWidth={11}
          />
        </div>

        {/* Storage Composition Bar Chart */}
        <div className="chart-panel-card">
          <BarMetricChart
            items={storageBarItems}
            title="Storage Composition by Type"
            subtitle="Breakdown of stored files and disk consumption"
          />
        </div>

        {/* Node Health & Stats */}
        <div className="chart-panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
              Data Tier Node Telemetry
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Private IP: 172.31.12.181:9000
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Files Count:</span>
              <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{files.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Free Capacity:</span>
              <span style={{ color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                {formatBytes(Math.max(0, maxStorageBytes - (quota?.storage_used_bytes || 0)))}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Service Status:</span>
              <span style={{ color: "#14b8a6", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="pulse-live-dot" /> Online
              </span>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "#64748b", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            Encrypted storage with checksum verification
          </div>
        </div>
      </div>

      {/* Error alert if quota exceeded */}
      {errorMsg && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Files Table */}
      <div className="panel-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
            Stored Files ({files.length})
          </h2>
          <button className="icon-btn" onClick={loadData} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                    No files uploaded yet. Click &quot;Upload File&quot; above to store your first file.
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {getFileIcon(file.mime_type)}
                        <span style={{ fontWeight: 600, color: "#fff" }}>{file.original_filename}</span>
                      </div>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "12px" }}>
                      {file.mime_type}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#14b8a6" }}>
                      {formatBytes(file.file_size)}
                    </td>
                    <td style={{ color: "#64748b", fontSize: "12px" }}>
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          className="icon-btn"
                          style={{ width: "32px", height: "32px" }}
                          onClick={() => handlePreview(file)}
                          title="Preview File"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={`/api/storage/download/${file.id}`}
                          download
                          className="icon-btn"
                          style={{ width: "32px", height: "32px" }}
                          title="Download File"
                        >
                          <Download size={15} />
                        </a>
                        <button
                          className="icon-btn"
                          style={{ width: "32px", height: "32px", color: "#ef4444" }}
                          onClick={() => handleDelete(file.id)}
                          title="Delete File"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {getFileIcon(previewFile.mime_type)}
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  {previewFile.original_filename}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setPreviewFile(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: "450px", overflowY: "auto", background: "#050811", borderRadius: "10px", padding: "16px" }}>
              {previewContent === "image" ? (
                <img
                  src={`/api/storage/download/${previewFile.id}`}
                  alt={previewFile.original_filename}
                  style={{ maxWidth: "100%", maxHeight: "400px", display: "block", margin: "0 auto", borderRadius: "6px" }}
                />
              ) : (
                <pre style={{ color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: "12px", whiteSpace: "pre-wrap" }}>
                  {previewContent}
                </pre>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-secondary" onClick={() => setPreviewFile(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
