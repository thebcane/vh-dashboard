"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { Module } from "@/types/module";
import { moduleRegistry } from "@/modules/core/module-registry";

// Widgets
import { DeadlinesCalendarWidget } from "./widgets/deadlines-calendar";

export const CalendarModule: Module = {
  id: "calendar",
  name: "Calendar",
  description: "View and manage your deadlines and schedules",
  enabled: true,
  icon: CalendarIcon,
  navItems: [
    {
      label: "Calendar",
      href: "/dashboard/calendar",
      icon: CalendarIcon,
      description: "View and manage your upcoming deadlines",
    },
  ],
  widgets: [
    {
      title: "Upcoming Deadlines",
      priority: 15, // Higher priority than other widgets
      component: DeadlinesCalendarWidget,
      width: "full",
    },
  ],
  initialize: async () => {
    console.log("Calendar module initialized");
  },
};

// Register the module
moduleRegistry.registerModule(CalendarModule);