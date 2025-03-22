import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

// Define types for the User entity
export type User = Database['public']['Tables']['User']['Row'];
export type UserInsert = Database['public']['Tables']['User']['Insert'];
export type UserUpdate = Database['public']['Tables']['User']['Update'];

/**
 * Repository for User entities
 */
export class UserRepository extends BaseRepository<User, UserInsert, UserUpdate> {
  constructor() {
    super('User');
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user not found
        return null;
      }
      console.error('Error in findByEmail:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    return this.findByField('role', role);
  }

  /**
   * Create a new user with password
   * Note: In a real application, you should hash the password before storing it
   */
  async createWithPassword(user: Omit<UserInsert, 'passwordHash'>, password: string): Promise<User> {
    // In a real application, you would hash the password here
    // const passwordHash = await bcrypt.hash(password, 10);
    const passwordHash = password; // TEMPORARY: Replace with proper hashing
    
    return this.create({
      ...user,
      passwordHash,
    });
  }

  /**
   * Verify a user's password
   * Note: In a real application, you should compare the hashed password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.passwordHash) {
      return null;
    }
    
    // In a real application, you would compare the hashed password
    // const isValid = await bcrypt.compare(password, user.passwordHash);
    const isValid = password === user.passwordHash; // TEMPORARY: Replace with proper comparison
    
    return isValid ? user : null;
  }

  /**
   * Update a user's Google Drive tokens
   */
  async updateGoogleDriveTokens(
    userId: string, 
    accessToken: string, 
    refreshToken: string, 
    expiryDate: Date
  ): Promise<User> {
    return this.update(userId, {
      googleDriveAccessToken: accessToken,
      googleDriveRefreshToken: refreshToken,
      googleDriveTokenExpiry: expiryDate.toISOString(),
    });
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();