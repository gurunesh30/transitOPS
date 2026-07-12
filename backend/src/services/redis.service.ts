import { createClient } from 'redis';

class RedisService {
  private client;
  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect().catch(console.error);
  }

  async getCache(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async setCache(key: string, value: string, ttlSeconds = 60): Promise<void> {
    await this.client.setEx(key, ttlSeconds, value);
  }

  async invalidateCache(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export const redisService = new RedisService();