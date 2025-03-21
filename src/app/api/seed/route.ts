import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Clean up existing data in the correct order to avoid foreign key constraints
    await db.comment.deleteMany({});
    await db.message.deleteMany({});
    await db.note.deleteMany({});
    await db.fileUpload.deleteMany({});
    await db.expense.deleteMany({});
    await db.task.deleteMany({});
    await db.projectMember.deleteMany({});
    await db.project.deleteMany({});
    await db.user.deleteMany({});
    await db.module.deleteMany({});
    
    // Create admin user
    const adminUser = await db.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@visualharmonics.com',
        passwordHash: 'password123', // In a real app, use hashed passwords
        role: 'admin',
      },
    });
    
    // Create regular user
    const regularUser = await db.user.create({
      data: {
        name: 'John Doe',
        email: 'john@visualharmonics.com',
        passwordHash: 'password123', // In a real app, use hashed passwords
        role: 'user',
      },
    });
    
    // Create sample project
    const project = await db.project.create({
      data: {
        name: 'Fantasy RPG Soundtrack',
        description: 'Original soundtrack for upcoming RPG game with 10 tracks',
        type: 'soundtrack',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        ownerId: adminUser.id,
      },
    });
    
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