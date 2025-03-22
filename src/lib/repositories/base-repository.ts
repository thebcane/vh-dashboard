import { supabaseAdmin } from '@/lib/supabase/client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { db, retryOperation } from '@/lib/database/connection-pool';

/**
 * Base Repository class that provides common database operations
 * @template T - The entity type this repository manages
 * @template I - The insert type for the entity
 * @template U - The update type for the entity
 */
export abstract class BaseRepository<T, I, U> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Get the Supabase client
   */
  protected getClient() {
    return supabaseAdmin();
  }

  /**
   * Execute a database operation with retry logic
   */
  protected async executeWithRetry<R>(operation: () => Promise<R>): Promise<R> {
    return retryOperation(operation);
  }

  /**
   * Find an entity by its ID
   */
  async findById(id: string): Promise<T | null> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error in ${this.tableName} findById:`, error);
        throw error;
      }
      
      return data;
    });
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<T[]> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select('*');
      
      if (error) {
        console.error(`Error in ${this.tableName} findAll:`, error);
        throw error;
      }
      
      return data || [];
    });
  }

  /**
   * Find entities by a field value
   */
  async findByField(field: string, value: any): Promise<T[]> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select('*')
        .eq(field, value);
      
      if (error) {
        console.error(`Error in ${this.tableName} findByField:`, error);
        throw error;
      }
      
      return data || [];
    });
  }

  /**
   * Create a new entity
   */
  async create(data: I): Promise<T> {
    return this.executeWithRetry(async () => {
      const { data: result, error } = await this.getClient()
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error(`Error in ${this.tableName} create:`, error);
        throw error;
      }
      
      return result;
    });
  }

  /**
   * Update an entity
   */
  async update(id: string, data: U): Promise<T> {
    return this.executeWithRetry(async () => {
      const { data: result, error } = await this.getClient()
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error in ${this.tableName} update:`, error);
        throw error;
      }
      
      return result;
    });
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const { error } = await this.getClient()
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error in ${this.tableName} delete:`, error);
        throw error;
      }
      
      return true;
    });
  }

  /**
   * Get a query builder for this table
   */
  protected query(): PostgrestFilterBuilder<any, any, any, unknown> {
    return this.getClient()
      .from(this.tableName)
      .select();
  }
}