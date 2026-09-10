import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stacdial | Premium Timepieces",
  description: "Explore Stacdial’s watch collection. Independent replica watch retailer in Sri Lanka.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
