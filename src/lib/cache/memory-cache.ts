/**
 * A simple in-memory cache implementation
 */
export class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  
  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttlSeconds Time to live in seconds (default: 60)
   */
  set(key: string, value: any, ttlSeconds: number = 60): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Delete a value from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all values from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get a value from the cache or compute it if not found
   * @param key The cache key
   * @param fn The function to compute the value if not found
   * @param ttlSeconds Time to live in seconds (default: 60)
   * @returns The cached or computed value
   */
  async getOrSet<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttlSeconds: number = 60
  ): Promise<T> {
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = await fn();
    this.set(key, value, ttlSeconds);
    return value;
  }
  
  /**
   * Invalidate cache entries that match a prefix
   * @param keyPrefix The key prefix to match
   */
  invalidateByPrefix(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const memoryCache = new MemoryCache();