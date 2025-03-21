import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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

    // Get all expenses for the user
    const expenses = await db.expense.findMany({
      where: {
        userId: userId,
      },
      select: {
        amount: true,
        category: true,
      },
    });

    // Calculate the total amount
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group by category and sum the amounts
    const categoryMap = new Map<string, number>();
    
    for (const expense of expenses) {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
    }
    
    const categorySummary = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    return NextResponse.json({
      success: true,
      total,
      categorySummary,
    });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expense summary" },
      { status: 500 }
    );
  }
}