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

    // Get all files for the user with associated projects
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
    });

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch files" },
      { status: 500 }
    );
  }
}