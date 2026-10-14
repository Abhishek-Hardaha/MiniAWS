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

  // Color-coded file badges matching Image 2
  const renderFileTypeBadge = (fileOrMime: any, maybeFilename?: string) => {
    let mime = "";
    let filename = "";
    let isFolder = false;

    if (typeof fileOrMime === "object" && fileOrMime !== null) {
      mime = fileOrMime.mime_type || "";
      filename = fileOrMime.original_filename || "";
      isFolder = !!fileOrMime.isFolder || mime === "folder";
    } else {
      mime = fileOrMime || "";
      filename = maybeFilename || "";
      isFolder = mime === "folder";
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";

    if (isFolder) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#0284c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(2, 132, 199, 0.4)",
            flexShrink: 0,
          }}
        >
          <Folder size={18} fill="#ffffff" />
        </div>
      );
    }
    if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0284c7, #38bdf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(2, 132, 199, 0.35)",
            flexShrink: 0,
          }}
        >
          <ImageIcon size={18} />
        </div>
      );
    }
    if (mime.includes("pdf") || ["pdf"].includes(ext)) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #e11d48, #f43f5e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(225, 29, 72, 0.35)",
            flexShrink: 0,
          }}
        >
          <FileText size={18} />
        </div>
      );
    }
    if (mime.includes("csv") || mime.includes("spreadsheet") || ["csv", "xlsx", "xls"].includes(ext)) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #059669, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(5, 150, 105, 0.35)",
            flexShrink: 0,
          }}
        >
          <FileSpreadsheet size={18} />
        </div>
      );
    }
    if (mime.includes("json") || mime.includes("javascript") || mime.includes("python") || ["py", "js", "ts", "json", "html", "css"].includes(ext)) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(124, 58, 237, 0.35)",
            flexShrink: 0,
          }}
        >
          <FileCode size={18} />
        </div>
      );
    }
    if (mime.startsWith("video/") || ["mp4", "mov", "avi", "webm"].includes(ext)) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #db2777, #ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(219, 39, 119, 0.35)",
            flexShrink: 0,
          }}
        >
          <Film size={18} />
        </div>
      );
    }
    if (mime.includes("zip") || mime.includes("compressed") || ["zip", "tar", "gz", "rar"].includes(ext)) {
      return (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(217, 119, 6, 0.35)",
            flexShrink: 0,
          }}
        >
          <FileArchive size={18} />
        </div>
      );
    }
    return (
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "rgba(148, 163, 184, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          flexShrink: 0,
        }}
      >
        <File size={18} />
      </div>
    );
  };

  // Demo items matching Image 2 for initial state
  const DEMO_ITEMS = [
    {
      id: "demo-folder-1",
      isFolder: true,
      original_filename: "Project Files",
      itemCount: 12,
      file_size: null,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      displayTime: "2 hours ago",
      mime_type: "folder",
    },
    {
      id: "demo-folder-2",
      isFolder: true,
      original_filename: "Assignments",
      itemCount: 8,
      file_size: null,
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      displayTime: "1 day ago",
      mime_type: "folder",
    },
    {
      id: "demo-file-1",
      isFolder: false,
      original_filename: "campus.jpg",
      file_size: 2516582,
      displaySize: "2.4 MB",
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      displayTime: "3 days ago",
      mime_type: "image/jpeg",
    },
    {
      id: "demo-file-2",
      isFolder: false,
      original_filename: "report.pdf",
      file_size: 1258291,
      displaySize: "1.2 MB",
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      displayTime: "4 days ago",
      mime_type: "application/pdf",
    },
    {
      id: "demo-file-3",
      isFolder: false,
      original_filename: "data.csv",
      file_size: 880640,
      displaySize: "860 KB",
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      displayTime: "5 days ago",
      mime_type: "text/csv",
    },
    {
      id: "demo-file-4",
      isFolder: false,
      original_filename: "script.py",
      file_size: 4198,
      displaySize: "4.1 KB",
      created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      displayTime: "1 week ago",
      mime_type: "text/x-python",
    },
  ];

  // Combined files list (real uploaded files displayed first, demo items following if list is fresh)
  const combinedFiles = files.length > 0 ? files : DEMO_ITEMS;

  // Filter files by tab
  const filteredFiles = combinedFiles.filter((f) => {
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

  const totalUsedBytes = quota?.storage_used_bytes || (files.length > 0 ? files.reduce((s, f) => s + (f.file_size || 0), 0) : 671088640); // 640 MB default
  const maxStorageBytes = quota?.storage_max_bytes || 5368709120; // 5 GB default
  const usedPercent = Math.min(100, Math.round((totalUsedBytes / maxStorageBytes) * 100)) || 12;
  const totalFilesCount = files.length > 0 ? files.length : 24;
  const totalFoldersCount = 6;

  return (
    <div className="content-wrapper" style={{ paddingBottom: "48px" }}>
      {/* 1. Header & Hero Section with Seamless 3D Graphic (Exact Image 2 Match) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          position: "relative",
          minHeight: "130px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "34px",
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

        {/* 3D Glass Folders Isometric Visual from Mockup (Seamlessly floating with no box border) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
            pointerEvents: "none",
            userSelect: "none",
            height: "160px",
            width: "300px",
          }}
        >
          <img
            src="/storage-3d-transparent.png"
            alt="StackSync Storage 3D Visual"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 14px 34px rgba(56, 189, 248, 0.28)) drop-shadow(0 4px 18px rgba(168, 85, 247, 0.22))",
            }}
          />
        </div>
      </div>

      {/* 2. Top Stats Bar (Storage Usage + Total Files + Folders) Matching Image 2 */}
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
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                {files.length > 0 ? formatBytes(totalUsedBytes) : "640 MB"} <span style={{ color: "#64748b", fontWeight: 500 }}>/ 5 GB</span>
              </span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8" }}>
                {usedPercent}%
              </span>
            </div>
          </div>

          {/* Glowing Gradient Progress Bar (Image 2) */}
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#131c2e",
              borderRadius: "9999px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${Math.max(2, usedPercent)}%`,
                height: "100%",
                background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)",
                borderRadius: "9999px",
                boxShadow: "0 0 16px rgba(56, 189, 248, 0.6), 0 0 8px rgba(192, 132, 252, 0.4)",
                transition: "width 0.4s ease-out",
              }}
            />
          </div>
        </div>

        {/* Card 2: Total Files (Image 2) */}
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
              {totalFilesCount}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
              Total Files
            </div>
          </div>
        </div>

        {/* Card 3: Folders (Image 2) */}
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
              {totalFoldersCount}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
              Folders
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

              {/* View Toggle: Grid / List (Image 2 Match) */}
              <div
                style={{
                  display: "flex",
                  background: "#0f172a",
                  borderRadius: "8px",
                  padding: "3px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  style={{
                    background: viewMode === "grid" ? "#2563eb" : "transparent",
                    color: viewMode === "grid" ? "#ffffff" : "#64748b",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    boxShadow: viewMode === "grid" ? "0 2px 8px rgba(37, 99, 235, 0.4)" : "none",
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="List View"
                  style={{
                    background: viewMode === "list" ? "#2563eb" : "transparent",
                    color: viewMode === "list" ? "#ffffff" : "#64748b",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    boxShadow: viewMode === "list" ? "0 2px 8px rgba(37, 99, 235, 0.4)" : "none",
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
                  <tr style={{ color: "#64748b", fontSize: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <th style={{ width: "36px", padding: "12px 8px" }}>
                      <button
                        onClick={toggleSelectAll}
                        style={{
                          background: selectedFileIds.size === sortedFiles.length && sortedFiles.length > 0 ? "#38bdf8" : "transparent",
                          border: selectedFileIds.size === sortedFiles.length && sortedFiles.length > 0 ? "1px solid #38bdf8" : "1px solid #334155",
                          borderRadius: "4px",
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {selectedFileIds.size === sortedFiles.length && sortedFiles.length > 0 && (
                          <Check size={12} color="#050811" strokeWidth={3} />
                        )}
                      </button>
                    </th>
                    <th style={{ padding: "12px 14px", fontWeight: 500 }}>Name</th>
                    <th style={{ padding: "12px 14px", fontWeight: 500, width: "120px" }}>Size</th>
                    <th style={{ padding: "12px 14px", fontWeight: 500, width: "130px" }}>Modified</th>
                    <th style={{ padding: "12px 14px", fontWeight: 500, width: "40px", textAlign: "right" }}></th>
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
                        className="storage-file-row"
                        style={{
                          background: isSelected ? "rgba(56, 189, 248, 0.05)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: "14px 8px" }}>
                          <button
                            onClick={(e) => toggleSelectFile(file.id, e)}
                            style={{
                              background: isSelected ? "#38bdf8" : "transparent",
                              border: isSelected ? "1px solid #38bdf8" : "1px solid #334155",
                              borderRadius: "4px",
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isSelected && <Check size={12} color="#050811" strokeWidth={3} />}
                          </button>
                        </td>

                        {/* File Name & Icon (Image 2 Match) */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {renderFileTypeBadge(file)}
                            <div>
                              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>
                                {file.original_filename}
                              </div>
                              {file.isFolder && (
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                  {file.itemCount} files
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Size */}
                        <td style={{ padding: "14px 14px", fontSize: "13px", color: "#94a3b8" }}>
                          {file.isFolder ? "—" : (file.displaySize || formatBytes(file.file_size))}
                        </td>

                        {/* Modified Time */}
                        <td style={{ padding: "14px 14px", fontSize: "12px", color: "#64748b" }}>
                          {file.displayTime || getRelativeTime(file.created_at)}
                        </td>

                        {/* Actions Menu (Three dots ⋮) */}
                        <td style={{ padding: "14px 14px", textAlign: "right", position: "relative" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(isMenuOpen ? null : file.id);
                            }}
                            className="icon-btn"
                            style={{ width: "28px", height: "28px", color: "#64748b" }}
                            title="File Options"
                          >
                            <MoreVertical size={16} />
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

        {/* Right Panel: Upload Box (Exact visual match to Image 2 with Prominent Animated Waves) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            background: "#0b1222",
            border: isDragging ? "2px dashed #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "44px 24px 36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
            minHeight: "440px",
          }}
        >
          {/* Prominent Multi-Layer Wave Animation (Image 2 Match & Extra Vibrant) */}
          <div className="upload-prominent-waves-container" style={{ height: "250px" }}>
            {/* Ambient Base Backlight Glow */}
            <div className="upload-waves-glow" />

            {/* Wave Layer 1 (Deep indigo back wave) */}
            <svg
              className="upload-waves-svg wave-layer-1"
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.75" />
                  <stop offset="45%" stopColor="#312e81" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path
                d="M0,130 C220,185 440,95 720,150 C1000,205 1220,115 1440,165 L1440,260 L0,260 Z"
                fill="url(#waveGrad1)"
              />
            </svg>

            {/* Wave Layer 2 (Mid-layer rich violet wave) */}
            <svg
              className="upload-waves-svg wave-layer-2"
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b0764" stopOpacity="0.8" />
                  <stop offset="55%" stopColor="#581c87" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.75" />
                </linearGradient>
              </defs>
              <path
                d="M0,175 C260,110 500,220 780,140 C1040,65 1260,185 1440,120 L1440,260 L0,260 Z"
                fill="url(#waveGrad2)"
              />
            </svg>

            {/* Wave Layer 3 (Foreground undulating crest with glowing stroke) */}
            <svg
              className="upload-waves-svg wave-layer-3"
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#2e1065" stopOpacity="0.92" />
                  <stop offset="70%" stopColor="#3730a3" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="waveCrestGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                  <stop offset="45%" stopColor="#c084fc" stopOpacity="0.85" />
                  <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d="M0,195 C240,150 480,230 740,175 C980,125 1200,195 1440,140 L1440,260 L0,260 Z"
                fill="url(#waveGrad3)"
                stroke="url(#waveCrestGlow)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Cloud Upload Icon with Glowing Aura (Image 2 Match) */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              marginBottom: "18px",
              boxShadow: "0 0 28px rgba(56, 189, 248, 0.22)",
            }}
          >
            <UploadCloud size={32} strokeWidth={2.2} />
          </div>

          {/* Heading */}
          <h3
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: "18px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            Upload Files
          </h3>

          {/* Subtitle */}
          <p
            style={{
              position: "relative",
              zIndex: 2,
              color: "#94a3b8",
              fontSize: "13px",
              lineHeight: 1.5,
              maxWidth: "220px",
              marginBottom: "24px",
            }}
          >
            Drag and drop files here or click to browse
          </p>

          {/* Choose Files Button (Vibrant Gradient Pill Matching Image 2) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              position: "relative",
              zIndex: 2,
              background: "linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              padding: "11px 28px",
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(168, 85, 247, 0.4)",
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
            <div style={{ position: "relative", zIndex: 2, width: "85%", marginTop: "24px" }}>
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
              position: "relative",
              zIndex: 2,
              marginTop: "28px",
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
