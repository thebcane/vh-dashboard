import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Define the File interface with project information
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
    const filesResult = await db.query(`
      SELECT f.*, json_build_object('id', p.id, 'name', p.name, 'status', p.status) as project
      FROM public."FileUpload" f
      LEFT JOIN public."Project" p ON f."projectId" = p.id
      WHERE (f."uploaderId" = $1) OR (f."projectId" IN (SELECT id FROM public."Project" WHERE "ownerId" = $1 OR "id" IN (SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1)))
      ORDER BY f."updatedAt" DESC;
    `, [session.user.id]);

    const files: FileWithProject[] = filesResult.rows;

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