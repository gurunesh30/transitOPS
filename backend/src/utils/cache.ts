import { redisService } from '../services/redis.service';

interface CacheOptions {
    ttl?: number;
}

export async function getOrSetCache<T>(
    key: string,
    cb: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const { ttl = 300 } = options;

    try {
        const cachedData = await redisService.getCache(key);

        if (cachedData) {
            console.log(`[REDIS] CACHE HIT for key: ${key}`);
            return JSON.parse(cachedData) as T;
        }

        console.log(`[REDIS] CACHE MISS for key: ${key}. Querying database...`);
        const freshData = await cb();

        await redisService.setCache(key, JSON.stringify(freshData), ttl);

        return freshData;
    } catch (error) {
        console.error(`[REDIS ERROR]:`, error);
        return await cb();
    }
}
