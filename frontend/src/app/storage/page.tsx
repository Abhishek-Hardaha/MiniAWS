"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Download,
  Eye,
  Trash2,
  File,
  Image as ImageIcon,
  FileCode,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Film,
  Folder,
  AlertCircle,
  RefreshCw,
  X,
  LayoutGrid,
  List,
  MoreVertical,
  UploadCloud,
  Check,
  Copy,
  Link as LinkIcon,
  CheckSquare,
  Square,
  ChevronDown,
} from "lucide-react";
import { listFiles, uploadFile, deleteFile, getDashboardSummary } from "@/lib/api";

export default function StoragePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");

  // UI state matching Storage.png
  const [activeTab, setActiveTab] = useState<string>("All Files");
  const [sortBy, setSortBy] = useState<string>("modified");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    listFiles()
      .then((res) => setFiles(res || []))
      .catch((err) => console.error(err));

    getDashboardSummary()
      .then((res) => setQuota(res?.quotas || null))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpenId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await processFileUpload(file);
    e.target.value = "";
  };

  const processFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploading(true);
    setUploadProgress(20);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev && prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      await uploadFile(file);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setSuccessMsg(`"${file.name}" uploaded successfully to S3 storage.`);
      setTimeout(() => {
        setUploadProgress(null);
        setSuccessMsg(null);
      }, 3500);
      loadData();
    } catch (err: any) {
      clearInterval(progressTimer);
      setUploadProgress(null);
      setErrorMsg(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
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
      const file = e.dataTransfer.files[0];
      await processFileUpload(file);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file from S3 storage?")) return;
    try {
      await deleteFile(fileId);
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
      loadData();
    } catch (err: any) {
      alert(`Error deleting file: ${err.message}`);
    }
  };

  const handleCopyPresignedUrl = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/api/storage/download/${file.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2500);
    setActionMenuOpenId(null);
  };

  const handlePreview = async (file: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionMenuOpenId(null);
    setPreviewFile(file);
    setPreviewContent("Loading preview...");
    try {
      const res = await fetch(`/api/storage/download/${file.id}?preview=true`);
      if (file.mime_type?.startsWith("image/")) {
        setPreviewContent("image");
      } else {
        const text = await res.text();
        setPreviewContent(text.slice(0, 10000));
      }
    } catch {
      setPreviewContent("Failed to load file preview.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedFileIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const toggleSelectFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 3 ? 2 : 1)) + " " + sizes[i];
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
      if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Color-coded file badge
  const renderFileTypeBadge = (mime: string, filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";

    if (mime?.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
      return (
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
          <ImageIcon size={17} />
        </div>
      );
    }
    if (mime?.includes("pdf") || ["pdf"].includes(ext)) {
      return (
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(244, 63, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e" }}>
          <FileText size={17} />
        </div>
      );
    }
    if (mime?.includes("csv") || mime?.includes("spreadsheet") || ["csv", "xlsx", "xls"].includes(ext)) {
      return (
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
          <FileSpreadsheet size={17} />
        </div>
      );
    }
    if (mime?.includes("json") || mime?.includes("javascript") || mime?.includes("python") || ["py", "js", "ts", "json", "html", "css"].includes(ext)) {
      return (
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
          <FileCode size={17} />
        </div>
      );
    }
    if (mime?.startsWith("video/") || ["mp4", "mov", "avi", "webm"].includes(ext)) {
      return (
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(236, 72, 153, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899" }}>
          <Film size={17} />
        </div>
      );
    }
    if (mime?.includes("zip") || mime?.includes("compressed") || ["zip", "tar", "gz", "rar"].includes(ext)) {
      return (
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
          <FileArchive size={17} />
        </div>
      );
    }
    return (
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(148, 163, 184, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        <File size={17} />
      </div>
    );
  };

  // Filter files by tab
  const filteredFiles = files.filter((f) => {
    const ext = f.original_filename?.split(".").pop()?.toLowerCase() || "";
    const mime = f.mime_type || "";

    if (activeTab === "Images") {
      return mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext);
    }
    if (activeTab === "Documents") {
      return mime.includes("pdf") || mime.includes("text") || ["pdf", "doc", "docx", "txt", "md"].includes(ext);
    }
    if (activeTab === "Videos") {
      return mime.startsWith("video/") || ["mp4", "mov", "avi", "webm"].includes(ext);
    }
    if (activeTab === "Archives") {
      return mime.includes("zip") || mime.includes("compressed") || ["zip", "tar", "gz", "rar"].includes(ext);
    }
    return true; // All Files
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "name") {
      return (a.original_filename || "").localeCompare(b.original_filename || "");
    }
    if (sortBy === "size") {
      return (b.file_size || 0) - (a.file_size || 0);
    }
    // Default: modified date desc
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const totalUsedBytes = quota?.storage_used_bytes || files.reduce((s, f) => s + (f.file_size || 0), 0) || 0;
  const maxStorageBytes = quota?.storage_max_bytes || 5368709120; // 5 GB default
  const usedPercent = Math.min(100, Math.round((totalUsedBytes / maxStorageBytes) * 100));

  return (
    <div className="content-wrapper" style={{ paddingBottom: "48px" }}>
      {/* 1. Header & Hero Section with 3D Graphic (Inspiration from Storage.png) */}
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
            Storage
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              marginTop: "6px",
              fontWeight: 400,
            }}
          >
            Upload, manage and access your files securely.
          </p>
        </div>

        {/* 3D Glass Folders Isometric Visual from Mockup */}
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
            src="/storage-3d-folders.png"
            alt="MiniAWS Storage"
            style={{
              height: "115px",
              objectFit: "contain",
              filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.6))",
            }}
          />
        </div>
      </div>

      {/* 2. Top Stats Bar (Storage Usage + Total Files + Folders) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.7fr 1fr 1fr",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {/* Card 1: Storage Usage Progress */}
        <div
          style={{
            background: "#0b1222",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
              Storage Usage
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                {formatBytes(totalUsedBytes)} <span style={{ color: "#64748b", fontWeight: 500 }}>/ {formatBytes(maxStorageBytes)}</span>
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

        {/* Card 2: Total Files */}
        <div
          style={{
            background: "#0b1222",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              flexShrink: 0,
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
              {files.length}
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
              Total Files
            </div>
          </div>
        </div>

        {/* Card 3: Folders */}
        <div
          style={{
            background: "#0b1222",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(168, 85, 247, 0.12)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c084fc",
              flexShrink: 0,
            }}
          >
            <Folder size={22} />
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
              {Math.max(1, new Set(files.map((f) => f.original_filename?.split("/")[0] || "root")).size)}
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
              Buckets &amp; Folders
            </div>
          </div>
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

      {/* 3. Main Split Content: File Table on Left (72%) + Upload Panel on Right (28%) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "22px",
          alignItems: "start",
        }}
      >
        {/* Left Panel: File Explorer & Table */}
        <div
          style={{
            background: "#0b1222",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "20px 24px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Toolbar Row: Filter Tabs on Left + Sort & View Modes on Right */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
              paddingBottom: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Category Filter Tabs */}
            <div style={{ display: "flex", gap: "22px" }}>
              {["All Files", "Images", "Documents", "Videos", "Archives"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: "none",
                      border: "none",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      padding: "4px 0",
                      position: "relative",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {tab}
                    {isActive && (
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
                );
              })}
            </div>

            {/* Right Toolbar Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Sort Dropdown */}
              <div style={{ position: "relative" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    color: "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "6px 28px 6px 12px",
                    cursor: "pointer",
                    appearance: "none",
                    outline: "none",
                  }}
                >
                  <option value="modified">Last Modified</option>
                  <option value="name">File Name</option>
                  <option value="size">File Size</option>
                </select>
                <ChevronDown
                  size={13}
                  color="#64748b"
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
              </div>

              {/* View Toggle: Grid / List */}
              <div
                style={{
                  display: "flex",
                  background: "#0f172a",
                  borderRadius: "8px",
                  padding: "2px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  style={{
                    background: viewMode === "grid" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: viewMode === "grid" ? "#38bdf8" : "#64748b",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 7px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="List View"
                  style={{
                    background: viewMode === "list" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: viewMode === "list" ? "#38bdf8" : "#64748b",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 7px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <List size={15} />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                className="icon-btn"
                onClick={loadData}
                title="Refresh Files"
                style={{ width: "30px", height: "30px" }}
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* File Items Area */}
          {sortedFiles.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#64748b",
              }}
            >
              <UploadCloud size={40} color="#334155" style={{ margin: "0 auto 12px auto" }} />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                No files found in this category
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Upload files using the panel on the right to start storing data.
              </div>
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW (Exact table layout from Storage.png) */
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ color: "#64748b", fontSize: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <th style={{ width: "36px", padding: "10px 8px" }}>
                      <button
                        onClick={toggleSelectAll}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 0 }}
                      >
                        {selectedFileIds.size === sortedFiles.length && sortedFiles.length > 0 ? (
                          <CheckSquare size={16} color="#38bdf8" />
                        ) : (
                          <Square size={16} color="#475569" />
                        )}
                      </button>
                    </th>
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600, width: "110px" }}>Size</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600, width: "130px" }}>Modified</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600, width: "40px", textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiles.map((file) => {
                    const isSelected = selectedFileIds.has(file.id);
                    const isMenuOpen = actionMenuOpenId === file.id;
                    const isCopied = copiedId === file.id;

                    return (
                      <tr
                        key={file.id}
                        onClick={() => handlePreview(file)}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                          background: isSelected ? "rgba(56, 189, 248, 0.05)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: "12px 8px" }}>
                          <button
                            onClick={(e) => toggleSelectFile(file.id, e)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
                          >
                            {isSelected ? (
                              <CheckSquare size={16} color="#38bdf8" />
                            ) : (
                              <Square size={16} color="#475569" />
                            )}
                          </button>
                        </td>

                        {/* File Name & Icon */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {renderFileTypeBadge(file.mime_type, file.original_filename)}
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                                {file.original_filename}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                {file.mime_type}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Size */}
                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                          {formatBytes(file.file_size)}
                        </td>

                        {/* Modified Time */}
                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#64748b" }}>
                          {getRelativeTime(file.created_at)}
                        </td>

                        {/* Actions Menu (Three dots ⋮) */}
                        <td style={{ padding: "12px 14px", textAlign: "right", position: "relative" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(isMenuOpen ? null : file.id);
                            }}
                            className="icon-btn"
                            style={{ width: "28px", height: "28px", color: "#94a3b8" }}
                            title="File Options"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {/* Action Popover Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                right: "12px",
                                top: "42px",
                                width: "190px",
                                background: "#0f172a",
                                border: "1px solid rgba(255, 255, 255, 0.12)",
                                borderRadius: "10px",
                                padding: "6px",
                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
                                zIndex: 50,
                                textAlign: "left",
                              }}
                            >
                              <button
                                onClick={(e) => handlePreview(file, e)}
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
                                <Eye size={14} color="#38bdf8" />
                                <span>Preview File</span>
                              </button>

                              <button
                                onClick={(e) => handleCopyPresignedUrl(file, e)}
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
                                {isCopied ? <Check size={14} color="#34d399" /> : <LinkIcon size={14} color="#818cf8" />}
                                <span>{isCopied ? "Link Copied!" : "Copy Presigned URL"}</span>
                              </button>

                              <a
                                href={`/api/storage/download/${file.id}`}
                                download
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
                                  cursor: "pointer",
                                  boxSizing: "border-box",
                                }}
                              >
                                <Download size={14} color="#10b981" />
                                <span>Download File</span>
                              </a>

                              <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "4px 0" }} />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpenId(null);
                                  handleDelete(file.id);
                                }}
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
                                <span>Delete File</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW MODE */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              {sortedFiles.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => handlePreview(file)}
                    style={{
                      background: isSelected ? "rgba(56, 189, 248, 0.08)" : "#0f172a",
                      border: isSelected ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "14px",
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      {renderFileTypeBadge(file.mime_type, file.original_filename)}
                      <button
                        onClick={(e) => toggleSelectFile(file.id, e)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {isSelected ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color="#475569" />}
                      </button>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#ffffff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={file.original_filename}
                      >
                        {file.original_filename}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                        <span>{formatBytes(file.file_size)}</span>
                        <span>{getRelativeTime(file.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Upload Box (Exact visual match to Storage.png) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            background: "#0b1222",
            border: isDragging ? "2px dashed #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
            minHeight: "420px",
          }}
        >
          {/* Subtle Ambient Wave Effect at Bottom (Matching Storage.png) */}
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "-30px",
              right: "-30px",
              height: "170px",
              background: "radial-gradient(ellipse at bottom, rgba(56, 189, 248, 0.14) 0%, rgba(168, 85, 247, 0.12) 50%, transparent 80%)",
              filter: "blur(24px)",
              pointerEvents: "none",
            }}
          />

          {/* Cloud Upload Icon with Glowing Aura */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              marginBottom: "20px",
              boxShadow: "0 0 24px rgba(56, 189, 248, 0.2)",
            }}
          >
            <UploadCloud size={34} strokeWidth={2.2} />
          </div>

          {/* Heading */}
          <h3
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            Upload Files
          </h3>

          {/* Subtitle */}
          <p
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              lineHeight: 1.5,
              maxWidth: "230px",
              marginBottom: "24px",
            }}
          >
            Drag and drop files here or click to browse
          </p>

          {/* Choose Files Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              padding: "11px 28px",
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 18px rgba(168, 85, 247, 0.4)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            {uploading ? "Uploading..." : "Choose Files"}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={uploading}
          />

          {/* Upload Progress Bar if active */}
          {uploadProgress !== null && (
            <div style={{ width: "85%", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>
                <span>Transferring to S3...</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#1e293b", borderRadius: "9999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #38bdf8, #a855f7)",
                    transition: "width 0.2s ease-out",
                  }}
                />
              </div>
            </div>
          )}

          {/* S3 Security Footnote */}
          <div
            style={{
              marginTop: "32px",
              fontSize: "11px",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Encrypted • 5 GB Quota Isolation</span>
          </div>
        </div>
      </div>

      {/* 4. Preview Modal */}
      {previewFile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {renderFileTypeBadge(previewFile.mime_type, previewFile.original_filename)}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                    {previewFile.original_filename}
                  </h3>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    {formatBytes(previewFile.file_size)} • {previewFile.mime_type}
                  </div>
                </div>
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px" }}>
              <button
                className="btn-secondary"
                onClick={(e) => handleCopyPresignedUrl(previewFile, e)}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
              >
                <LinkIcon size={14} />
                <span>Copy Presigned URL</span>
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <a
                  href={`/api/storage/download/${previewFile.id}`}
                  download
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "12px" }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button className="btn-secondary" onClick={() => setPreviewFile(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
