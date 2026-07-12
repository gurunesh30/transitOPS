import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth';

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid authentication metrics.' });
      }
      const token = await generateToken({ id: user.id, email: user.email, role: user.role });
      res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) { next(err); }
  }
}