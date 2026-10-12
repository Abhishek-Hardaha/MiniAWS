import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "Mini AWS Cloud Platform",
  description: "Lightweight Multi-Tier Cloud Console on AWS EC2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-viewport">
            <Topbar />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
