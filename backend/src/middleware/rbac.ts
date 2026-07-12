import { Request, Response, NextFunction } from 'express';

export const checkPermissions = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'RBAC Enforcement: Privileges matching scope are missing.' });
    }
    next();
  };
};