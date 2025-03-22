import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

// Define types for the Project entity
export type Project = Database['public']['Tables']['Project']['Row'];
export type ProjectInsert = Database['public']['Tables']['Project']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['Project']['Update'];

// Define a type for Project with Owner information
export interface ProjectWithOwner extends Project {
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

// Define a type for Project with Members information
export interface ProjectWithMembers extends Project {
  members: {
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

/**
 * Repository for Project entities
 */
export class ProjectRepository extends BaseRepository<Project, ProjectInsert, ProjectUpdate> {
  constructor() {
    super('Project');
  }

  /**
   * Find projects owned by a user
   */
  async findByOwnerId(ownerId: string): Promise<Project[]> {
    return this.findByField('ownerId', ownerId);
  }

  /**
   * Find projects by status
   */
  async findByStatus(status: string): Promise<Project[]> {
    return this.findByField('status', status);
  }

  /**
   * Find projects with owner information
   */
  async findWithOwner(): Promise<ProjectWithOwner[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select(`
        *,
        owner:User!Project_ownerId_fkey(id, name, email)
      `);
    
    if (error) {
      console.error('Error in findWithOwner:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find projects with members information
   */
  async findWithMembers(projectId: string): Promise<ProjectWithMembers | null> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select(`
        *,
        members:ProjectMember(
          id,
          userId,
          role,
          user:User(id, name, email)
        )
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Error in findWithMembers:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Find projects that a user is a member of
   */
  async findByMemberId(userId: string): Promise<Project[]> {
    const { data, error } = await this.getClient()
      .from('ProjectMember')
      .select(`
        project:Project(*)
      `)
      .eq('userId', userId);
    
    if (error) {
      console.error('Error in findByMemberId:', error);
      throw error;
    }
    
    // Extract projects from the result
    return data.map(item => item.project) || [];
  }

  /**
   * Find recent projects for a user (both owned and member of)
   */
  async findRecentForUser(userId: string, limit: number = 5): Promise<Project[]> {
    // First get projects owned by the user
    const { data: ownedProjects, error: ownedError } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('ownerId', userId)
      .order('updatedAt', { ascending: false })
      .limit(limit);
    
    if (ownedError) {
      console.error('Error fetching owned projects:', ownedError);
      throw ownedError;
    }
    
    // Then get projects the user is a member of
    const { data: memberProjects, error: memberError } = await this.getClient()
      .from('ProjectMember')
      .select(`
        project:Project(*)
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(limit);
    
    if (memberError) {
      console.error('Error fetching member projects:', memberError);
      throw memberError;
    }
    
    // Combine and sort the results
    const memberProjectsData = memberProjects.map(item => item.project);
    const allProjects = [...ownedProjects, ...memberProjectsData];
    
    // Sort by updatedAt and limit to the requested number
    return allProjects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
}

// Export a singleton instance
export const projectRepository = new ProjectRepository();