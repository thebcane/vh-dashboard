"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Expense, Project } from "@prisma/client";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";

type ExpenseWithProject = Expense & {
  project: Project | null;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch("/api/expenses");
        const data = await response.json();
        
        if (data.success) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenses();
  }, []);

  // Function to handle expense creation
  const handleExpenseCreated = (newExpense: ExpenseWithProject) => {
    setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
    setIsCreateDialogOpen(false);
  };

  // Function to handle expense deletion
  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          setExpenses((prevExpenses) => 
            prevExpenses.filter((expense) => expense.id !== expenseId)
          );
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  // Filter expenses based on search query and category
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = 
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
    const matchesCategory = filterCategory ? expense.category === filterCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Generate unique categories for filter
  const categories = [...new Set(expenses.map((expense) => expense.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your project expenses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Expense</DialogTitle>
              <DialogDescription>
                Add a new expense to track your project costs.
              </DialogDescription>
            </DialogHeader>
            <CreateExpenseForm onSuccess={handleExpenseCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search expenses..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {filterCategory && (
                <span className="ml-2 text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                  {filterCategory}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setFilterCategory(null)}
              className={!filterCategory ? "bg-accent/50" : ""}
            >
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setFilterCategory(category)}
                className={filterCategory === category ? "bg-accent/50" : ""}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Expenses</CardTitle>
            <CardDescription>Please wait while we load your expense data...</CardDescription>
          </CardHeader>
        </Card>
      ) : filteredExpenses.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      {expense.project ? expense.project.name : 'No Project'}
                    </TableCell>
                    <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        expense.paid 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {expense.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {/* Edit functionality will be implemented */}}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              /* Toggle paid status functionality */
                            }}
                          >
                            Mark as {expense.paid ? 'Unpaid' : 'Paid'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Expenses Found</CardTitle>
            <CardDescription>
              {searchQuery || filterCategory
                ? "No expenses match your search criteria."
                : "You haven't added any expenses yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}