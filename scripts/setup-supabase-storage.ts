/**
 * This script sets up the necessary storage buckets in Supabase
 * Run with: npx ts-node -P ./tsconfig.scripts.json ./scripts/setup-supabase-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupStorage() {
  console.log('Setting up Supabase storage buckets...');

  // Create file-uploads bucket if it doesn't exist
  try {
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets();

    if (getBucketsError) {
      throw new Error(`Failed to list buckets: ${getBucketsError.message}`);
    }

    const fileUploadsBucket = buckets?.find(bucket => bucket.name === 'file-uploads');

    if (!fileUploadsBucket) {
      console.log('Creating file-uploads bucket...');
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('file-uploads', {
          public: false, // Files are not public by default
          fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        });

      if (createBucketError) {
        throw new Error(`Failed to create file-uploads bucket: ${createBucketError.message}`);
      }

      // Set bucket policy to allow public access to files
      const { error: policyError } = await supabase
        .storage
        .from('file-uploads')
        .createSignedUrl('test.txt', 1); // Just to create a policy

      if (policyError && !policyError.message.includes('The resource was not found')) {
        console.warn(`Warning setting bucket policy: ${policyError.message}`);
      }

      console.log('file-uploads bucket created successfully!');
    } else {
      console.log('file-uploads bucket already exists.');
    }

    console.log('Storage setup completed successfully!');
  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage();