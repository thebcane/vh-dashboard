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

    // Get expense data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Start from 6 months ago (current month included)
    sixMonthsAgo.setDate(1); // Start from the first day of that month
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    interface ExpenseData {
      amount: number;
      date: Date;
    }

    const expensesResult = await db.query(`
      SELECT amount, date FROM public."Expense"
      WHERE (("userId" = $1 AND date >= $2) OR
            ("projectId" IN (SELECT id FROM public."Project"
                            WHERE "ownerId" = $1 OR "id" IN
                            (SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1))
             AND date >= $2))
      ORDER BY date ASC;
    `, [userId, sixMonthsAgo]);
    
    const expenses: ExpenseData[] = expensesResult.rows;
    
    // Group expenses by month
    const months: string[] = [];
    const monthlyData: Record<string, number> = {};
    
    // Initialize monthly data with 0 for all months
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(now.getMonth() - i);
      
      const monthKey = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.unshift(monthKey); // Add to beginning to keep chronological order
      monthlyData[monthKey] = 0;
    }
    
    // Sum up expenses by month
    for (const expense of expenses) {
      const date = new Date(expense.date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += expense.amount;
      }
    }
    
    // Convert to array format for chart
    const chartData = months.map(month => ({
      month,
      amount: parseFloat(monthlyData[month].toFixed(2)),
    }));

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error fetching expense chart data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expense chart data" },
      { status: 500 }
    );
  }
}