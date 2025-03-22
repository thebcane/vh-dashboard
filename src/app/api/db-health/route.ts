import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database/connection-pool";
import { supabaseAdmin } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

/**
 * API route for checking database health
 * This can be used by monitoring tools to check if the database is available
 */
export async function GET() {
  try {
    // Check PostgreSQL connection health
    const pgHealth = await checkDatabaseHealth();
    
    // Check Supabase connection health
    let supabaseHealth = false;
    try {
      const { data, error } = await supabaseAdmin().from('User').select('count').limit(1);
      supabaseHealth = !error;
    } catch (error) {
      console.error("Supabase health check failed:", error);
    }
    
    // Overall health status
    const isHealthy = pgHealth && supabaseHealth;
    
    // Return health status with appropriate status code
    return NextResponse.json(
      {
        healthy: isHealthy,
        postgres: pgHealth,
        supabase: supabaseHealth,
        timestamp: new Date().toISOString(),
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return NextResponse.json(
      {
        healthy: false,
        error: "Database health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}