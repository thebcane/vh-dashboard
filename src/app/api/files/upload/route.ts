import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import path from "path";

// Bucket name for file uploads
const STORAGE_BUCKET = "file-uploads";

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
    
    // Initialize Supabase client
    const supabase = supabaseAdmin();
    
    // Set storage path with user ID as a folder to organize uploads by user
    const storagePath = `${session.user.id}/${uniqueFileName}`;
    
    // Upload the file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: fileType,
        cacheControl: '3600'
      });
      
    if (storageError) {
      console.error("Supabase storage error:", storageError);
      return NextResponse.json(
        { success: false, message: `Failed to upload file: ${storageError.message}` },
        { status: 500 }
      );
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
      
    const fileUrl = publicUrlData.publicUrl;
    
    // If Google Drive integration is requested and available
    let googleDriveId = null;
    let finalFileUrl = fileUrl;
    
    if (useGoogleDrive) {
      // In a real integration, you would:
      // 1. Get the user's Google Drive tokens
      // 2. Initialize the Google Drive API client
      // 3. Upload the file to Google Drive
      // 4. Get the file ID and create a shareable link
      
      // For now, we'll simulate a Google Drive upload with a fake ID
      googleDriveId = `gdrive-${uniqueId}`;
      finalFileUrl = `https://drive.google.com/file/d/${googleDriveId}/view`;
    }
    
    // Save file metadata to database with Supabase storage info
    const fileUpload = await db.fileUpload.create({
      data: {
        name: fileName,
        type: fileType,
        size: fileSize,
        url: finalFileUrl,
        googleDriveId: googleDriveId,
        uploaderId: session.user.id,
        projectId: projectId || undefined,
        
        // Add Supabase storage metadata - TypeScript safe way
        ...(useGoogleDrive ? {} : {
          storagePath: storagePath,
          storageBucket: STORAGE_BUCKET
        }),
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

// Configure route options for file uploads
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// This is needed to handle large file uploads
export const maxDuration = 60; // 60 seconds timeout