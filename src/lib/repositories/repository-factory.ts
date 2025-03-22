import { BaseRepository } from './base-repository';
import { memoryCache } from '../cache/memory-cache';

/**
 * A factory for creating cached repositories
 */
export class RepositoryFactory {
  /**
   * Create a cached version of a repository
   * @param repository The repository to cache
   * @param prefix The cache key prefix
   * @param defaultTtl The default TTL in seconds
   */
  static createCached<T, I, U>(
    repository: BaseRepository<T, I, U>,
    prefix: string,
    defaultTtl: number = 60
  ): CachedRepository<T, I, U> {
    return new CachedRepository(repository, prefix, defaultTtl);
  }
}

/**
 * A wrapper around a repository that adds caching
 */
export class CachedRepository<T, I, U> {
  private repository: BaseRepository<T, I, U>;
  private prefix: string;
  private defaultTtl: number;
  
  // Add index signature to allow dynamic method access
  [key: string]: any;

  constructor(repository: BaseRepository<T, I, U>, prefix: string, defaultTtl: number) {
    this.repository = repository;
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
    
    // Forward all methods from the repository that aren't already defined
    this.forwardMethods();
  }
  
  /**
   * Forward all methods from the underlying repository
   */
  private forwardMethods(): void {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.repository))
      .filter(method =>
        method !== 'constructor' &&
        typeof (this.repository as any)[method] === 'function' &&
        !['findById', 'findAll', 'findByField', 'create', 'update', 'delete', 'getRepository', 'invalidateCache', 'cacheKey', 'forwardMethods']
          .includes(method)
      );
    
    for (const method of methods) {
      this[method] = async (...args: any[]) => {
        // Generate a cache key for this method call
        const cacheKey = this.cacheKey(method, ...args);
        
        // Try to get the result from cache or execute the method
        return memoryCache.getOrSet(
          cacheKey,
          () => (this.repository as any)[method](...args),
          this.defaultTtl
        );
      };
    }
  }

  /**
   * Generate a cache key
   */
  private cacheKey(method: string, ...args: any[]): string {
    return `${this.prefix}:${method}:${JSON.stringify(args)}`;
  }

  /**
   * Invalidate all cache entries for this repository
   */
  invalidateCache(): void {
    memoryCache.invalidateByPrefix(this.prefix);
  }

  /**
   * Find an entity by its ID (cached)
   */
  async findById(id: string, ttl?: number): Promise<T | null> {
    const cacheKey = this.cacheKey('findById', id);
    return memoryCache.getOrSet(
      cacheKey,
      () => this.repository.findById(id),
      ttl || this.defaultTtl
    );
  }

  /**
   * Find all entities (cached)
   */
  async findAll(ttl?: number): Promise<T[]> {
    const cacheKey = this.cacheKey('findAll');
    return memoryCache.getOrSet(
      cacheKey,
      () => this.repository.findAll(),
      ttl || this.defaultTtl
    );
  }

  /**
   * Find entities by a field value (cached)
   */
  async findByField(field: string, value: any, ttl?: number): Promise<T[]> {
    const cacheKey = this.cacheKey('findByField', field, value);
    return memoryCache.getOrSet(
      cacheKey,
      () => this.repository.findByField(field, value),
      ttl || this.defaultTtl
    );
  }

  /**
   * Create a new entity (invalidates cache)
   */
  async create(data: I): Promise<T> {
    const result = await this.repository.create(data);
    this.invalidateCache();
    return result;
  }

  /**
   * Update an entity (invalidates cache)
   */
  async update(id: string, data: U): Promise<T> {
    const result = await this.repository.update(id, data);
    this.invalidateCache();
    return result;
  }

  /**
   * Delete an entity (invalidates cache)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    this.invalidateCache();
    return result;
  }

  /**
   * Get the underlying repository
   */
  getRepository(): BaseRepository<T, I, U> {
    return this.repository;
  }
}