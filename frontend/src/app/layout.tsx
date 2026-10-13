import "@/styles/globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "StackSync Cloud Platform",
  description: "StackSync Multi-Tier Cloud Console on AWS EC2",
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
