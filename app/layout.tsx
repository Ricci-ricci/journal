import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AccountsProvider } from "@/contexts/AccountsContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" className={cn("dark font-sans", geist.variable)}>
      <body className="antialiased bg-background text-foreground">
        <AccountsProvider>{children}</AccountsProvider>
      </body>
    </html>
  );
}
