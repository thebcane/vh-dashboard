/**
 * Test PostgreSQL Connection Script
 * 
 * This script tests the connection to the Vercel PostgreSQL database.
 * It's a simple JavaScript file that doesn't require TypeScript compilation.
 * 
 * Usage:
 * 1. Make sure POSTGRES_PRISMA_URL is set in your .env file
 * 2. Run this script with: node scripts/test-postgres-connection.js
 */

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Validate environment variables
if (!process.env.POSTGRES_PRISMA_URL) {
  console.error('Error: POSTGRES_PRISMA_URL environment variable is not set');
  process.exit(1);
}

async function testConnection() {
  console.log('Testing connection to Vercel PostgreSQL...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL
      }
    }
  });
  
  try {
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Connection successful!');
    console.log('Query result:', result);
    
    // Get database information
    const dbInfo = await prisma.$queryRaw`SELECT current_database() as database, version() as version`;
    console.log('Database information:', dbInfo);
    
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Your Vercel PostgreSQL connection is working properly.');
    } else {
      console.error('❌ Failed to connect to Vercel PostgreSQL.');
      console.log('Please check your connection strings in the .env file.');
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
  });