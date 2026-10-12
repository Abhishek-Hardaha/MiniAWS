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
  X
} from "lucide-react";
import { listFiles, uploadFile, deleteFile, getDashboardSummary } from "@/lib/api";

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

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={26} color="#14b8a6" />
            Storage & File Hosting (S3)
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Store, view, download and manage your files securely with guaranteed per-user quota isolation.
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

      {/* Quota Banner */}
      {quota && (
        <div
          style={{
            background: "rgba(20, 184, 166, 0.08)",
            border: "1px solid rgba(20, 184, 166, 0.25)",
            borderRadius: "16px",
            padding: "18px 24px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, marginRight: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "#fff" }}>
                Storage Quota Usage: {formatBytes(quota.storage_used_bytes)} / {formatBytes(quota.storage_max_bytes)}
              </span>
              <span style={{ fontWeight: 700, color: "#14b8a6" }}>
                {quota.storage_percent}% Used
              </span>
            </div>
            <div className="usage-bar-track" style={{ height: "8px", margin: 0 }}>
              <div
                className="usage-bar-fill"
                style={{
                  width: `${quota.storage_percent}%`,
                  backgroundColor: "#14b8a6",
                  boxShadow: "0 0 12px rgba(20, 184, 166, 0.6)",
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Data Tier: <span style={{ color: "#38bdf8", fontWeight: 600 }}>EC2-2 (172.31.12.181:9000)</span>
          </div>
        </div>
      )}

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
                        <span style={{ fontWeight: 600, color: "#fff" }}>{file.filename}</span>
                      </div>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "12px" }}>{file.mime_type}</td>
                    <td style={{ color: "#e2e8f0" }}>{formatBytes(file.file_size)}</td>
                    <td style={{ color: "#64748b", fontSize: "12px" }}>
                      {new Date(file.created_at).toLocaleDateString()} {new Date(file.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          className="icon-btn"
                          style={{ width: "32px", height: "32px" }}
                          onClick={() => handlePreview(file)}
                          title="Preview"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={`/api/storage/download/${file.id}`}
                          download={file.filename}
                          className="icon-btn"
                          style={{ width: "32px", height: "32px" }}
                          title="Download"
                        >
                          <Download size={15} />
                        </a>
                        <button
                          className="icon-btn"
                          style={{ width: "32px", height: "32px", color: "#f87171" }}
                          onClick={() => handleDelete(file.id)}
                          title="Delete"
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
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {getFileIcon(previewFile.mime_type)}
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  {previewFile.filename}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setPreviewFile(null)}>
                <X size={18} />
              </button>
            </div>

            {previewContent === "image" ? (
              <div style={{ textAlign: "center", padding: "16px", background: "#050811", borderRadius: "12px" }}>
                <img
                  src={`/api/storage/download/${previewFile.id}?preview=true`}
                  alt={previewFile.filename}
                  style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
                />
              </div>
            ) : (
              <pre
                style={{
                  background: "#050811",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#38bdf8",
                  maxHeight: "360px",
                  overflowY: "auto",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {previewContent}
              </pre>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
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
