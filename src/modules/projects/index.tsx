"use client";

import { FolderKanban } from "lucide-react";
import { Module } from "@/types/module";
import { moduleRegistry } from "@/modules/core/module-registry";

// Widgets
import { RecentProjectsWidget } from "./widgets/recent-projects";

export const ProjectsModule: Module = {
  id: "projects",
  name: "Projects",
  description: "Manage audio production projects",
  enabled: true,
  icon: FolderKanban,
  navItems: [
    {
      label: "Projects",
      href: "/dashboard/projects",
      icon: FolderKanban,
      description: "Manage your audio production projects",
    },
  ],
  widgets: [
    {
      title: "Recent Projects",
      priority: 10,
      component: RecentProjectsWidget,
      width: "half",
    },
  ],
  initialize: async () => {
    console.log("Projects module initialized");
  },
};

// Register the module
moduleRegistry.registerModule(ProjectsModule);