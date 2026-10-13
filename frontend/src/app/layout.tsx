import "@/styles/globals.css";
import AppShell from "@/components/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
