import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

// Define types for the Note entity
export type Note = Database['public']['Tables']['Note']['Row'];
export type NoteInsert = Database['public']['Tables']['Note']['Insert'];
export type NoteUpdate = Database['public']['Tables']['Note']['Update'];

// Define a type for Note with Author information
export interface NoteWithAuthor extends Note {
  author: {
    id: string;
    name: string;
    email: string;
  };
}

// Define a type for Note with Project information
export interface NoteWithProject extends Note {
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
}

// Define a type for Note with both Author and Project information
export interface NoteWithDetails extends Note {
  author: {
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
 * Repository for Note entities
 */
export class NoteRepository extends BaseRepository<Note, NoteInsert, NoteUpdate> {
  constructor() {
    super('Note');
  }

  /**
   * Find notes by author ID
   */
  async findByAuthorId(authorId: string): Promise<Note[]> {
    return this.findByField('authorId', authorId);
  }

  /**
   * Find notes by project ID
   */
  async findByProjectId(projectId: string): Promise<Note[]> {
    return this.findByField('projectId', projectId);
  }

  /**
   * Find public notes
   */
  async findPublic(): Promise<Note[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('isPublic', true);
    
    if (error) {
      console.error('Error in findPublic:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find notes with author information
   */
  async findWithAuthor(projectId?: string): Promise<NoteWithAuthor[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        author:User(id, name, email)
      `);
    
    if (projectId) {
      query = query.eq('projectId', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithAuthor:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find notes with project information
   */
  async findWithProject(authorId?: string): Promise<NoteWithProject[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        project:Project(id, name, status)
      `);
    
    if (authorId) {
      query = query.eq('authorId', authorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithProject:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find notes with all details (author and project)
   */
  async findWithDetails(options?: { 
    projectId?: string; 
    authorId?: string;
    isPublic?: boolean;
  }): Promise<NoteWithDetails[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        author:User(id, name, email),
        project:Project(id, name, status)
      `);
    
    if (options?.projectId) {
      query = query.eq('projectId', options.projectId);
    }
    
    if (options?.authorId) {
      query = query.eq('authorId', options.authorId);
    }
    
    if (options?.isPublic !== undefined) {
      query = query.eq('isPublic', options.isPublic);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithDetails:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find recent notes for a user
   */
  async findRecentForUser(userId: string, limit: number = 5): Promise<NoteWithDetails[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select(`
        *,
        author:User(id, name, email),
        project:Project(id, name, status)
      `)
      .eq('authorId', userId)
      .order('updatedAt', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error in findRecentForUser:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Search notes by content
   */
  async searchByContent(query: string, userId?: string): Promise<NoteWithDetails[]> {
    let dbQuery = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        author:User(id, name, email),
        project:Project(id, name, status)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    
    if (userId) {
      dbQuery = dbQuery.eq('authorId', userId);
    } else {
      // If no user ID is provided, only return public notes
      dbQuery = dbQuery.eq('isPublic', true);
    }
    
    const { data, error } = await dbQuery;
    
    if (error) {
      console.error('Error in searchByContent:', error);
      throw error;
    }
    
    return data || [];
  }
}

// Export a singleton instance
export const noteRepository = new NoteRepository();