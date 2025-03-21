import { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface DashboardWidget {
  title: string;
  priority: number; // Lower numbers appear first
  component: React.ComponentType;
  width?: "full" | "half" | "third"; // Size on dashboard
}

export interface Module {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: LucideIcon;
  navItems: NavItem[];
  widgets?: DashboardWidget[];
  components?: {
    DashboardWidget?: React.ComponentType;
    SettingsPage?: React.ComponentType;
  };
  initialize?: () => Promise<void>;
}