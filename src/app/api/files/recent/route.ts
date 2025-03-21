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

    // Get recent files for the user with associated projects
    const files = await db.fileUpload.findMany({
      where: {
        OR: [
          {
            uploaderId: session.user.id,
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