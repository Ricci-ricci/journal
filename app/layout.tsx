import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccountsProvider } from "@/contexts/AccountsContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Rally",
  description: "A trading journal: log trades, write up your sessions, and see what actually works.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "dark font-sans",
        geist.variable,
        geistMono.variable,
      )}
    >
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <AccountsProvider>{children}</AccountsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
