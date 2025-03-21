import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const noteId = params.id;

    // Get the note with the associated project
    const note = await db.note.findUnique({
      where: {
        id: noteId,
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

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    // Check if the note belongs to the current user or is public
    if (note.authorId !== session.user.id && !note.isPublic) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const noteId = params.id;
    const data = await request.json();

    // Check if the note exists and belongs to the user
    const existingNote = await db.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    if (existingNote.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the note
    const updatedNote = await db.note.update({
      where: {
        id: noteId,
      },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        content: data.content !== undefined ? data.content : undefined,
        isPublic: data.isPublic !== undefined ? data.isPublic : undefined,
        projectId: data.projectId !== undefined ? data.projectId : undefined,
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
      note: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const noteId = params.id;

    // Check if the note exists and belongs to the user
    const existingNote = await db.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    if (existingNote.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the note
    await db.note.delete({
      where: {
        id: noteId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete note" },
      { status: 500 }
    );
  }
}