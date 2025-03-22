import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Define interfaces for the returned data
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
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
}

export async function GET() {
  try {
    // Clean up existing data in the correct order to avoid foreign key constraints
    try {
      await db.query('DELETE FROM public."Comment";');
    } catch (error) {
      console.log('Comment table not found, skipping cleanup');
    }
    
    try {
      await db.query('DELETE FROM public."Message";');
    } catch (error) {
      console.log('Message table not found, skipping cleanup');
    }
    
    // Delete data in the correct order to avoid foreign key constraints
    await db.query('DELETE FROM public."Note";');
    await db.query('DELETE FROM public."FileUpload";');
    await db.query('DELETE FROM public."Expense";');
    await db.query('DELETE FROM public."Task";');
    await db.query('DELETE FROM public."ProjectMember";');
    await db.query('DELETE FROM public."Project";');
    await db.query('DELETE FROM public."User";');
    await db.query('DELETE FROM public."Module";');
    
    // Create admin user
    const adminUserResult = await db.query(`
      INSERT INTO public."User" ("name", "email", "passwordHash", "role")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, ['Admin User', 'admin@visualharmonics.com', 'password123', 'admin']);
    
    const adminUser: User = adminUserResult.rows[0];
    
    // Create regular user
    const regularUserResult = await db.query(`
      INSERT INTO public."User" ("name", "email", "passwordHash", "role")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, ['John Doe', 'john@visualharmonics.com', 'password123', 'user']);
    
    const regularUser: User = regularUserResult.rows[0];
    
    // Create sample project
    const startDate = new Date();
    const endDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
    
    const projectResult = await db.query(`
      INSERT INTO public."Project" ("name", "description", "type", "status", "startDate", "endDate", "ownerId")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [
      'Fantasy RPG Soundtrack',
      'Original soundtrack for upcoming RPG game with 10 tracks',
      'soundtrack',
      'active',
      startDate,
      endDate,
      adminUser.id
    ]);
    
    const project: Project = projectResult.rows[0];
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      users: [adminUser, regularUser],
      project
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}