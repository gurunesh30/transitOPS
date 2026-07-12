import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export class MaintenanceController {
  public static async createLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await prisma.maintenanceLog.create({ data: req.body });
      res.status(201).json(log);
    } catch (err) { next(err); }
  }

  public static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.query;
      const where = vehicleId ? { vehicle_id: String(vehicleId) } : {};
      const logs = await prisma.maintenanceLog.findMany({
        where,
        orderBy: { opened_at: 'desc' }
      });
      res.status(200).json(logs);
    } catch (err) { next(err); }
  }

  public static async getLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const log = await prisma.maintenanceLog.findUnique({ where: { id } });
      if (!log) return res.status(404).json({ error: 'Maintenance log not found' });
      res.status(200).json(log);
    } catch (err) { next(err); }
  }

  public static async updateLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const log = await prisma.maintenanceLog.update({
        where: { id },
        data: req.body
      });
      res.status(200).json(log);
    } catch (err) { next(err); }
  }

  public static async closeLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const log = await prisma.maintenanceLog.update({
        where: { id },
        data: { status: 'Closed', closed_at: new Date() }
      });
      res.status(200).json(log);
    } catch (err) { next(err); }
  }

  public static async deleteLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.maintenanceLog.delete({ where: { id } });
      res.status(204).send();
    } catch (err) { next(err); }
  }
}