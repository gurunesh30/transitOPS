import { Response } from 'express';
import { redisService } from '../services/redis.service';

interface CacheOptions {
    ttl?: number;
    res?: Response;
}

export async function getOrSetCache<T>(
    key: string,
    cb: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const { ttl = 300, res } = options;

    try {
        const cachedData = await redisService.getCache(key);

        if (cachedData) {
            console.log(`[REDIS] CACHE HIT for key: ${key}`);
            if (res) {
                res.setHeader('X-Cache', 'HIT');
            }
            return JSON.parse(cachedData) as T;
        }

        console.log(`[REDIS] CACHE MISS for key: ${key}. Querying database...`);
        if (res) {
            res.setHeader('X-Cache', 'MISS');
        }
        const freshData = await cb();

        await redisService.setCache(key, JSON.stringify(freshData), ttl);

        return freshData;
    } catch (error) {
        console.error(`[REDIS ERROR]:`, error);
        return await cb();
    }
}
