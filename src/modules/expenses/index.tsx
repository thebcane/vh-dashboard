"use client";

import { DollarSign } from "lucide-react";
import { Module } from "@/types/module";
import { moduleRegistry } from "@/modules/core/module-registry";

// Widgets
import { ExpenseSummaryWidget } from "./widgets/expense-summary";
import { RecentExpensesWidget } from "./widgets/recent-expenses";

export const ExpensesModule: Module = {
  id: "expenses",
  name: "Expenses",
  description: "Track and manage project expenses",
  enabled: true,
  icon: DollarSign,
  navItems: [
    {
      label: "Expenses",
      href: "/dashboard/expenses",
      icon: DollarSign,
      description: "Track and manage your project expenses",
    },
  ],
  widgets: [
    {
      title: "Expense Summary",
      priority: 20,
      component: ExpenseSummaryWidget,
      width: "half",
    },
    {
      title: "Recent Expenses",
      priority: 21,
      component: RecentExpensesWidget,
      width: "half",
    },
  ],
  initialize: async () => {
    console.log("Expenses module initialized");
  },
};

// Register the module
moduleRegistry.registerModule(ExpensesModule);