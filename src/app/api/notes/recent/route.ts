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

    // Get recent notes for the user with associated projects
    interface NoteWithProject {
      id: string;
      title: string;
      content: string;
      projectId: string | null;
      authorId: string;
      createdAt: Date;
      updatedAt: Date;
      project: {
        id: string;
        name: string;
        status: string;
      } | null;
    }

    const notesResult = await db.query(`
      SELECT n.*, json_build_object('id', p.id, 'name', p.name, 'status', p.status) as project
      FROM public."Note" n
      LEFT JOIN public."Project" p ON n."projectId" = p.id
      WHERE n."authorId" = $1
      ORDER BY n."updatedAt" DESC
      LIMIT 5;
    `, [userId]);

    const notes: NoteWithProject[] = notesResult.rows;

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