import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { redisService } from '../services/redis.service';

export class ReportController {
  public static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const cachedData = await redisService.getCache('analytics:dashboard');
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));

      // Calculate analytical pipeline arrays if cache is cold
      const activeVehiclesCount = await prisma.vehicle.count({ where: { status: 'On_Trip' } });
      const availableVehiclesCount = await prisma.vehicle.count({ where: { status: 'Available' } });
      
      const payload = {
        kpis: {
          active_vehicles: activeVehiclesCount,
          available_vehicles: availableVehiclesCount,
          fleet_utilization_percentage: (activeVehiclesCount / (activeVehiclesCount + availableVehiclesCount || 1)) * 180
        }
      };

      await redisService.setCache('analytics:dashboard', JSON.stringify(payload), 45);
      res.status(200).json(payload);
    } catch (err) { next(err); }
  }

  public static async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await prisma.vehicle.findMany();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fleet_metrics.csv');

      res.write('ID,Registration,Model,Odometer\n');
      for (const v of vehicles) {
        res.write(`${v.id},${v.registration_number},${v.model},${v.odometer}\n`);
      }
      res.end();
    } catch (err) { next(err); }
  }
}