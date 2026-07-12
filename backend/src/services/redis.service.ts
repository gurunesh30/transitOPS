import { createClient, type RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️  Redis unavailable after 3 retries — running without cache.');
            return false; // Stop reconnecting
          }
          return Math.min(retries * 200, 2000);
        },
      },
    });

    this.client.on('error', () => {
      // Suppress repeated error logs; the reconnectStrategy handles messaging
      this.isConnected = false;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis connected.');
      this.isConnected = true;
    });

    this.client.connect().catch(() => {
      console.warn('⚠️  Redis is not running — cache layer disabled. The server will operate without caching.');
    });
  }

  async getCache(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async setCache(key: string, value: string, ttlSeconds = 60): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.setEx(key, ttlSeconds, value);
    } catch {
      // Cache write failure is non-critical
    }
  }

  async invalidateCache(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch {
      // Cache invalidation failure is non-critical
    }
  }
}

export const redisService = new RedisService();