import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { expenseRepository } from "@/lib/repositories";

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

    // Get expense summary by category
    const categorySummary = await expenseRepository.getSummaryByCategory(userId);
    
    // Calculate the total amount
    const total = categorySummary.reduce((sum, item) => sum + item.total, 0);

    // Format the response to match the expected structure
    const formattedSummary = categorySummary.map(item => ({
      category: item.category,
      amount: item.total,
    }));

    return NextResponse.json({
      success: true,
      total,
      categorySummary: formattedSummary,
    });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expense summary" },
      { status: 500 }
    );
  }
}