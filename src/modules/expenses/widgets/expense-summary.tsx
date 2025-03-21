"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Expense } from "@prisma/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ExpenseSummaryWidget() {
  const [expenseData, setExpenseData] = useState<{category: string, amount: number}[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const response = await fetch('/api/expenses/summary');
        const data = await response.json();
        
        if (data.success) {
          setExpenseData(data.categorySummary);
          setTotalExpenses(data.total);
        }
      } catch (error) {
        console.error("Error fetching expense data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenseData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading expense data...</p>
      </div>
    );
  }

  if (expenseData.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          No expense data available. Create your first expense to see a summary.
        </div>
      </div>
    );
  }

  // Format data for the pie chart
  const chartData = expenseData.map(item => ({
    name: item.category,
    value: item.amount
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Expense breakdown by category</div>
        <div className="text-sm font-medium">Total: ${totalExpenses.toFixed(2)}</div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}