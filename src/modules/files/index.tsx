"use client";

import { FileIcon } from "lucide-react";
import { Module } from "@/types/module";
import { moduleRegistry } from "@/modules/core/module-registry";

// Widgets
import { RecentFilesWidget } from "./widgets/recent-files";

export const FilesModule: Module = {
  id: "files",
  name: "Files",
  description: "Access and manage files from Google Drive",
  enabled: true,
  icon: FileIcon,
  navItems: [
    {
      label: "Files",
      href: "/dashboard/files",
      icon: FileIcon,
      description: "Access and manage your project files",
    },
  ],
  widgets: [
    {
      title: "Recent Files",
      priority: 40,
      component: RecentFilesWidget,
      width: "half",
    },
  ],
  initialize: async () => {
    console.log("Files module initialized");
  },
};

// Register the module
moduleRegistry.registerModule(FilesModule);