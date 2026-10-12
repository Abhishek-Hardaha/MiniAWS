"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Upload,
  ExternalLink,
  Code2,
  Trash2,
  CheckCircle,
  Eye,
  RefreshCw,
  Plus,
  X,
  Copy,
  AlertCircle
} from "lucide-react";
import { listWebsites, createWebsite, updateWebsite, deleteWebsite, getWebsiteSource } from "@/lib/api";

const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Mini AWS Hosted Site</title>
  <style>
    body {
      background: #090e1a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    .badge {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid #3b82f6;
      color: #60a5fa;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #60a5fa, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      max-width: 500px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="badge">🚀 Hosted on Mini AWS Data Tier</div>
  <h1>Hello from Cloud Static Hosting!</h1>
  <p>This static website is served directly from Nginx running on EC2 Instance 2 (Data Tier) with instant deployment.</p>
</body>
</html>`;

export default function WebHostingPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeSite, setActiveSite] = useState<any | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Form state
  const [siteName, setSiteName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [description, setDescription] = useState("");
  const [htmlContent, setHtmlContent] = useState(DEFAULT_SAMPLE_HTML);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadWebsites = () => {
    listWebsites()
      .then((res) => setWebsites(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createWebsite({
        site_name: siteName,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        description,
        html_content: htmlContent,
      });
      setModalOpen(false);
      setSiteName("");
      setSubdomain("");
      setDescription("");
      loadWebsites();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to deploy website");
    }
  };

  const handleOpenEditor = async (site: any) => {
    setActiveSite(site);
    try {
      const src = await getWebsiteSource(site.id);
      setHtmlContent(src.html || DEFAULT_SAMPLE_HTML);
    } catch {
      setHtmlContent(DEFAULT_SAMPLE_HTML);
    }
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!activeSite) return;
    try {
      await updateWebsite(activeSite.id, { html_content: htmlContent });
      setEditModalOpen(false);
      loadWebsites();
    } catch (err: any) {
      alert(`Error updating: ${err.message}`);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;
    try {
      await deleteWebsite(siteId);
      loadWebsites();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`Copied URL to clipboard: ${fullUrl}`);
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Globe size={26} color="#3b82f6" />
            Static Website Hosting (S3 Website / CloudFront)
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Upload HTML, CSS, and JS assets to instantly deploy public websites on EC2 Data Tier.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Deploy New Website</span>
        </button>
      </div>

      {/* Quota Info Box */}
      <div
        style={{
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "16px",
          padding: "16px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Globe size={18} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#fff" }}>
              Active Websites: {websites.length} / 3 Allowed
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Served via Nginx on EC2 Instance 2 (172.31.12.181:8080)
            </div>
          </div>
        </div>
      </div>

      {/* Websites Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "20px" }}>
        {websites.map((site) => (
          <div key={site.id} className="panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                    {site.site_name}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#60a5fa", fontFamily: "var(--font-mono)" }}>
                    {site.subdomain}.miniaws.cloud
                  </div>
                </div>
                <span className="status-pill status-success">Live</span>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5, marginBottom: "16px" }}>
                {site.description || "Static web application hosted on Mini AWS Data Tier."}
              </p>

              {/* Endpoint Link Box */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  color: "#38bdf8",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {site.hosted_url}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="icon-btn"
                    style={{ width: "28px", height: "28px" }}
                    onClick={() => handleCopy(site.hosted_url)}
                    title="Copy URL"
                  >
                    <Copy size={13} />
                  </button>
                  <a
                    href={site.hosted_url}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-btn"
                    style={{ width: "28px", height: "28px" }}
                    title="Open in new tab"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Created: {new Date(site.created_at).toLocaleDateString()}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => {
                    setActiveSite(site);
                    setPreviewModalOpen(true);
                  }}
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => handleOpenEditor(site)}
                >
                  <Code2 size={13} />
                  <span>Edit Code</span>
                </button>
                <button
                  className="icon-btn"
                  style={{ width: "32px", height: "32px", color: "#f87171" }}
                  onClick={() => handleDelete(site.id)}
                  title="Delete Website"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy Website Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                Deploy Static Website
              </h2>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  color: "#f87171",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Website Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Portfolio"
                    className="form-input"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subdomain Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. portfolio-demo"
                    className="form-input"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Short description of website"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">HTML Content (index.html)</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "220px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deploy to EC2-2
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Browser Live Code Editor Modal */}
      {editModalOpen && activeSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  Edit {activeSite.site_name}
                </h2>
                <div style={{ fontSize: "12px", color: "#60a5fa" }}>
                  Editing index.html live on EC2-2 Nginx tier
                </div>
              </div>
              <button className="icon-btn" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <textarea
                className="form-textarea"
                style={{ minHeight: "340px", fontSize: "12px", color: "#38bdf8" }}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="btn-secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdate}>
                Save &amp; Deploy Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal (iFrame) */}
      {previewModalOpen && activeSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "900px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={18} color="#3b82f6" />
                <span style={{ fontWeight: 700, color: "#fff" }}>Live Preview: {activeSite.site_name}</span>
              </div>
              <button className="icon-btn" onClick={() => setPreviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "10px", overflow: "hidden", height: "500px", background: "#fff" }}>
              <iframe
                src={activeSite.hosted_url}
                title={activeSite.site_name}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
