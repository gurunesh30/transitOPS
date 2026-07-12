import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export class FleetController {
  public static async registerVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await prisma.vehicle.create({ data: req.body });
      res.status(201).json(vehicle);
    } catch (err) { next(err); }
  }

  public static async queryVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      // Query raw precalculated states using our dynamic read views
      const list = await prisma.$queryRaw`SELECT * FROM v_vehicles_realtime`;
      res.status(200).json(list);
    } catch (err) { next(err); }
  }

  public static async registerDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await prisma.driver.create({ data: req.body });
      res.status(201).json(driver);
    } catch (err) { next(err); }
  }
}