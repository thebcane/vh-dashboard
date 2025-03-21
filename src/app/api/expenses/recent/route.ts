import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

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

    // Get recent expenses for the user with associated projects
    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 5, // Limit to 5 most recent expenses
    });

    return NextResponse.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recent expenses" },
      { status: 500 }
    );
  }
}