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

    // Get recent notes for the user with associated projects
    const notes = await db.note.findMany({
      where: {
        authorId: session.user.id,
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
      take: 5, // Limit to 5 most recent notes
    });

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Error fetching recent notes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recent notes" },
      { status: 500 }
    );
  }
}