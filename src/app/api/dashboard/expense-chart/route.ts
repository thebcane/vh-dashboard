import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get expense data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Start from 6 months ago (current month included)
    sixMonthsAgo.setDate(1); // Start from the first day of that month
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const expenses = await db.expense.findMany({
      where: {
        OR: [
          {
            userId: session.user.id, 
            date: { gte: sixMonthsAgo }
          },
          {
            project: {
              OR: [
                { ownerId: session.user.id },
                {
                  members: {
                    some: {
                      userId: session.user.id,
                    },
                  },
                },
              ],
            },
            date: { gte: sixMonthsAgo },
          },
        ],
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
    
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