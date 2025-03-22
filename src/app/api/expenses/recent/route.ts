import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { expenseRepository } from "@/lib/repositories";
import { Expense, ExpenseWithProject } from "@/lib/repositories/expense-repository";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check for authentication using both methods
    const session = await auth();
    const authCookie = request.cookies.get('vh-auth')?.value;
    const isAuthenticated = authCookie === 'admin-authenticated';
    
    // Allow access if either authentication method is valid
    if (!session?.user && !isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Use session.user.id if available, otherwise use a default admin ID
    const userId = session?.user?.id || 'admin-id';

    // Get recent expenses with project information
    const expenses = await expenseRepository.findWithProjectByUserId(userId);
    
    // Sort by date and limit to 5
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      expenses: recentExpenses,
    });
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recent expenses" },
      { status: 500 }
    );
  }
}