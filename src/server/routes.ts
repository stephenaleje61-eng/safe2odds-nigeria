import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db, generateNigerianBookingCodes } from './database';
import { sportsDataService } from './sportsDataService';
import { 
  AuthEngine, 
  requireAuth, 
  optionalAuth, 
  requireRole, 
  rateLimit,
  AuthenticatedRequest 
} from './auth';
import { containsProfanityOrSpam } from '../services/profanityFilter';
import { ApiResponse, TipStatus } from '../types';

export const apiRouter = Router();

// Standard API response helper
function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    error: null,
  } as ApiResponse<T>);
}

function sendError(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({
    success: false,
    data: null,
    error: { code, message },
  } as ApiResponse<null>);
}

// ============================================================================
// 1. AUTHENTICATION ENDPOINTS (/api/auth/*)
// ============================================================================

// POST /api/auth/register
apiRouter.post(
  '/auth/register',
  rateLimit({ max: 5, windowMs: 60 * 1000, keyPrefix: 'auth_reg' }),
  async (req: Request, res: Response) => {
    try {
      const { email, password, username, displayName, country, countryCode, countryFlag } = req.body;

      if (!email || !password || !username) {
        return sendError(res, 'VALIDATION_ERROR', 'Email, password, and username are required.');
      }

      if (!country || !country.trim()) {
        return sendError(res, 'MISSING_COUNTRY', 'Please select your country before signing up.');
      }

      if (password.length < 8) {
        return sendError(res, 'WEAK_PASSWORD', 'Password must be at least 8 characters long.');
      }

      const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return sendError(res, 'INVALID_USERNAME', 'Username must be at least 3 alphanumeric characters.');
      }

      // Check profanity in username
      const profanity = containsProfanityOrSpam(cleanUsername);
      if (profanity.isFlagged) {
        return sendError(res, 'INAPPROPRIATE_NAME', profanity.reason || 'Username contains prohibited terms.');
      }

      // Check unique email
      for (const u of db.users.values()) {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return sendError(res, 'EMAIL_EXISTS', 'An account with this email address already exists.');
        }
      }

      // Check unique username
      if (db.getProfileByUsername(cleanUsername)) {
        return sendError(res, 'USERNAME_TAKEN', 'This username is already taken. Please choose another.');
      }

      const userId = `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const passwordHash = await AuthEngine.hashPassword(password);
      const now = new Date().toISOString();

      // Create internal user
      db.users.set(userId, {
        id: userId,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user', // Always standard user on registration
        accountStatus: 'active',
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      });

      // Create public profile
      const profile = {
        id: userId,
        username: cleanUsername,
        displayName: (displayName && displayName.trim()) || cleanUsername,
        email: email.toLowerCase().trim(),
        avatar: '/src/assets/images/football_tactics_guide_1791379711012.jpg',
        bio: `Football enthusiast from ${country.trim()}.`,
        country: country.trim(),
        countryCode: countryCode || 'NG',
        countryFlag: countryFlag || '🌍',
        dateJoined: now,
        points: 0,
        totalPredictions: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0.0,
        lastActive: now,
        accountStatus: 'active' as const,
        role: 'user' as const,
        isVip: false,
        savedTipIds: [],
      };
      db.profiles.set(userId, profile);

      // Create session token
      const token = AuthEngine.createSession({
        id: userId,
        email: profile.email,
        username: profile.username,
        role: profile.role,
      });

      return sendSuccess(res, { token, user: profile }, 201);
    } catch (e: any) {
      return sendError(res, 'SERVER_ERROR', e.message || 'Registration failed.', 500);
    }
  }
);

// POST /api/auth/login
apiRouter.post(
  '/auth/login',
  rateLimit({ max: 10, windowMs: 60 * 1000, keyPrefix: 'auth_login' }),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'MISSING_CREDENTIALS', 'Email and password are required.');
      }

      let foundUser = null;
      for (const u of db.users.values()) {
        if (u.email.toLowerCase() === email.toLowerCase().trim()) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        return sendError(res, 'INVALID_CREDENTIALS', 'Incorrect email or password.', 401);
      }

      if (foundUser.accountStatus === 'suspended' || foundUser.accountStatus === 'banned') {
        return sendError(res, 'ACCOUNT_SUSPENDED', 'Your account has been suspended by an administrator.', 403);
      }

      const match = await AuthEngine.verifyPassword(password, foundUser.passwordHash);
      if (!match) {
        return sendError(res, 'INVALID_CREDENTIALS', 'Incorrect email or password.', 401);
      }

      const profile = db.profiles.get(foundUser.id);
      if (!profile) {
        return sendError(res, 'PROFILE_NOT_FOUND', 'User profile missing.', 500);
      }

      profile.lastActive = new Date().toISOString();

      const token = AuthEngine.createSession({
        id: foundUser.id,
        email: foundUser.email,
        username: profile.username,
        role: foundUser.role,
      });

      return sendSuccess(res, { token, user: profile });
    } catch (e: any) {
      return sendError(res, 'SERVER_ERROR', e.message || 'Login failed.', 500);
    }
  }
);

// POST /api/auth/google (Verified OAuth Exchange)
apiRouter.post('/auth/google', async (req: Request, res: Response) => {
  try {
    const { email, displayName } = req.body;
    if (!email) {
      return sendError(res, 'VALIDATION_ERROR', 'Google profile email required.');
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = null;
    for (const u of db.users.values()) {
      if (u.email === cleanEmail) {
        existingUser = u;
        break;
      }
    }

    let userId: string;
    let profile: any;

    if (existingUser) {
      userId = existingUser.id;
      profile = db.profiles.get(userId);
    } else {
      userId = `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const baseUsername = (cleanEmail.split('@')[0] || 'punter').replace(/[^a-zA-Z0-9_]/g, '');
      const uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date().toISOString();

      db.users.set(userId, {
        id: userId,
        email: cleanEmail,
        passwordHash: '',
        role: 'user',
        accountStatus: 'active',
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      profile = {
        id: userId,
        username: uniqueUsername,
        displayName: displayName || baseUsername,
        email: cleanEmail,
        avatar: '/src/assets/images/vip_club_crest_1791379729058.jpg',
        bio: 'Verified Nigerian Google punter on Safe2Odds.',
        dateJoined: now,
        points: 0,
        totalPredictions: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0.0,
        lastActive: now,
        accountStatus: 'active' as const,
        role: 'user' as const,
        isVip: false,
        savedTipIds: [],
      };
      db.profiles.set(userId, profile);
    }

    const token = AuthEngine.createSession({
      id: userId,
      email: cleanEmail,
      username: profile.username,
      role: profile.role,
    });

    return sendSuccess(res, { token, user: profile });
  } catch (e: any) {
    return sendError(res, 'SERVER_ERROR', e.message, 500);
  }
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const profile = db.profiles.get(req.user!.userId);
  if (!profile) {
    return sendError(res, 'USER_NOT_FOUND', 'Profile not found.', 404);
  }
  return sendSuccess(res, profile);
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (token) {
    AuthEngine.destroySession(token);
  }
  return sendSuccess(res, { message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
apiRouter.post(
  '/auth/forgot-password',
  rateLimit({ max: 5, windowMs: 60 * 1000, keyPrefix: 'auth_forgot' }),
  (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'VALIDATION_ERROR', 'Email address is required.');
    }
    const result = db.requestPasswordReset(email);
    return sendSuccess(res, {
      message: 'Password reset code generated.',
      token: result.token,
    });
  }
);

// POST /api/auth/reset-password
apiRouter.post(
  '/auth/reset-password',
  rateLimit({ max: 5, windowMs: 60 * 1000, keyPrefix: 'auth_reset' }),
  (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 'VALIDATION_ERROR', 'Reset code and new password are required.');
    }
    if (newPassword.length < 8) {
      return sendError(res, 'WEAK_PASSWORD', 'Password must be at least 8 characters.');
    }
    const result = db.resetPassword(token, newPassword);
    if (!result.success) {
      return sendError(res, 'RESET_FAILED', result.error || 'Password reset failed.');
    }
    return sendSuccess(res, { message: 'Password has been reset successfully. You can now sign in.' });
  }
);

// POST /api/auth/verify-email
apiRouter.post('/auth/verify-email', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.verifyUserEmail(req.user!.userId);
  if (!ok) {
    return sendError(res, 'VERIFY_FAILED', 'Could not verify email.');
  }
  return sendSuccess(res, { message: 'Email address marked as verified!' });
});

// ============================================================================
// 2. USER PROFILES & BLOCKS (/api/profiles/* & /api/users/*)
// ============================================================================

// GET /api/profiles/:username
apiRouter.get('/profiles/:username', (req: Request, res: Response) => {
  const profile = db.getProfileByUsername(req.params.username);
  if (!profile) {
    return sendError(res, 'PROFILE_NOT_FOUND', 'User profile does not exist.', 404);
  }
  return sendSuccess(res, profile);
});

// PATCH /api/profiles/me (User can ONLY update displayName, avatar, bio)
apiRouter.patch('/profiles/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { displayName, avatar, bio } = req.body;
  const updated = db.updateUserProfile(req.user!.userId, { displayName, avatar, bio });
  if (!updated) {
    return sendError(res, 'UPDATE_FAILED', 'Could not update profile.', 400);
  }
  return sendSuccess(res, updated);
});

// POST /api/users/:id/block
apiRouter.post('/users/:id/block', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.id;
  const result = db.blockUser(req.user!.userId, targetUserId);
  if (!result.success) {
    return sendError(res, 'BLOCK_FAILED', result.error || 'Failed to block user.');
  }
  return sendSuccess(res, { message: 'User blocked. Their posts will no longer appear in your feed.' });
});

// DELETE /api/users/:id/block
apiRouter.delete('/users/:id/block', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.id;
  db.unblockUser(req.user!.userId, targetUserId);
  return sendSuccess(res, { message: 'User unblocked.' });
});

// GET /api/users/me/blocks
apiRouter.get('/users/me/blocks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const blockedIds = db.getBlockedUserIds(req.user!.userId);
  return sendSuccess(res, blockedIds);
});

// GET /api/users/:userId/predictions (User prediction history with pagination)
apiRouter.get('/users/:userId/predictions', (req: Request, res: Response) => {
  const { userId } = req.params;
  const status = req.query.status as any;
  const cursor = req.query.cursor as string;
  const limit = Number(req.query.limit) || 10;

  const result = db.getCommunityFeed({
    authorId: userId,
    status: status || 'ALL',
    cursor,
    limit,
    sort: 'latest',
  });

  return sendSuccess(res, result);
});

// ============================================================================
// 3. COMMUNITY PREDICTIONS & FEED (/api/community/* & /api/predictions/*)
// ============================================================================

// GET /api/community/feed (Cursor-based, server filtering & search)
apiRouter.get('/community/feed', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const {
    cursor,
    limit,
    league,
    sport,
    status,
    search,
    oddsMin,
    oddsMax,
    sort,
  } = req.query;

  const feed = db.getCommunityFeed({
    cursor: cursor as string,
    limit: limit ? Number(limit) : 10,
    league: league as string,
    sport: sport as string,
    status: status as any,
    search: search as string,
    oddsMin: oddsMin ? Number(oddsMin) : undefined,
    oddsMax: oddsMax ? Number(oddsMax) : undefined,
    viewerId: req.user?.userId,
    sort: sort as any,
  });

  return sendSuccess(res, feed);
});

// POST /api/community/predictions (Server-side validation & anti-spam)
apiRouter.post(
  '/community/predictions',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 1000, keyPrefix: 'pred_create' }),
  (req: AuthenticatedRequest, res: Response) => {
    const authorProfile = db.profiles.get(req.user!.userId);
    if (!authorProfile) {
      return sendError(res, 'UNAUTHORIZED', 'Profile required.', 401);
    }

    if (authorProfile.accountStatus === 'suspended') {
      return sendError(res, 'FORBIDDEN', 'Your account is suspended.', 403);
    }

    const { match, league, prediction, predictionType, odds, comment, analysis } = req.body;

    if (!match || !league || !prediction) {
      return sendError(res, 'VALIDATION_ERROR', 'Match, league, and prediction are required.');
    }

    const oddsNum = Number(odds);
    if (isNaN(oddsNum) || oddsNum < 1.05 || oddsNum > 50.0) {
      return sendError(res, 'INVALID_ODDS', 'Odds must be a valid number between 1.05 and 50.00.');
    }

    // Check spam / profanity
    const textToCheck = `${match} ${prediction} ${comment || ''} ${analysis || ''}`;
    const check = containsProfanityOrSpam(textToCheck);
    if (check.isFlagged) {
      return sendError(res, 'INAPPROPRIATE_CONTENT', check.reason || 'Content rejected due to policy violation.');
    }

    const created = db.createPrediction(
      {
        id: authorProfile.id,
        username: authorProfile.username,
        displayName: authorProfile.displayName,
        avatar: authorProfile.avatar,
        role: authorProfile.role,
        winRate: authorProfile.winRate,
      },
      {
        match,
        league,
        prediction,
        predictionType,
        odds: oddsNum,
        comment: comment || '',
        analysis,
      }
    );

    return sendSuccess(res, created, 201);
  }
);

// GET /api/predictions/:id
apiRouter.get('/predictions/:id', (req: Request, res: Response) => {
  const pred = db.predictions.find(p => p.id === req.params.id);
  if (!pred) {
    return sendError(res, 'NOT_FOUND', 'Prediction not found.', 404);
  }
  return sendSuccess(res, pred);
});

// POST /api/predictions/:id/vote
apiRouter.post('/predictions/:id/vote', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const pred = db.predictions.find(p => p.id === req.params.id);
  if (!pred) {
    return sendError(res, 'NOT_FOUND', 'Prediction not found.', 404);
  }

  const { type } = req.body;
  if (type === 'like') {
    pred.likes += 1;
  } else if (type === 'dislike') {
    pred.dislikes += 1;
  }

  return sendSuccess(res, { likes: pred.likes, dislikes: pred.dislikes });
});

// GET /api/predictions/:id/comments
apiRouter.get('/predictions/:id/comments', (req: Request, res: Response) => {
  const comments = db.getComments(req.params.id);
  return sendSuccess(res, comments);
});

// POST /api/predictions/:id/comments
apiRouter.post(
  '/predictions/:id/comments',
  requireAuth,
  rateLimit({ max: 10, windowMs: 60 * 1000, keyPrefix: 'pred_comm' }),
  (req: AuthenticatedRequest, res: Response) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return sendError(res, 'VALIDATION_ERROR', 'Comment text cannot be empty.');
    }

    const check = containsProfanityOrSpam(text);
    if (check.isFlagged) {
      return sendError(res, 'INAPPROPRIATE_CONTENT', check.reason || 'Comment contains prohibited language.');
    }

    const authorProfile = db.profiles.get(req.user!.userId);
    const comment = db.addComment(
      req.params.id,
      {
        id: req.user!.userId,
        username: req.user!.username,
        displayName: authorProfile?.displayName || req.user!.username,
        avatar: authorProfile?.avatar,
      },
      text
    );

    return sendSuccess(res, comment, 201);
  }
);

// ============================================================================
// 4. LEADERBOARD WITH TIMEFRAME SUPPORT (/api/leaderboard & /api/leaderboard/weekly)
// ============================================================================
apiRouter.get('/leaderboard', (req: Request, res: Response) => {
  const timeframe = (req.query.timeframe as any) || 'weekly';
  const top10 = db.getLeaderboard(timeframe);
  return sendSuccess(res, top10);
});

apiRouter.get('/leaderboard/weekly', (_req: Request, res: Response) => {
  const top10 = db.getLeaderboard('weekly');
  return sendSuccess(res, top10);
});

// ============================================================================
// 5. REPORTS (/api/reports)
// ============================================================================
apiRouter.post(
  '/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 1000, keyPrefix: 'rep_sub' }),
  (req: AuthenticatedRequest, res: Response) => {
    const { targetType, targetId, targetSummary, reason, description } = req.body;
    if (!targetType || !targetId || !reason) {
      return sendError(res, 'VALIDATION_ERROR', 'Target and reason required.');
    }

    const result = db.submitReport(
      { id: req.user!.userId, username: req.user!.username },
      { targetType, targetId, targetSummary: targetSummary || 'Content item', reason, description }
    );

    if (!result.success) {
      return sendError(res, 'DUPLICATE_REPORT', result.error || 'Report submission failed.');
    }

    return sendSuccess(res, result.report, 201);
  }
);

// ============================================================================
// 6. NOTIFICATIONS (/api/notifications)
// ============================================================================
apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getUserNotifications(req.user!.userId);
  return sendSuccess(res, notifs);
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.markNotificationAsRead(req.user!.userId, req.params.id);
  return sendSuccess(res, { read: ok });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsAsRead(req.user!.userId);
  return sendSuccess(res, { message: 'All notifications marked as read.' });
});

// ============================================================================
// 6B. REAL-TIME PUBLIC CHAT ROOM (/api/chat/*)
// ============================================================================
apiRouter.get('/chat/messages', (_req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(10, Number(_req.query.limit) || 60));
  const beforeId = _req.query.beforeId as string | undefined;
  const result = db.getChatMessages(limit, beforeId);
  return sendSuccess(res, result);
});

apiRouter.post(
  '/chat/messages',
  requireAuth,
  rateLimit({ max: 30, windowMs: 60 * 1000, keyPrefix: 'chat_msg' }),
  (req: AuthenticatedRequest, res: Response) => {
    const { text, replyToId } = req.body;
    if (!text || !text.trim()) {
      return sendError(res, 'VALIDATION_ERROR', 'Message text cannot be empty.');
    }

    const check = containsProfanityOrSpam(text);
    if (check.isFlagged) {
      return sendError(res, 'INAPPROPRIATE_CONTENT', check.reason || 'Message contains prohibited language.');
    }

    const profile = db.profiles.get(req.user!.userId);
    const msg = db.postChatMessage(
      {
        id: req.user!.userId,
        username: req.user!.username,
        displayName: profile?.displayName || req.user!.username,
        avatar: profile?.avatar,
        country: profile?.country || 'Worldwide',
        countryFlag: profile?.countryFlag || '🌍',
        role: req.user!.role,
      },
      text.trim(),
      replyToId
    );

    return sendSuccess(res, msg, 201);
  }
);

apiRouter.post(
  '/chat/messages/:id/like',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const result = db.likeChatMessage(req.params.id, req.user!.userId);
    if (!result) {
      return sendError(res, 'MESSAGE_NOT_FOUND', 'Chat message not found.', 404);
    }
    return sendSuccess(res, result);
  }
);

// ============================================================================
// 7. ADMIN MODERATION & SERVER-SIDE AUTHORIZATION (/api/admin/*)
// ============================================================================

// GET /api/admin/stats
apiRouter.get('/admin/stats', requireAuth, requireRole(['moderator', 'admin', 'super_admin']), (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getAdminStats();
  return sendSuccess(res, stats);
});

// POST /api/admin/predictions/:id/verify
// CRITICAL IDEMPOTENT POINTS AWARDING
apiRouter.post(
  '/admin/predictions/:id/verify',
  requireAuth,
  requireRole(['moderator', 'admin', 'super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    if (!['WON', 'LOST', 'VOID', 'REMOVED', 'PENDING'].includes(status)) {
      return sendError(res, 'INVALID_STATUS', 'Status must be WON, LOST, VOID, REMOVED, or PENDING.');
    }

    const result = db.verifyPrediction(
      req.params.id,
      status,
      { id: req.user!.userId, username: req.user!.username }
    );

    if (!result.success) {
      return sendError(res, 'VERIFICATION_FAILED', result.error || 'Failed to verify prediction.');
    }

    return sendSuccess(res, result.prediction);
  }
);

// GET /api/admin/reports
apiRouter.get(
  '/admin/reports',
  requireAuth,
  requireRole(['moderator', 'admin', 'super_admin']),
  (_req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, db.reports);
  }
);

// POST /api/admin/reports/:id/resolve
apiRouter.post(
  '/admin/reports/:id/resolve',
  requireAuth,
  requireRole(['moderator', 'admin', 'super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const report = db.reports.find(r => r.id === req.params.id);
    if (!report) {
      return sendError(res, 'NOT_FOUND', 'Report not found.', 404);
    }

    const { action } = req.body; // 'RESOLVED' | 'DISMISSED'
    report.status = action === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED';
    report.reviewedAt = new Date().toISOString();
    report.reviewedBy = req.user!.userId;

    return sendSuccess(res, report);
  }
);

// POST /api/admin/users/:id/suspend
apiRouter.post(
  '/admin/users/:id/suspend',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { suspend } = req.body;
    const ok = db.setAccountStatus(
      req.params.id,
      suspend ? 'suspended' : 'active',
      { id: req.user!.userId, username: req.user!.username }
    );

    if (!ok) {
      return sendError(res, 'USER_NOT_FOUND', 'Target user not found.', 404);
    }

    return sendSuccess(res, { status: suspend ? 'suspended' : 'active' });
  }
);

// POST /api/admin/users/:id/role (Super Admin only)
apiRouter.post(
  '/admin/users/:id/role',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin', 'super_admin'].includes(role)) {
      return sendError(res, 'INVALID_ROLE', 'Invalid role specified.');
    }

    const ok = db.setUserRole(
      req.params.id,
      role,
      { id: req.user!.userId, username: req.user!.username }
    );

    if (!ok) {
      return sendError(res, 'USER_NOT_FOUND', 'Target user not found.', 404);
    }

    AuthEngine.updateSessionRole(req.params.id, role);
    return sendSuccess(res, { role });
  }
);

// GET /api/admin/audit-logs
apiRouter.get(
  '/admin/audit-logs',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  (_req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, db.auditLogs.slice(0, 50));
  }
);

// ============================================================================
// 8. OFFICIAL PLATFORM TIPS, NEWS & SETTINGS
// ============================================================================

// GET /api/tips
apiRouter.get('/tips', (_req: Request, res: Response) => {
  return sendSuccess(res, db.officialTips);
});

// POST /api/tips (Admin only)
apiRouter.post('/tips', requireAuth, requireRole(['moderator', 'admin', 'super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const tipData = req.body;
  const newTip: any = {
    ...tipData,
    id: `tip-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.officialTips.unshift(newTip);
  return sendSuccess(res, newTip, 201);
});

// PUT /api/tips/:id
apiRouter.put('/tips/:id', requireAuth, requireRole(['moderator', 'admin', 'super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const idx = db.officialTips.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return sendError(res, 'NOT_FOUND', 'Tip not found.', 404);
  }
  db.officialTips[idx] = {
    ...db.officialTips[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  return sendSuccess(res, db.officialTips[idx]);
});

// DELETE /api/tips/:id
apiRouter.delete('/tips/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthenticatedRequest, res: Response) => {
  db.officialTips = db.officialTips.filter(t => t.id !== req.params.id);
  return sendSuccess(res, { message: 'Tip deleted.' });
});

// GET /api/news
apiRouter.get('/news', (_req: Request, res: Response) => {
  return sendSuccess(res, db.newsArticles);
});

// GET /api/live (Real-Time Live Scores, Today's Matches, Upcoming, & Results)
apiRouter.get('/live', (req: Request, res: Response) => {
  const status = req.query.status as any;
  const league = req.query.league as string;
  const search = req.query.search as string;

  const matchData = sportsDataService.getMatches({
    status: status || 'ALL',
    league: league || 'ALL',
    search,
  });

  return sendSuccess(res, matchData);
});

// GET /api/live/:id (Verified real match details, statistics, events, and lineups)
apiRouter.get('/live/:id', async (req: Request, res: Response) => {
  const matchId = req.params.id;
  const details = await sportsDataService.getMatchDetails(matchId);
  if (!details) {
    return sendError(res, 'MATCH_NOT_FOUND', 'Verified match details could not be found.', 404);
  }
  return sendSuccess(res, details);
});

// POST /api/live/sync (Manual sync trigger with rate limit)
apiRouter.post(
  '/live/sync',
  rateLimit({ max: 15, windowMs: 60 * 1000, keyPrefix: 'live_sync' }),
  async (_req: Request, res: Response) => {
    const result = await sportsDataService.syncFromRealDataSources();
    return sendSuccess(res, result);
  }
);

// GET /api/settings
apiRouter.get('/settings', (_req: Request, res: Response) => {
  return sendSuccess(res, db.settings);
});

// PUT /api/settings
apiRouter.put('/settings', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthenticatedRequest, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  return sendSuccess(res, db.settings);
});

// POST /api/booking-codes/generate
apiRouter.post('/booking-codes/generate', (_req: Request, res: Response) => {
  const codes = generateNigerianBookingCodes();
  return sendSuccess(res, codes);
});

// Catch-all 404 handler for undefined API routes
apiRouter.all('*', (req: Request, res: Response) => {
  return sendError(res, 'ENDPOINT_NOT_FOUND', `API endpoint '${req.method} ${req.originalUrl}' does not exist.`, 404);
});
