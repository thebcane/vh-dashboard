import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { AuthProvider } from "@/context/auth-provider";

const inter = Inter({ subsets: ["latin"] });

const isVercelBuild = process.env.NEXT_PHASE === 'phase-production-build' ||
                      process.env.NEXT_SKIP_INITIALIZING_DB === 'true';

export const metadata: Metadata = {
  title: "Visual Harmonics Dashboard",
  description: "Dashboard for Visual Harmonics audio production company",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider initialSession={session}>
          <ThemeProvider defaultTheme="dark">
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
