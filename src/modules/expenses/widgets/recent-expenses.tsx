"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, Project } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

type ExpenseWithProject = Expense & {
  project: Project | null;
};

export function RecentExpensesWidget() {
  const [recentExpenses, setRecentExpenses] = useState<ExpenseWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        const response = await fetch('/api/expenses/recent');
        const data = await response.json();
        
        if (data.success) {
          setRecentExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Error fetching recent expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentExpenses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading recent expenses...</p>
      </div>
    );
  }

  if (recentExpenses.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground mb-2">
          No recent expenses found.
        </div>
        <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Add your first expense</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-sm text-muted-foreground">
              Track expenses by clicking on the Expenses tab in the sidebar.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Your recently added expenses:
      </div>
      
      {recentExpenses.map((expense) => (
        <Card 
          key={expense.id} 
          className="hover:bg-accent/50 cursor-pointer transition-colors"
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex justify-between">
              <span>{expense.title}</span>
              <span className="text-sm font-medium">${expense.amount.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex justify-between text-sm">
              <div>
                {expense.project ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {expense.project.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    No Project
                  </span>
                )}
                <span className="ml-2 text-muted-foreground">{expense.category}</span>
              </div>
              <div className="text-muted-foreground">
                {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}