"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Server,
  Database,
  Globe,
  Code2,
  Share2,
  BarChart3,
  Settings,
  HelpCircle,
  Cloud
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "EC2 Instances", href: "/instances", icon: Server },
  { name: "Storage", href: "/storage", icon: Database },
  { name: "Web Hosting", href: "/web-hosting", icon: Globe },
  { name: "Serverless Functions", href: "/functions", icon: Code2 },
  { name: "API Gateway", href: "/api-gateway", icon: Share2 },
  { name: "Monitoring", href: "/monitoring", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <Link href="/" className="sidebar-logo">
        <div className="logo-icon-wrap">
          <Cloud size={24} color="#60a5fa" strokeWidth={2.4} />
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav Items */}
      <div className="sidebar-bottom">
        <Link
          href="/settings"
          className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>
        <Link
          href="/help"
          className={`nav-item ${pathname === "/help" ? "active" : ""}`}
        >
          <HelpCircle size={18} strokeWidth={1.8} />
          <span>Help</span>
        </Link>
      </div>
    </aside>
  );
}
