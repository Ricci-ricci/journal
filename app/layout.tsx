import type { Metadata } from "next";
import "./globals.css";
import { Geist, Orbitron } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccountsProvider } from "@/contexts/AccountsContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-rally",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rally",
  description: "Track and analyze your trading performance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("dark font-sans", geist.variable, orbitron.variable)}
    >
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <AccountsProvider>{children}</AccountsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
