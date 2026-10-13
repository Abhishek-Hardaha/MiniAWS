"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, Check, UserPlus, LogOut, ShieldAlert } from "lucide-react";
import { getStoredUserId, setStoredUserId, getStoredUser, setStoredUser, listUsers, logoutUser } from "@/lib/api";

export default function Topbar() {
  const [currentUser, setCurrentUser] = useState<{ id: string; full_name: string; email: string }>({
    id: "usr_aarav_sharma",
    full_name: "Aarav Sharma",
    email: "aarav@miniaws.com",
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setCurrentUser(stored);
    }
    const activeId = getStoredUserId();
    listUsers()
      .then((users) => {
        if (users && users.length > 0) {
          setUsersList(users);
          if (!stored && activeId) {
            const active = users.find((u) => u.id === activeId);
            if (active) setCurrentUser(active);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitchUser = (user: any) => {
    setStoredUserId(user.id);
    setStoredUser(user);
    setCurrentUser(user);
    setDropdownOpen(false);
    window.location.reload();
  };

  return (
    <header className="topbar">
      {/* Search Input */}
      <div className="search-bar">
        <Search size={16} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search files, functions, APIs, logs..."
          className="search-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              alert(`Searching Mini AWS resources for: "${(e.target as HTMLInputElement).value}"`);
            }
          }}
        />
        <span className="search-kbd">⌘ K</span>
      </div>

      {/* Right Actions */}
      <div className="topbar-actions">
        {/* Admin Stats Button */}
        <Link
          href="/admin-stats"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "6px 14px",
            background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(37, 99, 235, 0.18) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            borderRadius: "8px",
            color: "#38bdf8",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
            cursor: "pointer",
            marginRight: "6px",
          }}
          title="Open Cloud Admin Stats & Platform Overview"
        >
          <ShieldAlert size={14} color="#38bdf8" />
          <span>Admin Stats</span>
        </Link>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="badge-dot" />
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "48px",
                width: "300px",
                backgroundColor: "#0d1424",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                padding: "16px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.7)",
                zIndex: 60,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px", color: "#fff" }}>
                System Notifications
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                  <div style={{ color: "#34d399", fontWeight: 600 }}>Scheduled Job Executed</div>
                  <div>Function <code style={{ color: "#60a5fa" }}>data_processor</code> ran successfully.</div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>14m ago</div>
                </div>
                <div style={{ padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                  <div style={{ color: "#60a5fa", fontWeight: 600 }}>Storage Alert</div>
                  <div>Storage usage is currently at 12% of your 5 GB quota.</div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>1h ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Multi-Tenant Switcher */}
        <div style={{ position: "relative" }}>
          <div
            className="user-pill"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="avatar-circle">
              {(currentUser?.full_name || "Cloud User").charAt(0)}
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
              {currentUser?.full_name || "Cloud User"}
            </span>
            <ChevronDown size={14} color="#94a3b8" />
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "48px",
                width: "260px",
                backgroundColor: "#0d1424",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                padding: "12px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.7)",
                zIndex: 60,
              }}
            >
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", padding: "6px 8px", fontWeight: 700 }}>
                Switch Account (Multi-Tenant)
              </div>
              {usersList.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      color: isSelected ? "#60a5fa" : "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <div>
                      <div>{u.full_name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{u.email}</div>
                    </div>
                    {isSelected && <Check size={16} color="#60a5fa" />}
                  </div>
                );
              })}

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "8px", paddingTop: "8px" }}>
                <a
                  href="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    color: "#94a3b8",
                    fontSize: "12px",
                    textDecoration: "none",
                  }}
                >
                  <UserPlus size={14} />
                  <span>Register New Account</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logoutUser();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    color: "#f87171",
                    fontSize: "12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

