import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

// Define types for the Expense entity
export type Expense = Database['public']['Tables']['Expense']['Row'];
export type ExpenseInsert = Database['public']['Tables']['Expense']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['Expense']['Update'];

// Define a type for Expense with Project information
export interface ExpenseWithProject extends Expense {
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
}

/**
 * Repository for Expense entities
 */
export class ExpenseRepository extends BaseRepository<Expense, ExpenseInsert, ExpenseUpdate> {
  constructor() {
    super('Expense');
  }

  /**
   * Find all expenses for a user
   */
  async findByUserId(userId: string): Promise<Expense[]> {
    return this.findByField('userId', userId);
  }

  /**
   * Find all expenses for a project
   */
  async findByProjectId(projectId: string): Promise<Expense[]> {
    return this.findByField('projectId', projectId);
  }

  /**
   * Find recent expenses for a user
   */
  async findRecentByUserId(userId: string, limit: number = 5): Promise<Expense[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error in findRecentByUserId:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Find expenses with project information
   */
  async findWithProjectByUserId(userId: string): Promise<ExpenseWithProject[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select(`
        *,
        project:Project(id, name, status)
      `)
      .eq('userId', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error in findWithProjectByUserId:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Get expense summary by category for a user
   */
  async getSummaryByCategory(userId: string): Promise<{ category: string; total: number }[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('category, amount')
      .eq('userId', userId);
    
    if (error) {
      console.error('Error in getSummaryByCategory:', error);
      throw error;
    }
    
    // Calculate totals by category
    const summary = data.reduce<Record<string, number>>((acc, expense) => {
      const { category, amount } = expense;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(amount);
      return acc;
    }, {});
    
    // Convert to array format
    return Object.entries(summary).map(([category, total]) => ({
      category,
      total: total as number,
    }));
  }
}

// Export a singleton instance
export const expenseRepository = new ExpenseRepository();