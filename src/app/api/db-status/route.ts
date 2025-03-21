import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Try to query the database to check connection
    const result = await db.$queryRaw`SELECT 1 as connected`;
    
    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to the database",
      details: result,
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