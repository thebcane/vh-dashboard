import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Define the Note interface with project information
interface NoteWithProject {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
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
    const notesResult = await db.query(`
      SELECT n.*, json_build_object('id', p.id, 'name', p.name, 'status', p.status) as project
      FROM public."Note" n
      LEFT JOIN public."Project" p ON n."projectId" = p.id
      WHERE n."authorId" = $1
      ORDER BY n."updatedAt" DESC;
    `, [session.user.id]);

    const notes: NoteWithProject[] = notesResult.rows;

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
    const isPublic = data.isPublic || false;
    const projectId = data.projectId || null;
    
    // Create the note
    const noteResult = await db.query(`
      WITH inserted_note AS (
        INSERT INTO public."Note" ("title", "content", "isPublic", "authorId", "projectId")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      )
      SELECT n.*, json_build_object('id', p.id, 'name', p.name, 'status', p.status) as project
      FROM inserted_note n
      LEFT JOIN public."Project" p ON n."projectId" = p.id;
    `, [data.title, data.content, isPublic, session.user.id, projectId]);

    const note: NoteWithProject = noteResult.rows[0];

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