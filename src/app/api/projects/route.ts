import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Define the Project interface with relations
interface ProjectWithRelations {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  tasks: Array<{
    id: string;
    status: string;
  }>;
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

    // Get all projects for the user
    const projectsResult = await db.query(`
      WITH project_tasks AS (
        SELECT "projectId", json_agg(json_build_object('id', id, 'status', status)) as tasks
        FROM public."Task"
        GROUP BY "projectId"
      ),
      project_members AS (
        SELECT pm."projectId",
               json_agg(
                 json_build_object(
                   'id', pm.id,
                   'role', pm.role,
                   'user', json_build_object('id', u.id, 'name', u.name, 'email', u.email)
                 )
               ) as members
        FROM public."ProjectMember" pm
        JOIN public."User" u ON pm."userId" = u.id
        GROUP BY pm."projectId"
      )
      SELECT p.*,
             json_build_object('id', o.id, 'name', o.name, 'email', o.email) as owner,
             COALESCE(pm.members, '[]') as members,
             COALESCE(pt.tasks, '[]') as tasks
      FROM public."Project" p
      LEFT JOIN public."User" o ON p."ownerId" = o.id
      LEFT JOIN project_members pm ON p.id = pm."projectId"
      LEFT JOIN project_tasks pt ON p.id = pt."projectId"
      WHERE p."ownerId" = $1 OR p.id IN (
        SELECT "projectId" FROM public."ProjectMember" WHERE "userId" = $1
      )
      ORDER BY p."updatedAt" DESC;
    `, [session.user.id]);

    const projects: ProjectWithRelations[] = projectsResult.rows;

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch projects" },
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

    // Get project data from request body
    const data = await request.json();
    const description = data.description || "";
    const status = data.status || "active";
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : null;
    
    // Create the project
    const projectResult = await db.query(`
      WITH inserted_project AS (
        INSERT INTO public."Project" ("name", "description", "type", "status", "startDate", "endDate", "ownerId")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      )
      SELECT p.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) as owner
      FROM inserted_project p
      JOIN public."User" u ON p."ownerId" = u.id;
    `, [data.name, description, data.type, status, startDate, endDate, session.user.id]);

    const project = projectResult.rows[0];

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create project" },
      { status: 500 }
    );
  }
}