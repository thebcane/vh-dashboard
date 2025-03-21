/**
 * Data Migration Script: SQLite to PostgreSQL
 *
 * This script helps migrate data from a SQLite database to PostgreSQL.
 * It uses Prisma's direct database access to read from SQLite and write to PostgreSQL.
 *
 * Usage:
 * 1. Make sure both SQLite and PostgreSQL connection strings are in your .env file
 * 2. Run this script with: npm run db:migrate-to-postgres
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Validate environment variables
if (!process.env.POSTGRES_PRISMA_URL) {
  console.error('Error: POSTGRES_PRISMA_URL environment variable is not set');
  process.exit(1);
}

// SQLite database path from the old DATABASE_URL
const sqliteDbPath = process.env.DATABASE_URL?.replace('file://', '') || 
  path.join(process.cwd(), 'prisma', 'dev.db');

// Check if SQLite database exists
if (!fs.existsSync(sqliteDbPath)) {
  console.error(`Error: SQLite database not found at ${sqliteDbPath}`);
  process.exit(1);
}

// Create Prisma clients for both databases with unique names to avoid conflicts
const PrismaClientSQLite = PrismaClient;
const PrismaClientPostgres = PrismaClient;

const sqliteClient = new PrismaClientSQLite({
  datasources: {
    db: {
      url: `file:${sqliteDbPath}`
    }
  }
});

const postgresClient = new PrismaClientPostgres({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || ''
    }
  }
});

// Models to migrate in order (respecting foreign key constraints)
const models = [
  'User',
  'Module',
  'Project',
  'ProjectMember',
  'Task',
  'Expense',
  'FileUpload',
  'Note',
  'Message',
  'Comment'
];

async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...');
  
  try {
    // Migrate each model
    for (const model of models) {
      console.log(`Migrating ${model}...`);
      
      // Get data from SQLite
      const data = await (sqliteClient as any)[model].findMany();
      console.log(`Found ${data.length} ${model} records in SQLite`);
      
      if (data.length === 0) {
        console.log(`No ${model} records to migrate, skipping...`);
        continue;
      }
      
      // Insert data into PostgreSQL
      // Using createMany for efficiency, but fall back to individual creates if needed
      try {
        await (postgresClient as any)[model].createMany({
          data,
          skipDuplicates: true
        });
        console.log(`Successfully migrated ${data.length} ${model} records`);
      } catch (error) {
        console.warn(`Error using createMany for ${model}, falling back to individual creates`);
        
        // Fall back to individual creates
        let successCount = 0;
        for (const record of data) {
          try {
            await (postgresClient as any)[model].create({
              data: record
            });
            successCount++;
          } catch (createError) {
            console.error(`Error creating ${model} record:`, createError);
          }
        }
        console.log(`Successfully migrated ${successCount}/${data.length} ${model} records`);
      }
    }
    
    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Disconnect from both databases
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run the migration
migrateData();