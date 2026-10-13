"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getStoredToken, getStoredUserId } from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    setMounted(true);
    // Check authentication on non-auth pages
    if (!isAuthPage) {
      const token = getStoredToken();
      const userId = getStoredUserId();
      // If neither token nor user ID exists, redirect to login
      if (!token && !userId) {
        router.push("/login");
      }
    }
  }, [pathname, isAuthPage, router]);

  if (!mounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#060b13" }}>{children}</div>;
  }

  if (isAuthPage) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#060b13" }}>{children}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-viewport">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
