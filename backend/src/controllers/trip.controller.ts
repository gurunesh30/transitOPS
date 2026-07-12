import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service';
import { redisService } from '../services/redis.service';

export class TripController {
  public static async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.executeDispatchTransaction(req.body);
      await redisService.invalidateCache('analytics:dashboard'); // Invalidate stale write-through cache instantly
      res.status(201).json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { final_odometer } = req.body;
      const completedTrip = await TripService.executeCompletionTransaction(id, Number(final_odometer));
      await redisService.invalidateCache('analytics:dashboard');
      res.status(200).json(completedTrip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}