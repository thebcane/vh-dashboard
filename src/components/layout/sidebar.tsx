"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { moduleRegistry } from "@/modules/core/module-registry";

interface SidebarNavProps {
  className?: string;
}

export function Sidebar({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = moduleRegistry.getAllNavItems();
  
  return (
    <div className={cn("pb-12 w-full h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Visual Harmonics
          </h2>
          <div className="space-y-1">
            <SidebarNavItem
              icon={Home}
              href="/dashboard"
              label="Dashboard"
              isActive={pathname === "/dashboard"}
            />
            
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                icon={item.icon}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarNavItemProps {
  icon: LucideIcon;
  href: string;
  label: string;
  isActive?: boolean;
}

export function SidebarNavItem({
  icon: Icon,
  href,
  label,
  isActive,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "transparent"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}