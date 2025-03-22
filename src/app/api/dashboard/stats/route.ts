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

    // Get dashboard statistics

    // 1. Active Projects Count
    const activeProjectsResult = await db.query(`
      SELECT COUNT(*) FROM public."Project"
      WHERE ("ownerId" = $1 AND "status" = 'active')
      OR ("id" IN (SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1)
      AND "status" = 'active');
    `, [userId]);
    const activeProjects = parseInt(activeProjectsResult.rows[0].count, 10);

    // 2. Pending Tasks Count
    const pendingTasksResult = await db.query(`
      SELECT COUNT(*) FROM public."Task"
      WHERE ("assigneeId" = $1 AND "status" IN ('todo', 'inProgress'))
      OR ("projectId" IN (SELECT id FROM public."Project" WHERE "ownerId" = $1)
      AND "status" IN ('todo', 'inProgress'));
    `, [userId]);
    const pendingTasks = parseInt(pendingTasksResult.rows[0].count, 10);

    // 3. Recent Files Count (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentFilesResult = await db.query(`
      SELECT COUNT(*) FROM public."FileUpload"
      WHERE ("uploaderId" = $1 AND "createdAt" >= $2)
      OR ("projectId" IN (SELECT id FROM public."Project"
                          WHERE "ownerId" = $1 OR "id" IN (SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1))
      AND "createdAt" >= $2);
    `, [userId, oneWeekAgo]);
    const recentFiles = parseInt(recentFilesResult.rows[0].count, 10);

    // 4. Total Expenses
    interface Expense {
      amount: number;
    }
    const expensesResult = await db.query(`
      SELECT amount FROM public."Expense"
      WHERE ("userId" = $1)
      OR ("projectId" IN (SELECT id FROM public."Project"
                          WHERE "ownerId" = $1 OR "id" IN (SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1)));
    `, [userId]);
    const expenses: Expense[] = expensesResult.rows;

    const totalExpenses = expenses.reduce((total: number, expense: Expense) => total + expense.amount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        activeProjects,
        pendingTasks,
        recentFiles,
        totalExpenses,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}