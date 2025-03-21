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
    const activeProjects = await db.project.count({
      where: {
        OR: [
          {
            ownerId: userId,
            status: "active",
          },
          {
            members: {
              some: {
                userId: userId,
              },
            },
            status: "active",
          },
        ],
      },
    });

    // 2. Pending Tasks Count
    const pendingTasks = await db.task.count({
      where: {
        OR: [
          {
            assigneeId: userId,
            status: { in: ["todo", "inProgress"] },
          },
          {
            project: {
              ownerId: userId,
            },
            status: { in: ["todo", "inProgress"] },
          },
        ],
      },
    });

    // 3. Recent Files Count (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentFiles = await db.fileUpload.count({
      where: {
        OR: [
          {
            uploaderId: userId,
            createdAt: { gte: oneWeekAgo },
          },
          {
            project: {
              OR: [
                { ownerId: userId },
                {
                  members: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              ],
            },
            createdAt: { gte: oneWeekAgo },
          },
        ],
      },
    });

    // 4. Total Expenses
    const expenses = await db.expense.findMany({
      where: {
        OR: [
          { userId: userId },
          {
            project: {
              OR: [
                { ownerId: userId },
                {
                  members: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      select: {
        amount: true,
      },
    });
    
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

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