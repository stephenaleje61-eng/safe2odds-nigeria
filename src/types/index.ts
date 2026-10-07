export type TipStatus = 'Pending' | 'Won' | 'Lost' | 'Void';

export type PredictionMarket = 
  | 'Over 1.5'
  | 'Over 2.5'
  | 'Under 2.5'
  | 'BTTS'
  | 'Double Chance'
  | 'Home Win'
  | 'Away Win'
  | 'Draw'
  | 'Other';

export interface BettingTipBookingCodes {
  sportyBet?: string;
  bet9ja?: string;
  oneXBet?: string;
  betKing?: string;
}

export interface BettingTip {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  prediction: PredictionMarket | string;
  predictionDetail?: string;
  odds: number;
  analysis: string;
  status: TipStatus;
  resultScore?: string;
  isVip?: boolean;
  bookingCodes?: BettingTipBookingCodes;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';
export type AccountStatus = 'active' | 'suspended' | 'banned';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  dateJoined: string;
  points: number;
  totalPredictions: number;
  totalWins: number;
  totalLosses: number;
  winRate: number; // Won / (Won + Lost) * 100
  lastActive: string;
  accountStatus: AccountStatus;
  role: UserRole;
  isVip: boolean;
  emailVerified?: boolean;
  badges?: string[];
  savedTipIds: string[];
}

export type UserAccount = UserProfile;

export type CommunityPredictionStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID' | 'REMOVED' | 'Pending' | 'Won' | 'Lost' | 'Void';

export interface PredictionComment {
  id: string;
  predictionId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CommunityPrediction {
  id: string;
  authorId: string;
  authorUsername: string;
  username?: string; // backwards compatibility
  authorDisplayName?: string;
  authorAvatar?: string;
  authorRole?: UserRole;
  authorWinRate?: number;
  match: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  predictionType: PredictionMarket | string;
  odds: number;
  comment: string;
  analysis?: string;
  eventDateTime?: string;
  likes: number;
  dislikes: number;
  status: CommunityPredictionStatus;
  commentsCount?: number;
  bookingCodes?: BettingTipBookingCodes;
  isReported?: boolean;
  reportCount?: number;
  reportReason?: string;
  isHidden?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'PREDICTION_WON' | 'ADMIN_ADJUSTMENT' | 'WEEKLY_PRIZE';
  predictionId?: string;
  createdAt: string;
  createdBy: string;
}

export type ReportReason = 
  | 'Spam' 
  | 'Scam' 
  | 'Offensive content' 
  | 'Misleading content' 
  | 'Abuse' 
  | 'Illegal content' 
  | 'Other';

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'prediction' | 'user' | 'comment';
  targetId: string;
  targetSummary: string;
  reason: ReportReason;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'PREDICTION_WON' | 'PREDICTION_LOST' | 'POINTS_AWARDED' | 'REPORT_REVIEWED' | 'ACCOUNT_NOTICE' | 'SYSTEM';
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, any>;
  createdAt: string;
  ipHash: string;
}

export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardUser {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  points: number;
  totalPredictions: number;
  wins?: number;
  correctPredictions?: number;
  losses?: number;
  winRate: number;
  badge?: string;
  badges?: string[];
  role?: UserRole;
  rank?: number;
  createdAt?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: string;
  author: string;
  readTime: string;
}

export interface LiveMatchEvent {
  id?: string;
  minute: string;
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'penalty' | 'var' | 'other';
  team: 'home' | 'away';
  player: string;
  detail?: string;
  scoreAfter?: string;
}

export interface MatchTeamStats {
  possession?: string;
  shots?: string;
  shotsOnTarget?: string;
  fouls?: string;
  corners?: string;
  yellowCards?: string;
  redCards?: string;
  offsides?: string;
  saves?: string;
  passes?: string;
  passAccuracy?: string;
}

export interface MatchPlayerLineup {
  name: string;
  jersey?: string;
  position?: string;
  isStarter: boolean;
}

export interface MatchLineups {
  homeTeam: {
    formation?: string;
    starters: MatchPlayerLineup[];
    bench: MatchPlayerLineup[];
  };
  awayTeam: {
    formation?: string;
    starters: MatchPlayerLineup[];
    bench: MatchPlayerLineup[];
  };
}

export interface LiveMatch {
  id: string;
  league: string;
  country: string;
  leagueLogo?: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  statusDetail?: string; // e.g. "74'", "HT", "FT", "Postponed", "Kickoff in 2h"
  time: string; // Scheduled display time or clock
  startTimeIso: string;
  minute?: number;
  events?: LiveMatchEvent[];
  stats?: {
    home: MatchTeamStats;
    away: MatchTeamStats;
  };
  lineups?: MatchLineups;
  venue?: string;
  dataSource: string; // "ESPN Live Sports Wire", "Verified Official API Feed"
  lastUpdated: string; // ISO timestamp
}

export interface AppSettings {
  websiteName: string;
  tagline: string;
  targetOdds: number;
  whatsAppLink: string;
  telegramLink: string;
  affiliateLink: string;
  affiliateBannerText: string;
  affiliateTitle: string;
  adSenseSlotHtml: string;
  contactEmail: string;
  twitterLink: string;
  facebookLink: string;
  vipPriceWeekly: string;
  vipPriceMonthly: string;
  disclaimer: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}
