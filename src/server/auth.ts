import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole } from '../types';

// In-memory active session token store (maps token -> { userId, role, expiresAt })
interface Session {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const AuthEngine = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  createSession(user: { id: string; email: string; username: string; role: UserRole }): string {
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    sessions.set(token, {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: now,
      expiresAt: now + SESSION_DURATION_MS,
    });
    return token;
  },

  getSession(token: string): Session | null {
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return null;
    }
    return session;
  },

  destroySession(token: string): void {
    sessions.delete(token);
  },

  updateSessionRole(userId: string, newRole: UserRole): void {
    for (const [token, session] of sessions.entries()) {
      if (session.userId === userId) {
        session.role = newRole;
      }
    }
  }
};

// Express Request Extension
export interface AuthenticatedRequest extends Request {
  user?: Session;
}

// Middleware: Require valid authentication
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.query.token as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' }
    });
  }

  const session = AuthEngine.getSession(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_SESSION', message: 'Session expired or invalid. Please sign in again.' }
    });
  }

  req.user = session;
  next();
}

// Optional Auth Middleware (attaches user if token present)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.query.token as string);

  if (token) {
    const session = AuthEngine.getSession(token);
    if (session) {
      req.user = session;
    }
  }
  next();
}

// Middleware: Require specific role (e.g. moderator, admin, super_admin)
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`
        }
      });
    }

    next();
  };
}

// Sliding Window Rate Limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(options: { max: number; windowMs: number; keyPrefix?: string }) {
  const { max, windowMs, keyPrefix = 'rl' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        data: null,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Please retry in ${retryAfter} seconds.`
        }
      });
    }

    next();
  };
}
