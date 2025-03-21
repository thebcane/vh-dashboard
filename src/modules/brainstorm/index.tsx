"use client";

import { Lightbulb } from "lucide-react";
import { Module } from "@/types/module";
import { moduleRegistry } from "@/modules/core/module-registry";

// Widgets
import { RecentNotesWidget } from "./widgets/recent-notes";

export const BrainstormModule: Module = {
  id: "brainstorm",
  name: "Brainstorm",
  description: "Organize and capture ideas and notes",
  enabled: true,
  icon: Lightbulb,
  navItems: [
    {
      label: "Brainstorm",
      href: "/dashboard/brainstorm",
      icon: Lightbulb,
      description: "Capture and organize creative ideas",
    },
  ],
  widgets: [
    {
      title: "Recent Notes",
      priority: 30,
      component: RecentNotesWidget,
      width: "half",
    },
  ],
  initialize: async () => {
    console.log("Brainstorm module initialized");
  },
};

// Register the module
moduleRegistry.registerModule(BrainstormModule);