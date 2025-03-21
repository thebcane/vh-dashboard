import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import crypto from "crypto";

// Directory for file uploads
const uploadsDir = join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    
    // Extract data from the form
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string | null;
    const useGoogleDrive = formData.get('useGoogleDrive') === 'true';
    const customFileName = formData.get('customFileName') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }
    
    // Get file details
    const fileName = customFileName || file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    // Generate a unique filename to prevent collisions
    const fileExtension = path.extname(fileName);
    const baseFileName = path.basename(fileName, fileExtension);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const uniqueFileName = `${baseFileName}-${uniqueId}${fileExtension}`;
    
    // Define file paths
    const relativePath = join("uploads", uniqueFileName);
    const absolutePath = join(process.cwd(), relativePath);
    
    // Convert the file to an ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write the file to disk
    await writeFile(absolutePath, buffer);
    
    // Create the file URL based on host
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fileUrl = `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
    
    // If Google Drive integration is requested and available
    let googleDriveId = null;
    let finalFileUrl = fileUrl;
    
    if (useGoogleDrive) {
      // In a real integration, you would:
      // 1. Get the user's Google Drive tokens
      // 2. Initialize the Google Drive API client
      // 3. Upload the file to Google Drive
      // 4. Get the file ID and create a shareable link
      // 5. Optionally delete the local file after successful upload
      
      // For now, we'll simulate a Google Drive upload with a fake ID
      googleDriveId = `gdrive-${uniqueId}`;
      finalFileUrl = `https://drive.google.com/file/d/${googleDriveId}/view`;
    }
    
    // Save file metadata to database
    const fileUpload = await db.fileUpload.create({
      data: {
        name: fileName,
        type: fileType,
        size: fileSize,
        url: finalFileUrl,
        googleDriveId: googleDriveId,
        uploaderId: session.user.id,
        projectId: projectId,
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
    });
    
    return NextResponse.json({
      success: true,
      file: fileUpload,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Configure bodyParser to handle large files
export const config = {
  api: {
    bodyParser: false,
  },
};