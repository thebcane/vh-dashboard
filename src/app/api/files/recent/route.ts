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

    // Get recent files for the user with associated projects
    const files = await db.fileUpload.findMany({
      where: {
        OR: [
          {
            uploaderId: userId,
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
          },
        ],
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
        updatedAt: 'desc',
      },
      take: 5, // Limit to 5 most recent files
    });

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Error fetching recent files:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recent files" },
      { status: 500 }
    );
  }
}