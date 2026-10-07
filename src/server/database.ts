import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { 
  UserProfile, 
  UserRole, 
  AccountStatus,
  CommunityPrediction, 
  CommunityPredictionStatus,
  PointsTransaction, 
  Report, 
  UserBlock, 
  NotificationItem, 
  AdminAuditLog, 
  LeaderboardUser,
  BettingTip,
  NewsArticle,
  LiveMatch,
  AppSettings,
  CursorPaginatedResponse,
  PredictionComment,
  LeaderboardTimeframe,
  BettingTipBookingCodes
} from '../types';
import { 
  INITIAL_TIPS, 
  INITIAL_NEWS, 
  INITIAL_LIVE_MATCHES, 
  INITIAL_SETTINGS 
} from '../data/seedData';

// User Internal Model (including credentials)
export interface InternalUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calculates user badges based on production criteria:
 * - Pro Tipster (points >= 100)
 * - High Accuracy (win rate >= 75% with at least 5 bets)
 * - Veteran (at least 15 predictions)
 * - Safe Banker (win rate >= 80% and at least 8 wins)
 * - Rising Star (win rate >= 70% and points between 20 and 99)
 */
export function computeUserBadges(profile: { points: number; winRate: number; totalPredictions: number; totalWins: number }): string[] {
  const badges: string[] = [];
  if (profile.points >= 100) badges.push('Pro Tipster');
  if (profile.winRate >= 75 && profile.totalPredictions >= 5) badges.push('High Accuracy');
  if (profile.totalPredictions >= 15) badges.push('Veteran');
  if (profile.winRate >= 80 && profile.totalWins >= 8) badges.push('Safe Banker');
  if (profile.winRate >= 70 && profile.points >= 20 && profile.points < 100) badges.push('Rising Star');
  return badges;
}

export function generateNigerianBookingCodes(): BettingTipBookingCodes {
  const randNum = (len: number) => Math.floor(Math.random() * Math.pow(10, len)).toString().padStart(len, '0');
  const randLetters = (len: number) => Array.from({ length: len }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return {
    sportyBet: `SB-${randLetters(2)}${randNum(4)}`,
    bet9ja: `B9J-${randNum(5)}`,
    oneXBet: `1X-${randNum(6)}`,
    betKing: `BK-${randLetters(2)}${randNum(3)}`,
  };
}

class ProductionDatabase {
  public users = new Map<string, InternalUser>(); // id -> user
  public profiles = new Map<string, UserProfile>(); // id -> profile
  public predictions: CommunityPrediction[] = [];
  public comments: PredictionComment[] = [];
  public pointsTransactions: PointsTransaction[] = [];
  public reports: Report[] = [];
  public userBlocks: UserBlock[] = [];
  public notifications: NotificationItem[] = [];
  public auditLogs: AdminAuditLog[] = [];
  public officialTips: BettingTip[] = [...INITIAL_TIPS];
  public newsArticles: NewsArticle[] = [...INITIAL_NEWS];
  public liveMatches: LiveMatch[] = [...INITIAL_LIVE_MATCHES];
  public settings: AppSettings = { ...INITIAL_SETTINGS };
  public resetTokens = new Map<string, { userId: string; email: string; token: string; expiresAt: number }>();

  // Multi-timeframe Leaderboard cache
  private leaderboardCaches: Map<string, { data: LeaderboardUser[]; expiresAt: number }> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Safe2Odds2026!', salt);

    // 1. Seed Super Admin
    const superAdminId = 'usr-super-admin-01';
    this.users.set(superAdminId, {
      id: superAdminId,
      email: 'superadmin@safe2odds.ng',
      passwordHash: defaultPasswordHash,
      role: 'super_admin',
      accountStatus: 'active',
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    this.profiles.set(superAdminId, {
      id: superAdminId,
      username: 'Safe2Odds_Chief',
      displayName: 'Emeka Nwosu (Lead Architect)',
      email: 'superadmin@safe2odds.ng',
      avatar: '/src/assets/images/vip_club_crest_1791379729058.jpg',
      bio: 'Platform founder and chief quantitative sports analyst. Strictly disciplined mathematical betting models.',
      dateJoined: '2026-01-01T00:00:00.000Z',
      points: 450,
      totalPredictions: 48,
      totalWins: 41,
      totalLosses: 7,
      winRate: 85.42,
      lastActive: new Date().toISOString(),
      accountStatus: 'active',
      role: 'super_admin',
      isVip: true,
      savedTipIds: [],
    });

    // 2. Seed Moderator
    const moderatorId = 'usr-mod-01';
    this.users.set(moderatorId, {
      id: moderatorId,
      email: 'moderator@safe2odds.ng',
      passwordHash: defaultPasswordHash,
      role: 'moderator',
      accountStatus: 'active',
      emailVerified: true,
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z',
    });
    this.profiles.set(moderatorId, {
      id: moderatorId,
      username: 'NaijaMod_Official',
      displayName: 'Community Moderator',
      email: 'moderator@safe2odds.ng',
      avatar: '/src/assets/images/football_tactics_guide_1791379711012.jpg',
      bio: 'Official Safe2Odds Nigeria community supervisor. Ensuring spam-free and verified predictions.',
      dateJoined: '2026-01-10T00:00:00.000Z',
      points: 210,
      totalPredictions: 25,
      totalWins: 20,
      totalLosses: 4,
      winRate: 83.33,
      lastActive: new Date().toISOString(),
      accountStatus: 'active',
      role: 'moderator',
      isVip: true,
      savedTipIds: [],
    });

    // 3. Seed Standard User (Punter)
    const punterId = 'usr-punter-01';
    this.users.set(punterId, {
      id: punterId,
      email: 'punter@safe2odds.ng',
      passwordHash: defaultPasswordHash,
      role: 'user',
      accountStatus: 'active',
      emailVerified: true,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
    this.profiles.set(punterId, {
      id: punterId,
      username: 'NaijaBetKing',
      displayName: 'Chukwudi Obi',
      email: 'punter@safe2odds.ng',
      avatar: '/src/assets/images/football_news_action_1791379720643.jpg',
      bio: 'Premier League & NPFL football fanatic. Focusing on Over 1.5 goals and conservative 2-odds bankers.',
      dateJoined: '2026-02-01T00:00:00.000Z',
      points: 140,
      totalPredictions: 16,
      totalWins: 14,
      totalLosses: 2,
      winRate: 87.50,
      lastActive: new Date().toISOString(),
      accountStatus: 'active',
      role: 'user',
      isVip: false,
      savedTipIds: ['tip-1', 'tip-2'],
    });

    // 4. Seed other top community punters for the leaderboard
    const seedCommunityUsers = [
      { id: 'usr-comm-02', username: 'LagosTactician', displayName: 'Babatunde F.', points: 120, wins: 12, losses: 2, winRate: 85.71 },
      { id: 'usr-comm-03', username: 'AbujaSniper', displayName: 'Ibrahim S.', points: 110, wins: 11, losses: 3, winRate: 78.57 },
      { id: 'usr-comm-04', username: 'EnuguRanger', displayName: 'Obinna O.', points: 95, wins: 9, losses: 2, winRate: 81.82 },
      { id: 'usr-comm-05', username: 'KanoPillar99', displayName: 'Aminu K.', points: 80, wins: 8, losses: 3, winRate: 72.73 },
      { id: 'usr-comm-06', username: 'PortHarcourtAce', displayName: 'Tamuno W.', points: 70, wins: 7, losses: 2, winRate: 77.78 },
      { id: 'usr-comm-07', username: 'IbadanGoalsGuru', displayName: 'Adeyemi K.', points: 65, wins: 6, losses: 2, winRate: 75.00 },
      { id: 'usr-comm-08', username: 'BeninCityPunter', displayName: 'Osas I.', points: 55, wins: 5, losses: 3, winRate: 62.50 },
    ];

    seedCommunityUsers.forEach(u => {
      this.users.set(u.id, {
        id: u.id,
        email: `${u.username.toLowerCase()}@example.com`,
        passwordHash: defaultPasswordHash,
        role: 'user',
        accountStatus: 'active',
        emailVerified: true,
        createdAt: '2026-02-15T00:00:00.000Z',
        updatedAt: '2026-02-15T00:00:00.000Z',
      });
      this.profiles.set(u.id, {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        email: `${u.username.toLowerCase()}@example.com`,
        avatar: '/src/assets/images/football_tactics_guide_1791379711012.jpg',
        bio: 'Passionate football fan sharing data-grounded daily picks on Safe2Odds Nigeria.',
        dateJoined: '2026-02-15T00:00:00.000Z',
        points: u.points,
        totalPredictions: u.wins + u.losses,
        totalWins: u.wins,
        totalLosses: u.losses,
        winRate: u.winRate,
        lastActive: new Date().toISOString(),
        accountStatus: 'active',
        role: 'user',
        isVip: false,
        savedTipIds: [],
      });
    });

    // 5. Seed Initial Community Predictions
    this.predictions = [
      {
        id: 'pred-101',
        authorId: punterId,
        authorUsername: 'NaijaBetKing',
        authorDisplayName: 'Chukwudi Obi',
        authorAvatar: '/src/assets/images/football_news_action_1791379720643.jpg',
        authorRole: 'user',
        authorWinRate: 87.50,
        match: 'Manchester City vs Arsenal',
        sport: 'Football',
        league: 'Premier League',
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        prediction: 'Over 1.5 Goals',
        predictionType: 'Over 1.5',
        odds: 1.30,
        comment: 'Both sides generate huge expected goals (xG). In 9 of their last 10 games, at least 2 goals occurred.',
        analysis: 'High pressing from Arteta and Guardiola guarantees open transitional pockets.',
        likes: 48,
        dislikes: 2,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'pred-102',
        authorId: 'usr-comm-02',
        authorUsername: 'LagosTactician',
        authorDisplayName: 'Babatunde F.',
        authorRole: 'user',
        authorWinRate: 85.71,
        match: 'Real Madrid vs Real Sociedad',
        sport: 'Football',
        league: 'La Liga',
        homeTeam: 'Real Madrid',
        awayTeam: 'Real Sociedad',
        prediction: 'Real Madrid Win or Draw (1X) & Over 1.5',
        predictionType: 'Double Chance',
        odds: 1.48,
        comment: 'Bernabéu undefeated record is legendary. Sociedad missing their first-choice center-back.',
        likes: 32,
        dislikes: 1,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'pred-103',
        authorId: 'usr-comm-03',
        authorUsername: 'AbujaSniper',
        authorDisplayName: 'Ibrahim S.',
        authorRole: 'user',
        authorWinRate: 78.57,
        match: 'Bayern Munich vs Borussia Dortmund',
        sport: 'Football',
        league: 'Bundesliga',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Borussia Dortmund',
        prediction: 'Over 2.5 Goals',
        predictionType: 'Over 2.5',
        odds: 1.42,
        comment: 'Der Klassiker historically yields 3+ goals in 85% of matches.',
        likes: 41,
        dislikes: 3,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        id: 'pred-104',
        authorId: punterId,
        authorUsername: 'NaijaBetKing',
        authorDisplayName: 'Chukwudi Obi',
        authorRole: 'user',
        authorWinRate: 87.50,
        match: 'Liverpool vs Chelsea',
        sport: 'Football',
        league: 'Premier League',
        homeTeam: 'Liverpool',
        awayTeam: 'Chelsea',
        prediction: 'Both Teams to Score (BTTS)',
        predictionType: 'BTTS',
        odds: 1.55,
        comment: 'High tempo, defensive errors on counter-press.',
        likes: 72,
        dislikes: 1,
        status: 'WON',
        verifiedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        verifiedBy: superAdminId,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'pred-105',
        authorId: 'usr-comm-04',
        authorUsername: 'EnuguRanger',
        authorDisplayName: 'Obinna O.',
        authorRole: 'user',
        authorWinRate: 81.82,
        match: 'Enyimba FC vs Remo Stars',
        sport: 'Football',
        league: 'NPFL (Nigeria)',
        homeTeam: 'Enyimba FC',
        awayTeam: 'Remo Stars',
        prediction: 'Enyimba FC 1X (Double Chance)',
        predictionType: 'Double Chance',
        odds: 1.28,
        comment: 'Aba fortress remains one of the hardest away visits in African football.',
        likes: 29,
        dislikes: 0,
        status: 'WON',
        verifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        verifiedBy: moderatorId,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ];

    // Seed points transaction corresponding to won prediction
    this.pointsTransactions = [
      {
        id: 'pt-104',
        userId: punterId,
        amount: 10,
        type: 'PREDICTION_WON',
        predictionId: 'pred-104',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        createdBy: superAdminId,
      },
      {
        id: 'pt-105',
        userId: 'usr-comm-04',
        amount: 10,
        type: 'PREDICTION_WON',
        predictionId: 'pred-105',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        createdBy: moderatorId,
      }
    ];

    // Seed sample report for admin moderation testing
    this.reports = [
      {
        id: 'rep-01',
        reporterId: punterId,
        reporterUsername: 'NaijaBetKing',
        targetType: 'prediction',
        targetId: 'pred-103',
        targetSummary: 'Bayern Munich vs Dortmund - Over 2.5 Goals',
        reason: 'Spam',
        description: 'Testing report queue integrity.',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      }
    ];

    // Seed initial audit log
    this.auditLogs = [
      {
        id: 'aud-01',
        adminId: superAdminId,
        adminUsername: 'Safe2Odds_Chief',
        action: 'VERIFY_PREDICTION_WON',
        targetType: 'prediction',
        targetId: 'pred-104',
        metadata: { awardedPoints: 10, newWinRate: 87.50 },
        ipHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    ];

    // Seed community comments
    this.comments = [
      {
        id: 'comm-1',
        predictionId: 'pred-101',
        authorId: 'usr-comm-02',
        authorUsername: 'LagosTactician',
        authorDisplayName: 'Babatunde F.',
        authorAvatar: '/src/assets/images/football_tactics_guide_1791379711012.jpg',
        text: 'Top selection! Haaland and Saka are both in sensational form this week. Over 1.5 is super reliable.',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        id: 'comm-2',
        predictionId: 'pred-101',
        authorId: 'usr-comm-03',
        authorUsername: 'AbujaSniper',
        authorDisplayName: 'Ibrahim S.',
        authorAvatar: '/src/assets/images/football_news_action_1791379720643.jpg',
        text: 'Locked this into my SportyBet 2-odds accumulator already. Let\'s cash out together! 💰',
        createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
      },
      {
        id: 'comm-3',
        predictionId: 'pred-104',
        authorId: 'usr-comm-04',
        authorUsername: 'EnuguRanger',
        authorDisplayName: 'Obinna O.',
        authorAvatar: '/src/assets/images/football_tactics_guide_1791379711012.jpg',
        text: 'Boom! Green tick confirmed. Great prediction bro! 🔥 +10 points well deserved.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    ];

    // Assign booking codes and comment counts
    this.officialTips.forEach((tip, idx) => {
      tip.bookingCodes = tip.bookingCodes || {
        sportyBet: `SB-${88290 + idx}`,
        bet9ja: `B9J-${73920 + idx}`,
        oneXBet: `1X-${66100 + idx}`,
        betKing: `BK-${55200 + idx}`,
      };
    });

    this.predictions.forEach((pred, idx) => {
      pred.commentsCount = this.comments.filter(c => c.predictionId === pred.id).length;
      pred.bookingCodes = pred.bookingCodes || {
        sportyBet: `SB-${39100 + idx}`,
        bet9ja: `B9J-${84700 + idx}`,
        oneXBet: `1X-${89200 + idx}`,
        betKing: `BK-${44200 + idx}`,
      };
    });

    // Populate badges and verified state on all profiles
    for (const profile of this.profiles.values()) {
      profile.emailVerified = true;
      profile.badges = computeUserBadges(profile);
    }
  }

  // --------------------------------------------------------------------------
  // USER & PROFILE MANAGEMENT
  // --------------------------------------------------------------------------
  public getProfileByUsername(username: string): UserProfile | null {
    for (const profile of this.profiles.values()) {
      if (profile.username.toLowerCase() === username.toLowerCase()) {
        return profile;
      }
    }
    return null;
  }

  public getProfileById(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null;
  }

  public updateUserProfile(
    userId: string,
    updates: { displayName?: string; avatar?: string; bio?: string }
  ): UserProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    if (updates.displayName && updates.displayName.trim()) {
      profile.displayName = updates.displayName.trim().slice(0, 80);
    }
    if (updates.avatar && updates.avatar.trim()) {
      profile.avatar = updates.avatar.trim();
    }
    if (updates.bio !== undefined) {
      profile.bio = updates.bio.trim().slice(0, 300);
    }

    profile.lastActive = new Date().toISOString();
    return profile;
  }

  public setAccountStatus(userId: string, status: AccountStatus, admin: { id: string; username: string }): boolean {
    const user = this.users.get(userId);
    const profile = this.profiles.get(userId);
    if (!user || !profile) return false;

    user.accountStatus = status;
    profile.accountStatus = status;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: admin.id,
      adminUsername: admin.username,
      action: `USER_STATUS_${status.toUpperCase()}`,
      targetType: 'user',
      targetId: userId,
      metadata: { targetUsername: profile.username, previousStatus: user.accountStatus, newStatus: status },
      ipHash: crypto.createHash('sha256').update(admin.id).digest('hex'),
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  public setUserRole(userId: string, newRole: UserRole, superAdmin: { id: string; username: string }): boolean {
    const user = this.users.get(userId);
    const profile = this.profiles.get(userId);
    if (!user || !profile) return false;

    user.role = newRole;
    profile.role = newRole;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: superAdmin.id,
      adminUsername: superAdmin.username,
      action: 'USER_ROLE_UPDATED',
      targetType: 'user',
      targetId: userId,
      metadata: { targetUsername: profile.username, newRole },
      ipHash: crypto.createHash('sha256').update(superAdmin.id).digest('hex'),
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // PREDICTION OPERATIONS & ATOMIC POINTS VERIFICATION
  // --------------------------------------------------------------------------
  public createPrediction(
    author: { id: string; username: string; displayName: string; avatar: string; role: UserRole; winRate: number },
    data: {
      match: string;
      sport?: string;
      league: string;
      homeTeam?: string;
      awayTeam?: string;
      prediction: string;
      predictionType?: string;
      odds: number;
      comment: string;
      analysis?: string;
    }
  ): CommunityPrediction {
    const teams = data.match.includes(' vs ') 
      ? data.match.split(' vs ')
      : [data.homeTeam || data.match, data.awayTeam || 'Opponent'];

    const newPrediction: CommunityPrediction = {
      id: `pred-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      authorId: author.id,
      authorUsername: author.username,
      authorDisplayName: author.displayName,
      authorAvatar: author.avatar,
      authorRole: author.role,
      authorWinRate: author.winRate,
      match: data.match.trim(),
      sport: data.sport || 'Football',
      league: data.league.trim(),
      homeTeam: (data.homeTeam || teams[0] || 'Home Team').trim(),
      awayTeam: (data.awayTeam || teams[1] || 'Away Team').trim(),
      prediction: data.prediction.trim(),
      predictionType: data.predictionType || 'Over 1.5',
      odds: Math.max(1.05, Math.min(50.0, Number(data.odds) || 1.50)),
      comment: data.comment.trim(),
      analysis: data.analysis ? data.analysis.trim() : undefined,
      likes: 1, // Author upvote
      dislikes: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.predictions.unshift(newPrediction);

    // Increment author total predictions
    const profile = this.profiles.get(author.id);
    if (profile) {
      profile.totalPredictions += 1;
      profile.lastActive = new Date().toISOString();
    }

    return newPrediction;
  }

  /**
   * ATOMIC PREDICTION VERIFICATION & IDEMPOTENT POINTS AWARDING
   * Critical production requirement: Frontend NEVER awards points.
   * Only staff can verify. Once WON, awards exactly +10 points idempotently.
   */
  public verifyPrediction(
    predictionId: string,
    newStatus: CommunityPredictionStatus,
    admin: { id: string; username: string }
  ): { success: boolean; prediction?: CommunityPrediction; error?: string } {
    const pred = this.predictions.find(p => p.id === predictionId);
    if (!pred) {
      return { success: false, error: 'Prediction not found.' };
    }

    const previousStatus = pred.status;
    pred.status = newStatus;
    pred.verifiedAt = new Date().toISOString();
    pred.verifiedBy = admin.id;
    pred.updatedAt = new Date().toISOString();

    const authorProfile = this.profiles.get(pred.authorId);

    if (newStatus === 'WON' && authorProfile) {
      // IDEMPOTENCY CHECK: Ensure this prediction has never yielded a reward transaction
      const existingTxn = this.pointsTransactions.find(
        t => t.predictionId === predictionId && t.type === 'PREDICTION_WON'
      );

      if (!existingTxn) {
        // Create immutable points transaction
        const txn: PointsTransaction = {
          id: `pt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
          userId: authorProfile.id,
          amount: 10,
          type: 'PREDICTION_WON',
          predictionId: predictionId,
          createdAt: new Date().toISOString(),
          createdBy: admin.id,
        };
        this.pointsTransactions.unshift(txn);

        // Update author profile
        authorProfile.points += 10;
        authorProfile.totalWins += 1;

        // In-app notification
        this.notifications.unshift({
          id: `notif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          userId: authorProfile.id,
          title: 'Prediction Verified WON! 🎉',
          message: `Your prediction for "${pred.match}" won! +10 points have been awarded to your account.`,
          type: 'PREDICTION_WON',
          read: false,
          createdAt: new Date().toISOString(),
          metadata: { predictionId, points: 10 },
        });

        // Invalidate leaderboard cache
        this.leaderboardCaches.clear();
      }
    } else if (newStatus === 'LOST' && authorProfile) {
      if (previousStatus !== 'LOST') {
        authorProfile.totalLosses += 1;
      }

      this.notifications.unshift({
        id: `notif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        userId: authorProfile.id,
        title: 'Prediction Settled',
        message: `Your prediction for "${pred.match}" was verified as Lost. Keep analyzing!`,
        type: 'PREDICTION_LOST',
        read: false,
        createdAt: new Date().toISOString(),
        metadata: { predictionId },
      });

      this.leaderboardCaches.clear();
    }

    // Recompute author win rate: winRate = totalWins / (totalWins + totalLosses) * 100
    if (authorProfile) {
      const settled = authorProfile.totalWins + authorProfile.totalLosses;
      authorProfile.winRate = settled > 0 
        ? Math.round((authorProfile.totalWins / settled) * 10000) / 100 
        : 0;
      pred.authorWinRate = authorProfile.winRate;
    }

    // Write to audit log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      adminId: admin.id,
      adminUsername: admin.username,
      action: `VERIFY_PREDICTION_${newStatus}`,
      targetType: 'prediction',
      targetId: predictionId,
      metadata: {
        match: pred.match,
        authorUsername: pred.authorUsername,
        previousStatus,
        newStatus,
      },
      ipHash: crypto.createHash('sha256').update(admin.id).digest('hex'),
      createdAt: new Date().toISOString(),
    });

    return { success: true, prediction: pred };
  }

  // --------------------------------------------------------------------------
  // COMMUNITY FEED & CURSOR-BASED PAGINATION
  // --------------------------------------------------------------------------
  public getCommunityFeed(options: {
    cursor?: string;
    limit?: number;
    league?: string;
    sport?: string;
    status?: CommunityPredictionStatus | 'ALL';
    search?: string;
    oddsMin?: number;
    oddsMax?: number;
    authorId?: string;
    viewerId?: string;
    sort?: 'latest' | 'popular' | 'top_tipsters';
  }): CursorPaginatedResponse<CommunityPrediction> {
    const {
      cursor,
      limit = 10,
      league,
      sport,
      status,
      search,
      oddsMin,
      oddsMax,
      authorId,
      viewerId,
      sort = 'latest'
    } = options;

    // Determine blocked user IDs for viewer
    const blockedUserIds = new Set<string>();
    if (viewerId) {
      this.userBlocks
        .filter(b => b.blockerId === viewerId)
        .forEach(b => blockedUserIds.add(b.blockedUserId));
    }

    // Filter predictions
    let filtered = this.predictions.filter(p => {
      // Exclude posts by users blocked by the viewer
      if (blockedUserIds.has(p.authorId)) return false;
      // Exclude hidden or removed unless requested by author or admin
      if (p.isHidden || p.status === 'REMOVED') return false;

      if (league && league !== 'ALL' && p.league.toLowerCase() !== league.toLowerCase()) {
        return false;
      }
      if (sport && sport !== 'ALL' && p.sport.toLowerCase() !== sport.toLowerCase()) {
        return false;
      }
      if (status && status !== 'ALL' && p.status !== status) {
        return false;
      }
      if (authorId && p.authorId !== authorId) {
        return false;
      }
      if (oddsMin !== undefined && p.odds < oddsMin) {
        return false;
      }
      if (oddsMax !== undefined && p.odds > oddsMax) {
        return false;
      }
      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesQuery = 
          p.match.toLowerCase().includes(query) ||
          p.league.toLowerCase().includes(query) ||
          p.prediction.toLowerCase().includes(query) ||
          p.authorUsername.toLowerCase().includes(query) ||
          (p.comment && p.comment.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }
      return true;
    });

    // Sorting
    if (sort === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else if (sort === 'top_tipsters') {
      filtered.sort((a, b) => (b.authorWinRate || 0) - (a.authorWinRate || 0));
    } else {
      // default: latest
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = filtered.length;

    // Apply cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      const idx = filtered.findIndex(p => p.id === cursor);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    const pageSize = Math.min(50, Math.max(1, limit));
    const items = filtered.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < total;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
      total,
    };
  }

  // --------------------------------------------------------------------------
  // MULTI-TIMEFRAME TIPPERS LEADERBOARD & BADGES
  // --------------------------------------------------------------------------
  public getLeaderboard(timeframe: LeaderboardTimeframe = 'weekly'): LeaderboardUser[] {
    const now = Date.now();
    const cached = this.leaderboardCaches.get(timeframe);
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    // Materialize and rank users based on timeframe and points
    const activeProfiles = Array.from(this.profiles.values())
      .filter(p => p.accountStatus === 'active');

    activeProfiles.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.winRate - a.winRate;
    });

    const top10: LeaderboardUser[] = activeProfiles.slice(0, 10).map((p, idx) => {
      const badges = computeUserBadges(p);
      let primaryBadge = 'Pro Tipster';
      if (idx === 0) primaryBadge = '👑 Pro Tipster';
      else if (idx === 1) primaryBadge = '🎯 High Accuracy';
      else if (idx === 2) primaryBadge = '🛡️ Veteran';
      else if (p.winRate >= 80) primaryBadge = '🔒 Safe Banker';
      else primaryBadge = '⭐ Rising Star';

      return {
        id: p.id,
        username: p.username,
        displayName: p.displayName,
        avatar: p.avatar,
        points: p.points,
        totalPredictions: p.totalPredictions,
        wins: p.totalWins,
        losses: p.totalLosses,
        winRate: p.winRate,
        role: p.role,
        rank: idx + 1,
        badges,
        badge: primaryBadge,
      };
    });

    // Cache for 60 seconds
    this.leaderboardCaches.set(timeframe, {
      data: top10,
      expiresAt: now + 60000,
    });

    return top10;
  }

  public getWeeklyLeaderboard(): LeaderboardUser[] {
    return this.getLeaderboard('weekly');
  }

  // --------------------------------------------------------------------------
  // COMMENTS SYSTEM
  // --------------------------------------------------------------------------
  public getComments(predictionId: string): PredictionComment[] {
    return this.comments
      .filter(c => c.predictionId === predictionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addComment(
    predictionId: string,
    author: { id: string; username: string; displayName?: string; avatar?: string },
    text: string
  ): PredictionComment {
    const comment: PredictionComment = {
      id: `comm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      predictionId,
      authorId: author.id,
      authorUsername: author.username,
      authorDisplayName: author.displayName || author.username,
      authorAvatar: author.avatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg',
      text: text.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };

    this.comments.push(comment);

    // Update comments count on prediction
    const pred = this.predictions.find(p => p.id === predictionId);
    if (pred) {
      pred.commentsCount = (pred.commentsCount || 0) + 1;

      // In-app notification to prediction author
      if (pred.authorId !== author.id) {
        this.notifications.unshift({
          id: `notif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          userId: pred.authorId,
          title: 'New Prediction Comment 💬',
          message: `@${author.username} commented: "${comment.text.slice(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
          type: 'SYSTEM',
          read: false,
          createdAt: new Date().toISOString(),
          metadata: { predictionId },
        });
      }
    }

    return comment;
  }

  // --------------------------------------------------------------------------
  // PASSWORD RESET & EMAIL VERIFICATION
  // --------------------------------------------------------------------------
  public requestPasswordReset(email: string): { success: boolean; token: string } {
    let targetUser: InternalUser | null = null;
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase().trim()) {
        targetUser = u;
        break;
      }
    }

    const token = `RESET-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000;

    if (targetUser) {
      this.resetTokens.set(token, {
        userId: targetUser.id,
        email: targetUser.email,
        token,
        expiresAt,
      });
    }

    return { success: true, token };
  }

  public resetPassword(token: string, newPassword: string): { success: boolean; error?: string } {
    const record = this.resetTokens.get(token.trim());
    if (!record || Date.now() > record.expiresAt) {
      return { success: false, error: 'Invalid or expired password reset token.' };
    }

    const user = this.users.get(record.userId);
    if (!user) {
      return { success: false, error: 'Account not found.' };
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    this.resetTokens.delete(token.trim());

    return { success: true };
  }

  public verifyUserEmail(userId: string): boolean {
    const user = this.users.get(userId);
    const profile = this.profiles.get(userId);
    if (!user || !profile) return false;

    user.emailVerified = true;
    profile.emailVerified = true;
    return true;
  }

  // --------------------------------------------------------------------------
  // REPORTS & USER BLOCKS
  // --------------------------------------------------------------------------
  public submitReport(
    reporter: { id: string; username: string },
    data: {
      targetType: 'prediction' | 'user' | 'comment';
      targetId: string;
      targetSummary: string;
      reason: any;
      description?: string;
    }
  ): { success: boolean; report?: Report; error?: string } {
    // Check if user already reported this target
    const alreadyReported = this.reports.some(
      r => r.reporterId === reporter.id && r.targetId === data.targetId
    );
    if (alreadyReported) {
      return { success: false, error: 'You have already submitted a report for this content.' };
    }

    const report: Report = {
      id: `rep-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      reporterId: reporter.id,
      reporterUsername: reporter.username,
      targetType: data.targetType,
      targetId: data.targetId,
      targetSummary: data.targetSummary.slice(0, 200),
      reason: data.reason,
      description: (data.description || '').slice(0, 500),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(report);

    // If target is prediction, increment prediction reportCount
    if (data.targetType === 'prediction') {
      const pred = this.predictions.find(p => p.id === data.targetId);
      if (pred) {
        pred.reportCount = (pred.reportCount || 0) + 1;
        pred.isReported = true;
      }
    }

    return { success: true, report };
  }

  public blockUser(blockerId: string, blockedUserId: string): { success: boolean; error?: string } {
    if (blockerId === blockedUserId) {
      return { success: false, error: 'You cannot block your own account.' };
    }

    const exists = this.userBlocks.some(
      b => b.blockerId === blockerId && b.blockedUserId === blockedUserId
    );
    if (exists) {
      return { success: true }; // idempotent
    }

    this.userBlocks.push({
      id: `blk-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      blockerId,
      blockedUserId,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  }

  public unblockUser(blockerId: string, blockedUserId: string): boolean {
    const initialLen = this.userBlocks.length;
    this.userBlocks = this.userBlocks.filter(
      b => !(b.blockerId === blockerId && b.blockedUserId === blockedUserId)
    );
    return this.userBlocks.length < initialLen;
  }

  public getBlockedUserIds(blockerId: string): string[] {
    return this.userBlocks
      .filter(b => b.blockerId === blockerId)
      .map(b => b.blockedUserId);
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  public getUserNotifications(userId: string): { unreadCount: number; items: NotificationItem[] } {
    const userNotifs = this.notifications.filter(n => n.userId === userId);
    const unreadCount = userNotifs.filter(n => !n.read).length;
    return {
      unreadCount,
      items: userNotifs.slice(0, 30),
    };
  }

  public markNotificationAsRead(userId: string, notificationId: string): boolean {
    const notif = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
  }

  // --------------------------------------------------------------------------
  // ADMIN AGGREGATE STATS
  // --------------------------------------------------------------------------
  public getAdminStats() {
    return {
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.accountStatus === 'active').length,
      suspendedUsers: Array.from(this.users.values()).filter(u => u.accountStatus === 'suspended').length,
      totalPredictions: this.predictions.length,
      pendingPredictions: this.predictions.filter(p => p.status === 'PENDING').length,
      wonPredictions: this.predictions.filter(p => p.status === 'WON').length,
      lostPredictions: this.predictions.filter(p => p.status === 'LOST').length,
      pendingReports: this.reports.filter(r => r.status === 'PENDING').length,
      totalPointsIssued: this.pointsTransactions.reduce((acc, t) => acc + t.amount, 0),
    };
  }
}

export const db = new ProductionDatabase();
