import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[System Fault Log]:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal operational system fault encountered.'
  });
};