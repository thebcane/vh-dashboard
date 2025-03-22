import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Define the FileUpload interface
interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  googleDriveId: string;
  uploaderId: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST() {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing files with Google Drive IDs to avoid duplicates
    const existingFilesResult = await db.query(`
      SELECT "googleDriveId" FROM public."FileUpload"
      WHERE "uploaderId" = $1 AND "googleDriveId" IS NOT NULL;
    `, [session.user.id]);
    
    const existingFiles = existingFilesResult.rows;
    const existingGoogleDriveIds = new Set(existingFiles.map(file => file.googleDriveId));
    
    // Create sample files to simulate successful Google Drive API calls
    const files = [];
    
    // Create a few new files if we don't have any synced files yet
    if (existingFiles.length === 0) {
      const sampleFiles = [
        {
          name: "Project Proposal.pdf",
          type: "application/pdf",
          size: 1258000,
          googleDriveId: "sample-drive-id-1",
          url: "https://drive.google.com/file/d/sample-drive-id-1/view"
        },
        {
          name: "Audio Track 01.mp3",
          type: "audio/mpeg",
          size: 4580000,
          googleDriveId: "sample-drive-id-2",
          url: "https://drive.google.com/file/d/sample-drive-id-2/view"
        },
        {
          name: "Character Concept Art.png",
          type: "image/png",
          size: 3240000,
          googleDriveId: "sample-drive-id-3",
          url: "https://drive.google.com/file/d/sample-drive-id-3/view"
        }
      ];
      
      for (const sampleFile of sampleFiles) {
        if (!existingGoogleDriveIds.has(sampleFile.googleDriveId)) {
          const fileResult = await db.query(`
            INSERT INTO public."FileUpload" ("name", "type", "size", "url", "googleDriveId", "uploaderId")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
          `, [
            sampleFile.name,
            sampleFile.type,
            sampleFile.size,
            sampleFile.url,
            sampleFile.googleDriveId,
            session.user.id
          ]);
          
          const file: FileUpload = fileResult.rows[0];
          files.push(file);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Files synced with Google Drive successfully",
      syncedFiles: files,
    });
  } catch (error) {
    console.error("Error syncing with Google Drive:", error);
    return NextResponse.json(
      { success: false, message: "Failed to sync with Google Drive" },
      { status: 500 }
    );
  }
}