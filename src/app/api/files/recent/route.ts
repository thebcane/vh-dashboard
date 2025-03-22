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
    interface FileWithProject {
      id: string;
      name: string;
      url: string;
      key: string;
      projectId: string | null;
      uploaderId: string;
      createdAt: Date;
      updatedAt: Date;
      project: {
        id: string;
        name: string;
        status: string;
      } | null;
      googleDriveId?: string; // Make optional
      syncStatus?: string;    // Make optional
      mimeType?: string;      // Make optional
    }

    const filesResult = await db.query(`
      SELECT f.*, json_build_object('id', p.id, 'name', p.name, 'status', p.status) as project
      FROM public."FileUpload" f
      LEFT JOIN public."Project" p ON f."projectId" = p.id
      WHERE (f."uploaderId" = $1) OR (f."projectId" IN (SELECT id FROM public."Project" WHERE "ownerId" = $1 OR "id" IN (SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1)))
      ORDER BY f."updatedAt" DESC
      LIMIT 5;
    `, [userId]);

    const files: FileWithProject[] = filesResult.rows;

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