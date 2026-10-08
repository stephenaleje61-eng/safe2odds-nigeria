import { 
  UserProfile, 
  CommunityPrediction, 
  CommunityPredictionStatus,
  LeaderboardUser, 
  Report, 
  NotificationItem, 
  AdminAuditLog, 
  BettingTip, 
  NewsArticle, 
  LiveMatch, 
  AppSettings,
  CursorPaginatedResponse,
  UserRole,
  PredictionComment,
  LeaderboardTimeframe,
  BettingTipBookingCodes,
  ChatMessage
} from '../types';

const TOKEN_KEY = 'safe2odds_jwt_session';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted iframes
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (json.success) {
      return { success: true, data: json.data };
    } else {
      return { success: false, error: json.error?.message || 'Operation failed' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network communication error' };
  }
}

export const ApiClient = {
  // --- AUTH ---
  async register(
    email: string, 
    password: string, 
    username: string, 
    displayName?: string, 
    country?: string, 
    countryCode?: string, 
    countryFlag?: string
  ) {
    const res = await request<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName, country, countryCode, countryFlag }),
    });
    if (res.success && res.data) {
      setStoredAuthToken(res.data.token);
    }
    return res;
  },

  async login(email: string, password: string) {
    const res = await request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data) {
      setStoredAuthToken(res.data.token);
    }
    return res;
  },

  async loginWithGoogle(email: string, displayName?: string) {
    const res = await request<{ token: string; user: UserProfile }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, displayName }),
    });
    if (res.success && res.data) {
      setStoredAuthToken(res.data.token);
    }
    return res;
  },

  async getMe() {
    return request<UserProfile>('/api/auth/me');
  },

  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
    setStoredAuthToken(null);
  },

  async requestPasswordReset(email: string) {
    return request<{ message: string; token: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async verifyEmail() {
    return request<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
    });
  },

  // --- PROFILES ---
  async getProfile(username: string) {
    return request<UserProfile>(`/api/profiles/${encodeURIComponent(username)}`);
  },

  async updateMyProfile(updates: { displayName?: string; avatar?: string; bio?: string }) {
    return request<UserProfile>('/api/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async blockUser(userId: string) {
    return request<{ message: string }>(`/api/users/${userId}/block`, { method: 'POST' });
  },

  async unblockUser(userId: string) {
    return request<{ message: string }>(`/api/users/${userId}/block`, { method: 'DELETE' });
  },

  async getBlockedUsers() {
    return request<string[]>('/api/users/me/blocks');
  },

  async getUserPredictions(userId: string, status?: string, cursor?: string, limit = 10) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());
    return request<CursorPaginatedResponse<CommunityPrediction>>(`/api/users/${userId}/predictions?${params}`);
  },

  // --- COMMUNITY FEED ---
  async getCommunityFeed(options: {
    cursor?: string;
    limit?: number;
    league?: string;
    sport?: string;
    status?: string;
    search?: string;
    oddsMin?: number;
    oddsMax?: number;
    sort?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (options.cursor) params.set('cursor', options.cursor);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.league) params.set('league', options.league);
    if (options.sport) params.set('sport', options.sport);
    if (options.status) params.set('status', options.status);
    if (options.search) params.set('search', options.search);
    if (options.oddsMin) params.set('oddsMin', options.oddsMin.toString());
    if (options.oddsMax) params.set('oddsMax', options.oddsMax.toString());
    if (options.sort) params.set('sort', options.sort);

    return request<CursorPaginatedResponse<CommunityPrediction>>(`/api/community/feed?${params}`);
  },

  async submitPrediction(data: {
    match: string;
    league: string;
    sport?: string;
    prediction: string;
    predictionType?: string;
    odds: number;
    comment: string;
    analysis?: string;
  }) {
    return request<CommunityPrediction>('/api/community/predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async votePrediction(id: string, type: 'like' | 'dislike') {
    return request<{ likes: number; dislikes: number }>(`/api/predictions/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  async getPredictionComments(predictionId: string) {
    return request<PredictionComment[]>(`/api/predictions/${predictionId}/comments`);
  },

  async addPredictionComment(predictionId: string, text: string) {
    return request<PredictionComment>(`/api/predictions/${predictionId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // --- LEADERBOARD ---
  async getLeaderboard(timeframe: LeaderboardTimeframe = 'weekly') {
    return request<LeaderboardUser[]>(`/api/leaderboard?timeframe=${timeframe}`);
  },

  async getWeeklyLeaderboard() {
    return this.getLeaderboard('weekly');
  },

  // --- BOOKING CODES ---
  async generateBookingCodes() {
    return request<BettingTipBookingCodes>('/api/booking-codes/generate', { method: 'POST' });
  },

  // --- REPORTS ---
  async submitReport(data: {
    targetType: 'prediction' | 'user' | 'comment';
    targetId: string;
    targetSummary: string;
    reason: string;
    description?: string;
  }) {
    return request<Report>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    return request<{ unreadCount: number; items: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return request<{ read: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead() {
    return request<{ message: string }>('/api/notifications/mark-all-read', { method: 'POST' });
  },

  // --- REAL-TIME PUBLIC CHAT ROOM ---
  async getChatMessages(limit = 60, beforeId?: string) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (beforeId) params.set('beforeId', beforeId);
    return request<{ messages: ChatMessage[]; total: number }>(`/api/chat/messages?${params}`);
  },

  async sendChatMessage(text: string, replyToId?: string) {
    return request<ChatMessage>('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ text, replyToId }),
    });
  },

  async likeChatMessage(messageId: string) {
    return request<{ likes: number; isLiked: boolean }>(`/api/chat/messages/${messageId}/like`, {
      method: 'POST',
    });
  },

  // --- ADMIN MODERATION ---
  async getAdminStats() {
    return request<any>('/api/admin/stats');
  },

  async verifyPrediction(id: string, status: CommunityPredictionStatus) {
    return request<CommunityPrediction>(`/api/admin/predictions/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminReports() {
    return request<Report[]>('/api/admin/reports');
  },

  async resolveReport(id: string, action: 'RESOLVED' | 'DISMISSED') {
    return request<Report>(`/api/admin/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async suspendUser(userId: string, suspend: boolean) {
    return request<{ status: string }>(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ suspend }),
    });
  },

  async setUserRole(userId: string, role: UserRole) {
    return request<{ role: string }>(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  async getAdminAuditLogs() {
    return request<AdminAuditLog[]>('/api/admin/audit-logs');
  },

  // --- OFFICIAL TIPS, NEWS, SETTINGS ---
  async getOfficialTips() {
    return request<BettingTip[]>('/api/tips');
  },

  async saveOfficialTip(tipData: any, id?: string) {
    if (id) {
      return request<BettingTip>(`/api/tips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tipData),
      });
    } else {
      return request<BettingTip>('/api/tips', {
        method: 'POST',
        body: JSON.stringify(tipData),
      });
    }
  },

  async deleteOfficialTip(id: string) {
    return request<{ message: string }>(`/api/tips/${id}`, { method: 'DELETE' });
  },

  async getNews() {
    return request<NewsArticle[]>('/api/news');
  },

  async getLiveMatches(params?: { status?: string; league?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.league) query.set('league', params.league);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<{
      matches: LiveMatch[];
      lastUpdated: string;
      total: number;
      liveCount: number;
      upcomingCount: number;
      finishedCount: number;
      isSyncing: boolean;
      error: string | null;
    }>(`/api/live${qs ? `?${qs}` : ''}`);
  },

  async getLiveMatchDetails(id: string) {
    return request<LiveMatch>(`/api/live/${id}`);
  },

  async syncLiveMatches() {
    return request<{ success: boolean; matchCount: number; error?: string }>('/api/live/sync', {
      method: 'POST',
    });
  },

  async getSettings() {
    return request<AppSettings>('/api/settings');
  },

  async updateSettings(settings: Partial<AppSettings>) {
    return request<AppSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
};
