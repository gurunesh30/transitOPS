import { createClient, type RedisClientType } from 'redis';

// In-memory TTL cache entry
interface MemCacheEntry {
  value: string;
  expiresAt: number;
}

class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  // In-memory fallback when Redis is unavailable
  private memCache = new Map<string, MemCacheEntry>();
  private readonly MEM_CACHE_MAX_KEYS = 500;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️  Redis unavailable after 3 retries — using in-memory cache fallback.');
            return false; // Stop reconnecting
          }
          return Math.min(retries * 200, 2000);
        },
      },
    });

    this.client.on('error', () => {
      this.isConnected = false;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis connected — switching to Redis cache.');
      this.isConnected = true;
      this.memCache.clear(); // Flush stale in-memory entries
    });

    this.client.connect().catch(() => {
      console.warn('⚠️  Redis is not running — using in-memory cache fallback.');
    });
  }

  async getCache(key: string): Promise<string | null> {
    // Redis path
    if (this.isConnected) {
      try {
        return await this.client.get(key);
      } catch {
        return null;
      }
    }

    // In-memory fallback path
    const entry = this.memCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memCache.delete(key);
      return null;
    }
    return entry.value;
  }

  async setCache(key: string, value: string, ttlSeconds = 60): Promise<void> {
    // Redis path
    if (this.isConnected) {
      try {
        await this.client.setEx(key, ttlSeconds, value);
      } catch {
        // Cache write failure is non-critical
      }
      return;
    }

    // In-memory fallback path — evict expired keys if at capacity
    if (this.memCache.size >= this.MEM_CACHE_MAX_KEYS) {
      const now = Date.now();
      for (const [k, v] of this.memCache) {
        if (now > v.expiresAt) this.memCache.delete(k);
      }
      // If still full, evict the oldest entry
      if (this.memCache.size >= this.MEM_CACHE_MAX_KEYS) {
        const firstKey = this.memCache.keys().next().value;
        if (firstKey) this.memCache.delete(firstKey);
      }
    }

    this.memCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async invalidateCache(key: string): Promise<void> {
    // Redis path
    if (this.isConnected) {
      try {
        await this.client.del(key);
      } catch {
        // Cache invalidation failure is non-critical
      }
      return;
    }

    // In-memory fallback path
    this.memCache.delete(key);
  }
}

export const redisService = new RedisService();