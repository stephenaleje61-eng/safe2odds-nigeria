import { 
  BettingTip, 
  CommunityPrediction, 
  LeaderboardUser, 
  NewsArticle, 
  LiveMatch, 
  AppSettings,
  TipStatus,
  UserProfile
} from '../types';
import { 
  INITIAL_TIPS, 
  INITIAL_COMMUNITY_PREDICTIONS, 
  INITIAL_LEADERBOARD, 
  INITIAL_NEWS, 
  INITIAL_LIVE_MATCHES, 
  INITIAL_SETTINGS 
} from '../data/seedData';
import { containsProfanityOrSpam } from './profanityFilter';

const STORAGE_KEYS = {
  TIPS: 'safe2odds_tips_v1',
  COMMUNITY: 'safe2odds_community_v1',
  LEADERBOARD: 'safe2odds_leaderboard_v1',
  NEWS: 'safe2odds_news_v1',
  LIVE: 'safe2odds_live_v1',
  SETTINGS: 'safe2odds_settings_v1',
  USER: 'safe2odds_user_session_v1',
  LAST_COMMUNITY_POST_TIME: 'safe2odds_last_post_ts',
};

// Safe localStorage helper
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const StorageService = {
  // --- TIPS ---
  getTips(): BettingTip[] {
    const tips = getStored<BettingTip[]>(STORAGE_KEYS.TIPS, INITIAL_TIPS);
    if (!tips || tips.length === 0) {
      setStored(STORAGE_KEYS.TIPS, INITIAL_TIPS);
      return INITIAL_TIPS;
    }
    return tips;
  },

  saveTip(tipData: Omit<BettingTip, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string): BettingTip {
    const tips = this.getTips();
    const now = new Date().toISOString();

    if (existingId) {
      const index = tips.findIndex(t => t.id === existingId);
      if (index !== -1) {
        const updatedTip: BettingTip = {
          ...tips[index],
          ...tipData,
          updatedAt: now,
        };
        tips[index] = updatedTip;
        setStored(STORAGE_KEYS.TIPS, tips);
        return updatedTip;
      }
    }

    const newTip: BettingTip = {
      ...tipData,
      id: `tip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    tips.unshift(newTip);
    setStored(STORAGE_KEYS.TIPS, tips);
    return newTip;
  },

  updateTipStatus(tipId: string, status: TipStatus, resultScore?: string): boolean {
    const tips = this.getTips();
    const index = tips.findIndex(t => t.id === tipId);
    if (index === -1) return false;

    tips[index].status = status;
    if (resultScore !== undefined) {
      tips[index].resultScore = resultScore;
    }
    tips[index].updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.TIPS, tips);
    return true;
  },

  deleteTip(tipId: string): boolean {
    const tips = this.getTips();
    const filtered = tips.filter(t => t.id !== tipId);
    setStored(STORAGE_KEYS.TIPS, filtered);
    return true;
  },

  // --- AUTOMATED STATISTICS ---
  calculateStats(tipsList?: BettingTip[]) {
    const tips = tipsList || this.getTips();
    const total = tips.length;
    const won = tips.filter(t => t.status === 'Won').length;
    const lost = tips.filter(t => t.status === 'Lost').length;
    const pending = tips.filter(t => t.status === 'Pending').length;
    const voidCount = tips.filter(t => t.status === 'Void').length;

    const settled = won + lost;
    const winRate = settled > 0 ? Math.round((won / settled) * 100) : 0;

    let netProfitUnits = 0;
    tips.forEach(t => {
      if (t.status === 'Won') {
        netProfitUnits += (t.odds - 1);
      } else if (t.status === 'Lost') {
        netProfitUnits -= 1.0;
      }
    });

    const netOddsFormatted = (netProfitUnits >= 0 ? '+' : '') + netProfitUnits.toFixed(2);

    return {
      total,
      won,
      lost,
      pending,
      voidCount,
      settled,
      winRate,
      netProfitUnits: Number(netProfitUnits.toFixed(2)),
      netOddsFormatted: `${netOddsFormatted} Odds`,
    };
  },

  // --- COMMUNITY PREDICTIONS ---
  getCommunityPredictions(): CommunityPrediction[] {
    const items = getStored<CommunityPrediction[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_PREDICTIONS);
    if (!items || items.length === 0) {
      setStored(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_PREDICTIONS);
      return INITIAL_COMMUNITY_PREDICTIONS;
    }
    return items;
  },

  submitCommunityPrediction(prediction: {
    username: string;
    match: string;
    prediction: string;
    odds: number;
    comment: string;
  }): { success: boolean; error?: string; data?: CommunityPrediction } {
    const lastPostStr = localStorage.getItem(STORAGE_KEYS.LAST_COMMUNITY_POST_TIME);
    if (lastPostStr) {
      const elapsed = Date.now() - parseInt(lastPostStr, 10);
      const cooldownSec = 30;
      if (elapsed < cooldownSec * 1000) {
        const remaining = Math.ceil((cooldownSec * 1000 - elapsed) / 1000);
        return {
          success: false,
          error: `Cooldown active: Please wait ${remaining} seconds before submitting another prediction.`,
        };
      }
    }

    const fullTextToCheck = `${prediction.username} ${prediction.match} ${prediction.comment}`;
    const check = containsProfanityOrSpam(fullTextToCheck);
    if (check.isFlagged) {
      return {
        success: false,
        error: check.reason || 'Content rejected due to inappropriate language or spam.',
      };
    }

    if (!prediction.username.trim() || !prediction.match.trim() || !prediction.prediction.trim()) {
      return {
        success: false,
        error: 'Please complete all required fields.',
      };
    }

    const items = this.getCommunityPredictions();
    const newPrediction: CommunityPrediction = {
      id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      authorId: `usr-${Date.now()}`,
      authorUsername: prediction.username.trim(),
      username: prediction.username.trim(),
      match: prediction.match.trim(),
      sport: 'Football',
      league: 'Premier League',
      homeTeam: prediction.match.split(' vs ')[0] || prediction.match,
      awayTeam: prediction.match.split(' vs ')[1] || 'Opponent',
      prediction: prediction.prediction.trim(),
      predictionType: 'Over 1.5',
      odds: Number(prediction.odds) || 1.50,
      comment: prediction.comment.trim(),
      likes: 1,
      dislikes: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    items.unshift(newPrediction);
    setStored(STORAGE_KEYS.COMMUNITY, items);
    localStorage.setItem(STORAGE_KEYS.LAST_COMMUNITY_POST_TIME, Date.now().toString());

    this.addPointsToUser(prediction.username, 1, false);

    return { success: true, data: newPrediction };
  },

  voteCommunityPrediction(id: string, type: 'like' | 'dislike'): { success: boolean; likes: number; dislikes: number } {
    const items = this.getCommunityPredictions();
    const item = items.find(p => p.id === id);
    if (!item) return { success: false, likes: 0, dislikes: 0 };

    const votedKey = `safe2odds_voted_${id}`;
    const previousVote = localStorage.getItem(votedKey);

    if (previousVote === type) {
      if (type === 'like' && item.likes > 0) item.likes -= 1;
      if (type === 'dislike' && item.dislikes > 0) item.dislikes -= 1;
      localStorage.removeItem(votedKey);
    } else {
      if (previousVote === 'like' && item.likes > 0) item.likes -= 1;
      if (previousVote === 'dislike' && item.dislikes > 0) item.dislikes -= 1;

      if (type === 'like') {
        item.likes += 1;
        if (item.likes % 5 === 0) {
          this.addPointsToUser(item.authorUsername || item.username || 'Punter', 5, false);
        }
      } else {
        item.dislikes += 1;
      }
      localStorage.setItem(votedKey, type);
    }

    setStored(STORAGE_KEYS.COMMUNITY, items);
    return { success: true, likes: item.likes, dislikes: item.dislikes };
  },

  reportCommunityPrediction(id: string, reason: string): boolean {
    const items = this.getCommunityPredictions();
    const item = items.find(p => p.id === id);
    if (!item) return false;

    item.isReported = true;
    item.reportReason = reason || 'Flagged by community user';
    setStored(STORAGE_KEYS.COMMUNITY, items);
    return true;
  },

  toggleHideCommunityPrediction(id: string, hide?: boolean): boolean {
    const items = this.getCommunityPredictions();
    const item = items.find(p => p.id === id);
    if (!item) return false;

    item.isHidden = hide !== undefined ? hide : !item.isHidden;
    setStored(STORAGE_KEYS.COMMUNITY, items);
    return true;
  },

  deleteCommunityPrediction(id: string): boolean {
    const items = this.getCommunityPredictions();
    const filtered = items.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.COMMUNITY, filtered);
    return true;
  },

  settleCommunityPrediction(id: string, status: any): boolean {
    const items = this.getCommunityPredictions();
    const item = items.find(p => p.id === id);
    if (!item) return false;

    item.status = status;
    setStored(STORAGE_KEYS.COMMUNITY, items);

    if (status === 'Won' || status === 'WON') {
      this.addPointsToUser(item.authorUsername || item.username || 'Punter', 10, true);
    }

    return true;
  },

  // --- LEADERBOARD & POINTS ---
  getLeaderboard(): LeaderboardUser[] {
    const users = getStored<LeaderboardUser[]>(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
    return users.sort((a, b) => b.points - a.points);
  },

  addPointsToUser(username: string, pointsToAdd: number, isWin: boolean): void {
    const users = this.getLeaderboard();
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user) {
      user.points += pointsToAdd;
      if (isWin) {
        user.wins = (user.wins || user.correctPredictions || 0) + 1;
        user.correctPredictions = user.wins;
      }
      user.totalPredictions += 1;
      const winsCount = user.wins || 0;
      user.winRate = Math.round((winsCount / user.totalPredictions) * 100);
    } else {
      user = {
        id: `user-${Date.now()}`,
        username,
        points: pointsToAdd,
        wins: isWin ? 1 : 0,
        correctPredictions: isWin ? 1 : 0,
        totalPredictions: 1,
        winRate: isWin ? 100 : 0,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }

    setStored(STORAGE_KEYS.LEADERBOARD, users);
  },

  // --- NEWS ---
  getNews(): NewsArticle[] {
    const news = getStored<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    if (!news || news.length === 0) {
      setStored(STORAGE_KEYS.NEWS, INITIAL_NEWS);
      return INITIAL_NEWS;
    }
    return news;
  },

  saveNewsArticle(article: Omit<NewsArticle, 'id'>, existingId?: string): NewsArticle {
    const news = this.getNews();
    if (existingId) {
      const idx = news.findIndex(n => n.id === existingId);
      if (idx !== -1) {
        news[idx] = { ...article, id: existingId };
        setStored(STORAGE_KEYS.NEWS, news);
        return news[idx];
      }
    }

    const newArticle: NewsArticle = {
      ...article,
      id: `news-${Date.now()}`,
    };
    news.unshift(newArticle);
    setStored(STORAGE_KEYS.NEWS, news);
    return newArticle;
  },

  deleteNewsArticle(id: string): boolean {
    const news = this.getNews();
    const filtered = news.filter(n => n.id !== id);
    setStored(STORAGE_KEYS.NEWS, filtered);
    return true;
  },

  // --- LIVE MATCHES ---
  getLiveMatches(): LiveMatch[] {
    const matches = getStored<LiveMatch[]>(STORAGE_KEYS.LIVE, INITIAL_LIVE_MATCHES);
    return matches;
  },

  updateLiveScore(id: string, homeScore: number, awayScore: number, time?: string, status?: 'LIVE' | 'UPCOMING' | 'FINISHED'): void {
    const matches = this.getLiveMatches();
    const match = matches.find(m => m.id === id);
    if (match) {
      match.homeScore = homeScore;
      match.awayScore = awayScore;
      if (time) match.time = time;
      if (status) match.status = status;
      setStored(STORAGE_KEYS.LIVE, matches);
    }
  },

  // --- SETTINGS ---
  getSettings(): AppSettings {
    const settings = getStored<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...settings };
  },

  saveSettings(newSettings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --- USER ACCOUNT & SESSION ---
  getUserSession(): UserProfile | null {
    return getStored<UserProfile | null>(STORAGE_KEYS.USER, null);
  },

  setUserSession(user: UserProfile | null): void {
    setStored(STORAGE_KEYS.USER, user);
  },

  toggleBookmarkTip(tipId: string): string[] {
    const user = this.getUserSession() || {
      id: 'guest-' + Date.now(),
      username: 'Punter_' + Math.floor(1000 + Math.random() * 9000),
      displayName: 'Guest Punter',
      email: 'guest@safe2odds.ng',
      avatar: '/src/assets/images/vip_club_crest_1791379729058.jpg',
      bio: '',
      dateJoined: new Date().toISOString(),
      points: 15,
      totalPredictions: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      lastActive: new Date().toISOString(),
      accountStatus: 'active' as const,
      role: 'user' as const,
      isVip: false,
      emailVerified: true,
      savedTipIds: [] as string[],
    };

    const has = user.savedTipIds.includes(tipId);
    if (has) {
      user.savedTipIds = user.savedTipIds.filter((id: string) => id !== tipId);
    } else {
      user.savedTipIds.push(tipId);
    }

    this.setUserSession(user);
    return user.savedTipIds;
  },

  // --- BACKUP & MIGRATION EXPORT / IMPORT ---
  exportAllDataJson(): string {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      platform: 'Safe2Odds Nigeria',
      tips: this.getTips(),
      community: this.getCommunityPredictions(),
      leaderboard: this.getLeaderboard(),
      news: this.getNews(),
      settings: this.getSettings(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importDataJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tips)) {
        setStored(STORAGE_KEYS.TIPS, data.tips);
      }
      if (Array.isArray(data.community)) {
        setStored(STORAGE_KEYS.COMMUNITY, data.community);
      }
      if (Array.isArray(data.leaderboard)) {
        setStored(STORAGE_KEYS.LEADERBOARD, data.leaderboard);
      }
      if (Array.isArray(data.news)) {
        setStored(STORAGE_KEYS.NEWS, data.news);
      }
      if (data.settings && typeof data.settings === 'object') {
        setStored(STORAGE_KEYS.SETTINGS, data.settings);
      }
      return { success: true, message: 'All database records imported successfully!' };
    } catch (e: any) {
      return { success: false, message: 'Invalid JSON format: ' + e.message };
    }
  },

  resetToDefaults(): void {
    setStored(STORAGE_KEYS.TIPS, INITIAL_TIPS);
    setStored(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_PREDICTIONS);
    setStored(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
    setStored(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    setStored(STORAGE_KEYS.LIVE, INITIAL_LIVE_MATCHES);
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
};
