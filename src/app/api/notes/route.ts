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

    // Get all notes for the user with associated projects
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
    });

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notes" },
      { status: 500 }
    );
  }
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

    // Get note data from request body
    const data = await request.json();
    
    // Create the note
    const note = await db.note.create({
      data: {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic || false,
        authorId: session.user.id,
        projectId: data.projectId || null,
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
      note,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create note" },
      { status: 500 }
    );
  }
}