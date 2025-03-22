import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

// Define types for the FileUpload entity
export type FileUpload = Database['public']['Tables']['FileUpload']['Row'];
export type FileUploadInsert = Database['public']['Tables']['FileUpload']['Insert'];
export type FileUploadUpdate = Database['public']['Tables']['FileUpload']['Update'];

// Define a type for FileUpload with Uploader information
export interface FileUploadWithUploader extends FileUpload {
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

// Define a type for FileUpload with Project information
export interface FileUploadWithProject extends FileUpload {
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
}

// Define a type for FileUpload with both Uploader and Project information
export interface FileUploadWithDetails extends FileUpload {
  uploader: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
}

/**
 * Repository for FileUpload entities
 */
export class FileRepository extends BaseRepository<FileUpload, FileUploadInsert, FileUploadUpdate> {
  constructor() {
    super('FileUpload');
  }

  /**
   * Find files by uploader ID
   */
  async findByUploaderId(uploaderId: string): Promise<FileUpload[]> {
    return this.findByField('uploaderId', uploaderId);
  }

  /**
   * Find files by project ID
   */
  async findByProjectId(projectId: string): Promise<FileUpload[]> {
    return this.findByField('projectId', projectId);
  }

  /**
   * Find files by type
   */
  async findByType(type: string): Promise<FileUpload[]> {
    return this.findByField('type', type);
  }

  /**
   * Find files with uploader information
   */
  async findWithUploader(projectId?: string): Promise<FileUploadWithUploader[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        uploader:User(id, name, email)
      `);
    
    if (projectId) {
      query = query.eq('projectId', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithUploader:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find files with project information
   */
  async findWithProject(uploaderId?: string): Promise<FileUploadWithProject[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        project:Project(id, name, status)
      `);
    
    if (uploaderId) {
      query = query.eq('uploaderId', uploaderId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithProject:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find files with all details (uploader and project)
   */
  async findWithDetails(options?: { 
    projectId?: string; 
    uploaderId?: string;
    type?: string;
  }): Promise<FileUploadWithDetails[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        uploader:User(id, name, email),
        project:Project(id, name, status)
      `);
    
    if (options?.projectId) {
      query = query.eq('projectId', options.projectId);
    }
    
    if (options?.uploaderId) {
      query = query.eq('uploaderId', options.uploaderId);
    }
    
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithDetails:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find recent files for a user
   */
  async findRecentForUser(userId: string, limit: number = 5): Promise<FileUploadWithDetails[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select(`
        *,
        uploader:User(id, name, email),
        project:Project(id, name, status)
      `)
      .eq('uploaderId', userId)
      .order('createdAt', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error in findRecentForUser:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find files by Google Drive ID
   */
  async findByGoogleDriveId(googleDriveId: string): Promise<FileUpload | null> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('googleDriveId', googleDriveId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - file not found
        return null;
      }
      console.error('Error in findByGoogleDriveId:', error);
      throw error;
    }
    
    return data;
  }
}

// Export a singleton instance
export const fileRepository = new FileRepository();