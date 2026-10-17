import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.ts';
import { IUser, UserRole } from '../types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'servicehub_jwt_secret_dev_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'servicehub_jwt_refresh_secret_key_2026';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function generateAccessToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      type: 'ACCESS',
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      type: 'REFRESH',
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Kept for seamless backward compatibility
export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyRefreshToken(token: string): { id: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; role: UserRole };
    return decoded;
  } catch {
    return null;
  }
}

// In-memory rate limiter for Phase 12 Security
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(limit: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const client = ipRequestCounts.get(ip);

    if (!client || now > client.resetTime) {
      ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    client.count += 1;
    if (client.count > limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again later.',
      });
    }

    next();
  };
}

export function protect(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    const db = getDb();
    const user = db.users.find((u) => u._id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or revoked' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to perform this operation`,
      });
    }
    next();
  };
}
