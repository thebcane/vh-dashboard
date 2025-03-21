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

    // Get dashboard statistics
    
    // 1. Active Projects Count
    const activeProjects = await db.project.count({
      where: {
        OR: [
          {
            ownerId: session.user.id,
            status: "active",
          },
          {
            members: {
              some: {
                userId: session.user.id,
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
            assigneeId: session.user.id,
            status: { in: ["todo", "inProgress"] },
          },
          {
            project: {
              ownerId: session.user.id,
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
            uploaderId: session.user.id,
            createdAt: { gte: oneWeekAgo },
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
            createdAt: { gte: oneWeekAgo },
          },
        ],
      },
    });

    // 4. Total Expenses
    const expenses = await db.expense.findMany({
      where: {
        OR: [
          { userId: session.user.id },
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