"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Upload,
  ExternalLink,
  Code2,
  Trash2,
  CheckCircle,
  Check,
  Eye,
  RefreshCw,
  Plus,
  X,
  Copy,
  AlertCircle,
  Server,
  Layers,
  Cpu,
  ShieldCheck,
  Settings,
  Link as LinkIcon,
} from "lucide-react";
import { listWebsites, createWebsite, updateWebsite, deleteWebsite, getWebsiteSource, updateWebsiteDomain } from "@/lib/api";
import RadialProgressGauge from "@/components/charts/RadialProgressGauge";
import BarMetricChart, { BarMetricItem } from "@/components/charts/BarMetricChart";

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
  const [customDomain, setCustomDomain] = useState("");
  const [description, setDescription] = useState("");
  const [htmlContent, setHtmlContent] = useState(DEFAULT_SAMPLE_HTML);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Domain & URL Edit Modal state
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [domainSite, setDomainSite] = useState<any | null>(null);
  const [editSubdomain, setEditSubdomain] = useState("");
  const [editCustomDomain, setEditCustomDomain] = useState("");
  const [editSiteName, setEditSiteName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [domainUpdating, setDomainUpdating] = useState(false);
  const [domainErrorMsg, setDomainErrorMsg] = useState<string | null>(null);

  const loadWebsites = () => {
    listWebsites()
      .then((res) => setWebsites(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const handleFileRead = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
      setErrorMsg("Please upload a valid HTML file (.html or .htm)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setHtmlContent(text);
      setUploadedFileName(file.name);
      setErrorMsg(null);

      // Pre-fill siteName if empty
      if (!siteName) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setSiteName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
      // Pre-fill subdomain if empty
      if (!subdomain) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setSubdomain(baseName.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileRead(e.target.files[0]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createWebsite({
        site_name: siteName,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        custom_domain: customDomain.trim() || undefined,
        description,
        html_content: htmlContent,
      });
      setModalOpen(false);
      setSiteName("");
      setSubdomain("");
      setCustomDomain("");
      setDescription("");
      setUploadedFileName(null);
      loadWebsites();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to deploy website");
    }
  };

  const handleOpenDomainSettings = (site: any) => {
    setDomainSite(site);
    setEditSubdomain(site.subdomain || "");
    setEditCustomDomain(site.custom_domain || "");
    setEditSiteName(site.site_name || "");
    setEditDescription(site.description || "");
    setDomainErrorMsg(null);
    setDomainModalOpen(true);
  };

  const handleSaveDomainSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSite) return;
    setDomainUpdating(true);
    setDomainErrorMsg(null);
    try {
      await updateWebsiteDomain(domainSite.id, {
        subdomain: editSubdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
        custom_domain: editCustomDomain.trim() || undefined,
        site_name: editSiteName.trim(),
        description: editDescription.trim(),
      });
      setDomainModalOpen(false);
      loadWebsites();
    } catch (err: any) {
      setDomainErrorMsg(err.message || "Failed to update domain and URL");
    } finally {
      setDomainUpdating(false);
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

  const [copiedSiteId, setCopiedSiteId] = useState<string | null>(null);

  const handleCopy = (url: string, siteId: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSiteId(siteId);
    setTimeout(() => setCopiedSiteId(null), 2500);
  };

  const websiteBarItems: BarMetricItem[] = [
    {
      label: "Live Virtual Hosts",
      value: websites.length,
      max: 3,
      displayValue: `${websites.length} / 3`,
      color: "#3b82f6",
      icon: <Globe size={15} color="#3b82f6" />,
    },
    {
      label: "Custom Subdomain Routing",
      value: websites.length,
      max: 3,
      displayValue: `${websites.length} Bound`,
      color: "#06b6d4",
      icon: <Layers size={15} color="#06b6d4" />,
    },
    {
      label: "Instant Edge Reloads",
      value: websites.length,
      max: 3,
      displayValue: "100% Synced",
      color: "#10b981",
      icon: <CheckCircle size={15} color="#10b981" />,
    },
  ];

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

        <div style={{ display: "flex", gap: "10px" }}>
          <label className="btn-secondary" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Upload size={16} />
            <span>Upload HTML</span>
            <input
              type="file"
              accept=".html,.htm"
              style={{ display: "none" }}
              onChange={(e) => {
                handleFileInputChange(e);
                setModalOpen(true);
              }}
            />
          </label>
          <button className="btn-primary" onClick={() => { setUploadedFileName(null); setModalOpen(true); }}>
            <Plus size={16} />
            <span>Deploy New Website</span>
          </button>
        </div>
      </div>

      {/* Web Hosting Analytics Row: Radial Gauge + Host Breakdown + Data Tier Node Telemetry */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1.4fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Radial Quota Gauge */}
        <div className="chart-panel-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <RadialProgressGauge
            value={websites.length}
            max={3}
            color="#3b82f6"
            label="Static Sites Quota"
            sub={`${websites.length} of 3 active`}
            size={130}
            strokeWidth={11}
          />
        </div>

        {/* Website Composition Bar Chart */}
        <div className="chart-panel-card">
          <BarMetricChart
            items={websiteBarItems}
            title="Static Hosting Status & Quota"
            subtitle="Virtual host allocation and Nginx edge routing"
          />
        </div>

        {/* Data Tier Nginx Node Telemetry */}
        <div className="chart-panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
              Data Tier Node Telemetry
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              EC2 Instance 2 (172.31.12.181:8080)
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Web Server:</span>
              <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)" }}>Nginx 1.24 VHosts</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Remaining Quota:</span>
              <span style={{ color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                {Math.max(0, 3 - websites.length)} sites free
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#94a3b8" }}>Delivery Status:</span>
              <span style={{ color: "#3b82f6", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="pulse-live-dot" /> Online
              </span>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "#64748b", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            Direct path: /var/www/miniaws/sites/
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

              <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5, marginBottom: "12px" }}>
                {site.description || "Static web application hosted on Mini AWS Data Tier."}
              </p>

              {/* Custom Domain Badge (if configured) */}
              {site.custom_domain && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    marginBottom: "14px",
                    fontSize: "12px",
                    color: "#38bdf8",
                  }}
                >
                  <Globe size={13} />
                  <span>Custom Domain: <strong>{site.custom_domain}</strong></span>
                </div>
              )}

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
                    onClick={() => handleCopy(site.hosted_url, site.id)}
                    title="Copy URL"
                  >
                    {copiedSiteId === site.id ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  </button>
                  <a
                    href={site.hosted_url}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-btn"
                    style={{ width: "28px", height: "28px", color: "#38bdf8" }}
                    title="Open website in new tab"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Created: {new Date(site.created_at).toLocaleDateString()}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => handleOpenDomainSettings(site)}
                  title="Configure domain and custom URL slug"
                >
                  <Settings size={13} color="#60a5fa" />
                  <span>Domain &amp; URL</span>
                </button>
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

            {/* Drag & Drop HTML Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: isDragging ? "2px dashed #3b82f6" : "2px dashed rgba(59, 130, 246, 0.35)",
                background: isDragging ? "rgba(59, 130, 246, 0.12)" : "rgba(15, 23, 42, 0.6)",
                borderRadius: "14px",
                padding: "20px 16px",
                textAlign: "center",
                marginBottom: "20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <input
                type="file"
                accept=".html,.htm"
                id="deploy-html-upload"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
              <label htmlFor="deploy-html-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={22} color={isDragging ? "#60a5fa" : "#3b82f6"} />
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                    {uploadedFileName ? `✓ Loaded: ${uploadedFileName}` : "Drag & drop an HTML file here, or click to browse"}
                  </span>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                    Select any .html or .htm file to auto-populate title, slug, and code
                  </div>
                </div>
              </label>
            </div>

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

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Custom Domain (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. site.mycompany.io or app.portfolio.dev"
                  className="form-input"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  Live URL will be: <code style={{ color: "#60a5fa" }}>/sites/&lt;username&gt;/{subdomain || "your-slug"}/</code>
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

            {/* Quick Upload / Drag & Drop in Editor Modal */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: isDragging ? "2px dashed #3b82f6" : "2px dashed rgba(59, 130, 246, 0.25)",
                background: isDragging ? "rgba(59, 130, 246, 0.1)" : "rgba(15, 23, 42, 0.4)",
                borderRadius: "10px",
                padding: "12px",
                textAlign: "center",
                marginBottom: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <input
                type="file"
                accept=".html,.htm"
                id="edit-html-upload"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
              <label htmlFor="edit-html-upload" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" }}>
                <Upload size={16} color="#60a5fa" />
                <span>
                  {uploadedFileName ? `Replaced with: ${uploadedFileName}` : "Drag & drop new HTML file to replace code, or click to upload"}
                </span>
              </label>
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
      {/* Domain & URL Settings Modal */}
      {domainModalOpen && domainSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "580px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Settings size={20} color="#38bdf8" />
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  Domain &amp; URL Settings
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setDomainModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {domainErrorMsg && (
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
                <span>{domainErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveDomainSettings}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Website Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editSiteName}
                  onChange={(e) => setEditSiteName(e.target.value)}
                  placeholder="e.g. Agentsentry Case Study"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Subdomain Slug (URL Path)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editSubdomain}
                  onChange={(e) => setEditSubdomain(e.target.value)}
                  placeholder="e.g. agentsentry-case-study"
                />
                <div style={{ fontSize: "12px", color: "#60a5fa", marginTop: "6px", fontFamily: "var(--font-mono)" }}>
                  Live URL: /sites/&lt;username&gt;/{editSubdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-")}/
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Custom Domain (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  placeholder="e.g. site.mycompany.io or app.agentsentry.ai"
                />
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  Point your DNS CNAME record to your MiniAWS Data Tier public IP or hostname.
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Website description"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDomainModalOpen(false)}
                  disabled={domainUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={domainUpdating}
                >
                  {domainUpdating ? "Saving..." : "Save Domain Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
