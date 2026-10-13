"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { isAuthenticated } from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (isAuthPage) {
      setAuthStatus("authenticated");
      return;
    }

    const authed = isAuthenticated();
    if (!authed) {
      setAuthStatus("unauthenticated");
      router.replace("/login");
    } else {
      setAuthStatus("authenticated");
    }
  }, [pathname, isAuthPage, router]);

  // If viewing Login or Register, render full page without app shell
  if (isAuthPage) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#060b13" }}>{children}</div>;
  }

  // If still checking authentication or unauthenticated, show sleek verification loader while redirecting
  if (authStatus !== "authenticated") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#060b13",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div
            className="spin"
            style={{
              width: "38px",
              height: "38px",
              border: "3px solid rgba(59, 130, 246, 0.2)",
              borderTopColor: "#38bdf8",
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
            Verifying Cloud Session Authentication...
          </span>
        </div>
      </div>
    );
  }

  // Authenticated user: render the full application shell
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
