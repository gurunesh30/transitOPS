import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getOrSetCache } from '../utils/cache';

export const getVehicles = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'vehicles:all';

        const vehicles = await getOrSetCache(cacheKey, async () => {
            return await prisma.vehicle.findMany({
                orderBy: { registration_number: 'asc' }
            });
        }, { ttl: 60 });

        return res.status(200).json({
            status: 'success',
            results: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};