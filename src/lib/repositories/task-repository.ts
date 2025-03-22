import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

// Define types for the Task entity
export type Task = Database['public']['Tables']['Task']['Row'];
export type TaskInsert = Database['public']['Tables']['Task']['Insert'];
export type TaskUpdate = Database['public']['Tables']['Task']['Update'];

// Define a type for Task with Assignee information
export interface TaskWithAssignee extends Task {
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Define a type for Task with Project information
export interface TaskWithProject extends Task {
  project: {
    id: string;
    name: string;
    status: string;
  };
}

// Define a type for Task with both Assignee and Project information
export interface TaskWithDetails extends Task {
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  };
}

/**
 * Repository for Task entities
 */
export class TaskRepository extends BaseRepository<Task, TaskInsert, TaskUpdate> {
  constructor() {
    super('Task');
  }

  /**
   * Find tasks by project ID
   */
  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.findByField('projectId', projectId);
  }

  /**
   * Find tasks assigned to a user
   */
  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    return this.findByField('assigneeId', assigneeId);
  }

  /**
   * Find tasks by status
   */
  async findByStatus(status: string): Promise<Task[]> {
    return this.findByField('status', status);
  }

  /**
   * Find tasks with assignee information
   */
  async findWithAssignee(projectId?: string): Promise<TaskWithAssignee[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        assignee:User(id, name, email)
      `);
    
    if (projectId) {
      query = query.eq('projectId', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithAssignee:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find tasks with project information
   */
  async findWithProject(assigneeId?: string): Promise<TaskWithProject[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        project:Project(id, name, status)
      `);
    
    if (assigneeId) {
      query = query.eq('assigneeId', assigneeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithProject:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find tasks with all details (assignee and project)
   */
  async findWithDetails(options?: { 
    projectId?: string; 
    assigneeId?: string;
    status?: string;
  }): Promise<TaskWithDetails[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select(`
        *,
        assignee:User(id, name, email),
        project:Project(id, name, status)
      `);
    
    if (options?.projectId) {
      query = query.eq('projectId', options.projectId);
    }
    
    if (options?.assigneeId) {
      query = query.eq('assigneeId', options.assigneeId);
    }
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in findWithDetails:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find upcoming tasks for a user
   */
  async findUpcomingForUser(userId: string, limit: number = 5): Promise<TaskWithDetails[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select(`
        *,
        assignee:User(id, name, email),
        project:Project(id, name, status)
      `)
      .eq('assigneeId', userId)
      .gte('dueDate', new Date().toISOString())
      .order('dueDate', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error in findUpcomingForUser:', error);
      throw error;
    }
    
    return data || [];
  }
}

// Export a singleton instance
export const taskRepository = new TaskRepository();