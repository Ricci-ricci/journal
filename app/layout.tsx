import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Track and analyze your trading performance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
