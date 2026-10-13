"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Settings,
  Link as LinkIcon,
  UploadCloud,
  Check,
  Calendar,
  HardDrive,
  MoreVertical,
  Info,
} from "lucide-react";
import {
  listWebsites,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  getWebsiteSource,
  updateWebsiteDomain,
  getDashboardSummary,
} from "@/lib/api";

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
  const [quota, setQuota] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"websites" | "preview">("websites");
  const [selectedPreviewSite, setSelectedPreviewSite] = useState<any | null>(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeSite, setActiveSite] = useState<any | null>(null);
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [domainSite, setDomainSite] = useState<any | null>(null);

  // Action popover
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [siteName, setSiteName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [description, setDescription] = useState("");
  const [htmlContent, setHtmlContent] = useState(DEFAULT_SAMPLE_HTML);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop upload state
  const [isDragging, setIsDragging] = useState(false);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Domain form
  const [editSubdomain, setEditSubdomain] = useState("");
  const [editCustomDomain, setEditCustomDomain] = useState("");
  const [editSiteName, setEditSiteName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadData = () => {
    listWebsites()
      .then((res) => {
        setWebsites(res || []);
        if (res && res.length > 0 && !selectedPreviewSite) {
          setSelectedPreviewSite(res[0]);
        }
      })
      .catch((err) => console.error(err));

    getDashboardSummary()
      .then((res) => setQuota(res?.quotas || null))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActionMenuOpenId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const generatedSubdomain = subdomain.trim() || siteName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      await createWebsite({
        site_name: siteName.trim(),
        subdomain: generatedSubdomain,
        custom_domain: customDomain.trim() || undefined,
        description: description.trim() || undefined,
        index_html: htmlContent,
      });
      setSuccessMsg(`Website "${siteName}" deployed successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create website");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSiteName("");
    setSubdomain("");
    setCustomDomain("");
    setDescription("");
    setHtmlContent(DEFAULT_SAMPLE_HTML);
    setErrorMsg(null);
  };

  const handleEditClick = async (site: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpenId(null);
    setActiveSite(site);
    setErrorMsg(null);
    try {
      const res = await getWebsiteSource(site.id);
      setHtmlContent(res.index_html || DEFAULT_SAMPLE_HTML);
      setEditModalOpen(true);
    } catch (err: any) {
      alert(`Could not fetch HTML source: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await updateWebsite(activeSite.id, {
        index_html: htmlContent,
      });
      setSuccessMsg(`Website "${activeSite.site_name}" updated and redeployed!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setEditModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update website");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDomainClick = (site: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpenId(null);
    setDomainSite(site);
    setEditSubdomain(site.subdomain || "");
    setEditCustomDomain(site.custom_domain || "");
    setEditSiteName(site.site_name || "");
    setEditDescription(site.description || "");
    setErrorMsg(null);
    setDomainModalOpen(true);
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSite) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await updateWebsiteDomain(domainSite.id, {
        site_name: editSiteName.trim() || undefined,
        subdomain: editSubdomain.trim() || undefined,
        custom_domain: editCustomDomain.trim() || undefined,
        description: editDescription.trim() || undefined,
      });
      setSuccessMsg("Domain & URL routing updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
      setDomainModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update domain configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (siteId: string, siteName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpenId(null);
    if (!confirm(`Are you sure you want to delete website "${siteName}"? This will free your hosting quota.`)) return;
    try {
      await deleteWebsite(siteId);
      setSuccessMsg(`Website "${siteName}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    } catch (err: any) {
      alert(`Error deleting website: ${err.message}`);
    }
  };

  const handleCopyLink = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    setActionMenuOpenId(null);
  };

  // Direct File Upload from right box
  const handleDirectFileUpload = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm") && !file.name.endsWith(".zip")) {
      setErrorMsg("Please upload a valid .html file (named index.html) or a .zip archive.");
      return;
    }

    try {
      const text = await file.text();
      const derivedName = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "-") || "my-website";
      setIsSubmitting(true);
      await createWebsite({
        site_name: derivedName,
        subdomain: derivedName,
        index_html: text,
      });
      setSuccessMsg(`Website "${derivedName}" uploaded and deployed successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to deploy website from file");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleDirectFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const maxWebsites = quota?.websites_max || 3;
  const usedWebsites = websites.length;
  const usedPercent = Math.min(100, Math.round((usedWebsites / maxWebsites) * 100));

  return (
    <div className="content-wrapper" style={{ paddingBottom: "48px" }}>
      {/* 1. Hero Header & 3D Neon Glass Browser Graphic */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          position: "relative",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Web Hosting
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              marginTop: "6px",
              fontWeight: 400,
            }}
          >
            Host and manage your static websites with ease.
          </p>
        </div>

        {/* 3D Glass Browser Mockup Graphic from Web_Hosting.png */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <img
            src="/web-hosting-3d-graphic.png"
            alt="MiniAWS Web Hosting"
            style={{
              height: "115px",
              objectFit: "contain",
              filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.6))",
            }}
          />
        </div>
      </div>

      {/* 2. Top Stats Bar (Website Hosting Usage matching Web_Hosting.png) */}
      <div
        style={{
          background: "#0b1222",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
            Website Hosting
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
              <span style={{ color: "#38bdf8" }}>{usedWebsites}</span> / {maxWebsites} website used
            </span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>
              {usedPercent}%
            </span>
          </div>
        </div>

        {/* Glowing Gradient Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#161f36",
            borderRadius: "9999px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${Math.max(2, usedPercent)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 60%, #c084fc 100%)",
              borderRadius: "9999px",
              boxShadow: "0 0 12px rgba(56, 189, 248, 0.5)",
              transition: "width 0.4s ease-out",
            }}
          />
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            padding: "12px 18px",
            marginBottom: "20px",
            color: "#34d399",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "12px 18px",
            marginBottom: "20px",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. Main Split Layout: Left Panel (70%) + Right Panel (30%) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "22px",
          alignItems: "start",
        }}
      >
        {/* Left Panel: My Websites / Preview */}
        <div
          style={{
            background: "#0b1222",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "20px 24px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Header Toolbar: Tabs + New Website Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
              paddingBottom: "16px",
              marginBottom: "20px",
            }}
          >
            {/* Tabs: My Websites / Preview */}
            <div style={{ display: "flex", gap: "24px" }}>
              <button
                onClick={() => setActiveTab("websites")}
                style={{
                  background: "none",
                  border: "none",
                  color: activeTab === "websites" ? "#ffffff" : "#94a3b8",
                  fontSize: "14px",
                  fontWeight: activeTab === "websites" ? 700 : 500,
                  padding: "4px 0",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                My Websites
                {activeTab === "websites" && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-17px",
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: "linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)",
                      borderRadius: "3px 3px 0 0",
                      boxShadow: "0 0 8px rgba(56, 189, 248, 0.6)",
                    }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab("preview")}
                style={{
                  background: "none",
                  border: "none",
                  color: activeTab === "preview" ? "#ffffff" : "#94a3b8",
                  fontSize: "14px",
                  fontWeight: activeTab === "preview" ? 700 : 500,
                  padding: "4px 0",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                Preview
                {activeTab === "preview" && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-17px",
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: "linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)",
                      borderRadius: "3px 3px 0 0",
                      boxShadow: "0 0 8px rgba(56, 189, 248, 0.6)",
                    }}
                  />
                )}
              </button>
            </div>

            {/* Right: + New Website Button */}
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                padding: "8px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 18px rgba(168, 85, 247, 0.35)",
              }}
            >
              <Plus size={16} />
              <span>New Website</span>
            </button>
          </div>

          {/* Tab 1: Websites Cards List (Matching Web_Hosting.png) */}
          {activeTab === "websites" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {websites.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#64748b",
                  }}
                >
                  <Globe size={40} color="#334155" style={{ margin: "0 auto 12px auto" }} />
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                    No static websites hosted yet
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                    Click &quot;New Website&quot; or upload your index.html file to deploy your first static site.
                  </div>
                </div>
              ) : (
                websites.map((site) => {
                  const isMenuOpen = actionMenuOpenId === site.id;
                  const isCopied = copiedId === site.id;
                  const siteUrl = site.domain_url || site.site_url || `https://${site.subdomain}.miniaws.cloud`;

                  return (
                    <div
                      key={site.id}
                      style={{
                        background: "#0c1322",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "18px 20px",
                        display: "grid",
                        gridTemplateColumns: "250px 1fr",
                        gap: "22px",
                        alignItems: "center",
                        position: "relative",
                        transition: "border-color 0.15s ease",
                      }}
                    >
                      {/* Left: Website Preview Thumbnail (Mountain mockup or live preview miniature) */}
                      <div
                        onClick={() => {
                          setSelectedPreviewSite(site);
                          setActiveTab("preview");
                        }}
                        style={{
                          height: "155px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          cursor: "pointer",
                          background: "#050811",
                        }}
                        title="Click to open interactive preview"
                      >
                        <img
                          src="/website-preview-mockup.png"
                          alt={site.site_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            background: "rgba(0, 0, 0, 0.65)",
                            backdropFilter: "blur(4px)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            color: "#fff",
                            fontSize: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Eye size={11} color="#38bdf8" />
                          <span>Preview</span>
                        </div>
                      </div>

                      {/* Right: Site Details & Controls */}
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                        <div>
                          {/* Title & Options Menu */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h3
                                style={{
                                  fontSize: "18px",
                                  fontWeight: 700,
                                  color: "#ffffff",
                                  lineHeight: 1.2,
                                  marginBottom: "6px",
                                }}
                              >
                                {site.site_name}
                              </h3>

                              {/* Live URL with External Link */}
                              <a
                                href={siteUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  color: "#38bdf8",
                                  fontSize: "13px",
                                  textDecoration: "none",
                                  fontWeight: 500,
                                }}
                              >
                                <span>{siteUrl}</span>
                                <ExternalLink size={13} />
                              </a>
                            </div>

                            {/* Options Button ⋮ */}
                            <div style={{ position: "relative" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpenId(isMenuOpen ? null : site.id);
                                }}
                                className="icon-btn"
                                style={{ width: "30px", height: "30px", color: "#94a3b8" }}
                                title="Site Options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Popover Action Menu */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "36px",
                                    width: "200px",
                                    background: "#0f172a",
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                    borderRadius: "10px",
                                    padding: "6px",
                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
                                    zIndex: 50,
                                    textAlign: "left",
                                  }}
                                >
                                  <a
                                    href={siteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      background: "transparent",
                                      borderRadius: "6px",
                                      color: "#e2e8f0",
                                      fontSize: "12px",
                                      textDecoration: "none",
                                      boxSizing: "border-box",
                                    }}
                                  >
                                    <ExternalLink size={14} color="#38bdf8" />
                                    <span>Open Live Site</span>
                                  </a>

                                  <button
                                    onClick={(e) => handleEditClick(site, e)}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      background: "transparent",
                                      border: "none",
                                      borderRadius: "6px",
                                      color: "#e2e8f0",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Code2 size={14} color="#a855f7" />
                                    <span>Edit Source HTML</span>
                                  </button>

                                  <button
                                    onClick={(e) => handleDomainClick(site, e)}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      background: "transparent",
                                      border: "none",
                                      borderRadius: "6px",
                                      color: "#e2e8f0",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Settings size={14} color="#60a5fa" />
                                    <span>Custom Domain</span>
                                  </button>

                                  <button
                                    onClick={(e) => handleCopyLink(siteUrl, site.id, e)}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      background: "transparent",
                                      border: "none",
                                      borderRadius: "6px",
                                      color: isCopied ? "#34d399" : "#e2e8f0",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {isCopied ? <Check size={14} color="#34d399" /> : <Copy size={14} color="#94a3b8" />}
                                    <span>{isCopied ? "URL Copied!" : "Copy Live URL"}</span>
                                  </button>

                                  <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "4px 0" }} />

                                  <button
                                    onClick={(e) => handleDelete(site.id, site.site_name, e)}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      background: "transparent",
                                      border: "none",
                                      borderRadius: "6px",
                                      color: "#f87171",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Trash2 size={14} color="#f87171" />
                                    <span>Delete Website</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Published Status Pill */}
                          <div style={{ marginTop: "14px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(16, 185, 129, 0.12)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                borderRadius: "9999px",
                                padding: "4px 12px",
                                color: "#34d399",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                              Published
                            </span>
                          </div>
                        </div>

                        {/* Metadata row: Last updated + File size */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "24px",
                            fontSize: "12px",
                            color: "#94a3b8",
                            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                            paddingTop: "12px",
                            marginTop: "16px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Calendar size={14} color="#64748b" />
                            <span>Last updated <strong style={{ color: "#e2e8f0" }}>{getRelativeTime(site.created_at)}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <HardDrive size={14} color="#64748b" />
                            <span>File size <strong style={{ color: "#e2e8f0" }}>420 KB</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Full Interactive Preview */}
          {activeTab === "preview" && (
            <div>
              {websites.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  Deploy a website first to view interactive live preview.
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>Previewing:</span>
                      <select
                        value={selectedPreviewSite?.id || ""}
                        onChange={(e) => {
                          const s = websites.find((w) => w.id === e.target.value);
                          if (s) setSelectedPreviewSite(s);
                        }}
                        style={{
                          background: "#0f172a",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "8px",
                          color: "#fff",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {websites.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.site_name} ({w.domain_url || w.site_url})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedPreviewSite && (
                      <a
                        href={selectedPreviewSite.domain_url || selectedPreviewSite.site_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", textDecoration: "none" }}
                      >
                        <span>Open in New Tab</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>

                  {selectedPreviewSite && (
                    <div
                      style={{
                        height: "500px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        background: "#000",
                      }}
                    >
                      <iframe
                        src={selectedPreviewSite.domain_url || selectedPreviewSite.site_url}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="Website Preview"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Upload Box & Need help? (Matching Web_Hosting.png) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Card 1: Upload Website */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              background: "#0b1222",
              border: isDragging ? "2px dashed #38bdf8" : "1px dashed rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              padding: "36px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Glowing Cloud Upload Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
                marginBottom: "18px",
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.2)",
              }}
            >
              <UploadCloud size={32} strokeWidth={2.2} />
            </div>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "6px",
              }}
            >
              Upload Website
            </h3>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                lineHeight: 1.5,
                maxWidth: "220px",
                marginBottom: "20px",
              }}
            >
              Upload your <code style={{ color: "#38bdf8", fontWeight: 600 }}>index.html</code> file to host your website
            </p>

            {/* Choose File Button */}
            <button
              onClick={() => uploadFileInputRef.current?.click()}
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                padding: "10px 28px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 18px rgba(168, 85, 247, 0.4)",
                marginBottom: "20px",
              }}
            >
              {isSubmitting ? "Deploying..." : "Choose File"}
            </button>

            {/* Hidden Input */}
            <input
              ref={uploadFileInputRef}
              type="file"
              accept=".html,.htm,.zip"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleDirectFileUpload(e.target.files[0]);
                  e.target.value = "";
                }
              }}
              disabled={isSubmitting}
            />

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                color: "#64748b",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
              <span style={{ padding: "0 10px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
            </div>

            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Drag and drop your <span style={{ color: "#94a3b8", fontWeight: 600 }}>index.html</span> here
            </div>
          </div>

          {/* Card 2: Need help? Callout */}
          <div
            style={{
              background: "#0b1222",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(56, 189, 248, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                }}
              >
                <Info size={16} />
              </div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                Need help?
              </h4>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6, margin: 0 }}>
              Your website must be a single HTML file named <code style={{ color: "#38bdf8" }}>index.html</code> (or a ZIP bundle). It is deployed instantly to the high-performance Nginx static web tier with automatic isolated directory routing.
            </p>
          </div>
        </div>
      </div>

      {/* Modal 1: + New Website Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={20} color="#38bdf8" />
                <span>Deploy New Website</span>
              </h2>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                    Website Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Portfolio"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                    Subdomain / Slug *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. portfolio"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. portfolio.mybrand.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                  index.html Source Code
                </label>
                <textarea
                  rows={8}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#050811",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#38bdf8",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "10px 22px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Deploying..." : "Deploy Website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit HTML Source */}
      {editModalOpen && activeSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "780px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Code2 size={20} color="#a855f7" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  Edit Code: {activeSite.site_name}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "16px" }}>
                <textarea
                  rows={16}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#050811",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#38bdf8",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "10px 22px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save & Redeploy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Custom Domain & Routing Settings */}
      {domainModalOpen && domainSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={20} color="#38bdf8" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  Domain &amp; Routing: {domainSite.site_name}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setDomainModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDomain}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                  Website Name
                </label>
                <input
                  type="text"
                  value={editSiteName}
                  onChange={(e) => setEditSiteName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                  Subdomain Route
                </label>
                <input
                  type="text"
                  value={editSubdomain}
                  onChange={(e) => setEditSubdomain(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                  Custom Domain CNAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. app.mydomain.com"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setDomainModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "10px 22px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Update Routing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
