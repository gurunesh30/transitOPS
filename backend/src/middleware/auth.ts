import { Request, Response, NextFunction } from 'express';
import { V3 } from 'paseto';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Fast crypto-safe padding to handle 32 bytes requirements securely
const keyMaterial = Buffer.alloc(32);
Buffer.from(process.env.JWT_SECRET || 'secret-senior-key-must-be-long-enough-32', 'utf-8').copy(keyMaterial);
const symmetricKey = crypto.createSecretKey(keyMaterial);

export const generateToken = async (payload: Record<string, any>): Promise<string> => {
  return await V3.encrypt(payload, symmetricKey, { expiresIn: '8h' });
};

export const authorizeUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header format malformed.' });
    }
    const token = authHeader.split(' ')[1];
    req.user = (await V3.decrypt(token, symmetricKey)) as any;
    next();
  } catch {
    return res.status(401).json({ error: 'Cryptographic handshake or expiration failure. PASETO invalid.' });
  }
};