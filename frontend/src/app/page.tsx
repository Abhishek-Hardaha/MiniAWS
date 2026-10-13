"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  Globe,
  Code2,
  Share2,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Upload,
  Layers,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { getDashboardSummary } from "@/lib/api";

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  const userName = data?.user?.full_name || "Cloud User";
  const quotas = data?.quotas || {
    storage_used_bytes: 0,
    storage_max_bytes: 5368709120,
    storage_percent: 0,
    functions_used: 0,
    functions_max: 5,
    functions_percent: 0,
    api_requests_today: 0,
    api_requests_max: 500,
    api_requests_percent: 0,
    websites_used: 0,
    websites_max: 3,
    websites_percent: 0,
  };
  const activities = data?.recent_activity || [];

  const formatStorage = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="content-wrapper">
      {/* Hero Card */}
      <section className="hero-card">
        <div className="hero-left">
          <h1 className="hero-title">
            {userName} <span style={{ fontSize: "28px" }}>👋</span>
          </h1>
          <p className="hero-sub">
            Your cloud environment is ready.<br />
            Build, deploy and manage your resources.
          </p>
        </div>

        {/* Hero Background Art matching reference photo */}
        <div
          className="hero-bg-art"
          style={{ backgroundImage: "url('/bg-cloud.png')" }}
        />
      </section>

      {/* 5 Quick Service Cards Grid */}
      <div className="services-grid">
        {/* 1. Storage */}
        <Link href="/storage" className="service-card card-storage">
          <div>
            <div className="card-icon-box">
              <Database size={22} color="#14b8a6" />
            </div>
            <div className="card-title">Storage</div>
            <div className="card-desc">
              Upload, manage and access your files securely.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 2. Web Hosting */}
        <Link href="/web-hosting" className="service-card card-web">
          <div>
            <div className="card-icon-box">
              <Globe size={22} color="#3b82f6" />
            </div>
            <div className="card-title">Web Hosting</div>
            <div className="card-desc">
              Host your HTML website with a single upload.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 3. Serverless Functions */}
        <Link href="/functions" className="service-card card-functions">
          <div>
            <div className="card-icon-box">
              <Code2 size={22} color="#8b5cf6" />
            </div>
            <div className="card-title">Serverless Functions</div>
            <div className="card-desc">
              Run your Python code on demand or on schedule.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 4. API Gateway */}
        <Link href="/api-gateway" className="service-card card-gateway">
          <div>
            <div className="card-icon-box">
              <Share2 size={22} color="#f97316" />
            </div>
            <div className="card-title">API Gateway</div>
            <div className="card-desc">
              Expose your functions as secure APIs.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>

        {/* 5. Monitoring */}
        <Link href="/monitoring" className="service-card card-monitoring">
          <div>
            <div className="card-icon-box">
              <BarChart3 size={22} color="#ec4899" />
            </div>
            <div className="card-title">Monitoring</div>
            <div className="card-desc">
              Track performance, logs and usage.
            </div>
          </div>
          <div className="card-arrow-btn">
            <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      {/* Dashboard Lower Section */}
      <div className="dashboard-lower-grid">
        {/* Left: Your Cloud Usage */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Your Cloud Usage</h2>
            <div
              className="panel-action-btn"
              onClick={() => alert(`Current Plan: ${quotas.plan_tier || "Developer"}\n\nStorage Quota: 5 GB\nFunction Slots: 3\nDaily API Quota: 500 requests\nWebsites: 1`)}
            >
              <span>Current Plan</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="usage-grid">
            {/* Storage Quota */}
            <div className="usage-item">
              <div className="usage-item-top">
                <div
                  className="usage-icon-wrap"
                  style={{
                    backgroundColor: "rgba(20, 184, 166, 0.15)",
                    border: "1px solid rgba(20, 184, 166, 0.3)",
                  }}
                >
                  <Database size={18} color="#14b8a6" />
                </div>
                <div>
                  <div className="usage-title">Storage</div>
                  <div className="usage-val">
                    {formatStorage(quotas.storage_used_bytes)} / {formatStorage(quotas.storage_max_bytes)}
                  </div>
                </div>
              </div>
              <div className="usage-bar-track">
                <div
                  className="usage-bar-fill"
                  style={{
                    width: `${quotas.storage_percent}%`,
                    backgroundColor: "#14b8a6",
                    boxShadow: "0 0 10px rgba(20, 184, 166, 0.6)",
                  }}
                />
              </div>
              <div className="usage-percent">{quotas.storage_percent}%</div>
            </div>

            {/* Functions Quota */}
            <div className="usage-item">
              <div className="usage-item-top">
                <div
                  className="usage-icon-wrap"
                  style={{
                    backgroundColor: "rgba(139, 92, 246, 0.15)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <Code2 size={18} color="#8b5cf6" />
                </div>
                <div>
                  <div className="usage-title">Functions</div>
                  <div className="usage-val">
                    {quotas.functions_used} / {quotas.functions_max}
                  </div>
                </div>
              </div>
              <div className="usage-bar-track">
                <div
                  className="usage-bar-fill"
                  style={{
                    width: `${quotas.functions_percent}%`,
                    backgroundColor: "#8b5cf6",
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.6)",
                  }}
                />
              </div>
              <div className="usage-percent">{quotas.functions_percent}%</div>
            </div>

            {/* API Requests Quota */}
            <div className="usage-item">
              <div className="usage-item-top">
                <div
                  className="usage-icon-wrap"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <Share2 size={18} color="#3b82f6" />
                </div>
                <div>
                  <div className="usage-title">API Requests (Today)</div>
                  <div className="usage-val">
                    {quotas.api_requests_today} / {quotas.api_requests_max}
                  </div>
                </div>
              </div>
              <div className="usage-bar-track">
                <div
                  className="usage-bar-fill"
                  style={{
                    width: `${quotas.api_requests_percent}%`,
                    backgroundColor: "#3b82f6",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.6)",
                  }}
                />
              </div>
              <div className="usage-percent">{quotas.api_requests_percent}%</div>
            </div>

            {/* Website Hosting Quota */}
            <div className="usage-item">
              <div className="usage-item-top">
                <div
                  className="usage-icon-wrap"
                  style={{
                    backgroundColor: "rgba(236, 72, 153, 0.15)",
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                  }}
                >
                  <Globe size={18} color="#ec4899" />
                </div>
                <div>
                  <div className="usage-title">Website Hosting</div>
                  <div className="usage-val">
                    {quotas.websites_used} / {quotas.websites_max}
                  </div>
                </div>
              </div>
              <div className="usage-bar-track">
                <div
                  className="usage-bar-fill"
                  style={{
                    width: `${quotas.websites_percent}%`,
                    backgroundColor: "#ec4899",
                    boxShadow: "0 0 10px rgba(236, 72, 153, 0.6)",
                  }}
                />
              </div>
              <div className="usage-percent">{quotas.websites_percent}%</div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Recent Activity</h2>
            <Link href="/monitoring" className="panel-action-btn">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="activity-list">
            {activities.map((act: any) => {
              // Icon determination
              let IconComp = FileText;
              let iconColor = "#14b8a6";
              if (act.action_type === "file_upload") {
                IconComp = Upload;
                iconColor = "#14b8a6";
              } else if (act.action_type === "func_exec") {
                IconComp = Code2;
                iconColor = act.status === "success" ? "#8b5cf6" : "#ef4444";
              } else if (act.action_type === "api_call") {
                IconComp = Share2;
                iconColor = "#f97316";
              } else if (act.action_type === "site_deploy") {
                IconComp = Globe;
                iconColor = "#3b82f6";
              }

              const isSuccess = act.status === "success";

              return (
                <div key={act.id} className="activity-item">
                  <div className="activity-left">
                    <div className="activity-icon-wrap">
                      <IconComp size={16} color={iconColor} />
                    </div>
                    <div>
                      <div className="activity-title">{act.title}</div>
                      <div className="activity-time">{act.time_ago}</div>
                    </div>
                  </div>
                  <span
                    className={`status-pill ${
                      isSuccess ? "status-success" : "status-error"
                    }`}
                  >
                    {isSuccess ? "Success" : "Error"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
