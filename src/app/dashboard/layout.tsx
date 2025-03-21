"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandMenu } from "@/components/command-menu";
import { useAuth } from "@/context/auth-provider";
import { ModuleLoader } from "@/modules/core/module-loader";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enable authentication check
  const { status } = useAuth();
  if (status === "unauthenticated") {
    redirect("/login");
  }
return (
  <div className="flex min-h-screen flex-col">
    <ModuleLoader />
    <CommandMenu />
    <Header />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <Sidebar />
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}