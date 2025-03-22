import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Prevent static generation for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Skip DB connection check during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        status: "build",
        message: "DB status check skipped during build phase",
        timestamp: new Date().toISOString(),
      });
    }

    // Normal runtime DB check
    const result = await db.query('SELECT 1 as connected');
    
    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to the database",
      details: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to the database",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}