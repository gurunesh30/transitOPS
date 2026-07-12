import { Request, Response, NextFunction } from 'express';
import { V4 } from 'paseto';
import crypto from 'crypto';

// Fast crypto-safe padding to handle 32 bytes requirements securely
const keyMaterial = Buffer.alloc(32);
Buffer.from(process.env.JWT_SECRET || 'secret-senior-key-must-be-long-enough-32', 'utf-8').copy(keyMaterial);
const symmetricKey = crypto.createSecretKey(keyMaterial);

export const generateToken = async (payload: object): Promise<string> => {
  return await V4.encrypt(payload, symmetricKey, { expiresIn: '8h' });
};

export const authorizeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header format malformed.' });
    }
    const token = authHeader.split(' ')[1];
    req.user = (await V4.decrypt(token, symmetricKey)) as any;
    next();
  } catch {
    return res.status(401).json({ error: 'Cryptographic handshake or expiration failure. PASETO invalid.' });
  }
};