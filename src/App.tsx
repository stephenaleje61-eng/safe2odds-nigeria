import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BettingTip, 
  CommunityPrediction, 
  LeaderboardUser, 
  NewsArticle, 
  LiveMatch, 
  AppSettings,
  TipStatus,
  UserProfile,
  NotificationItem,
  ReportReason,
  LeaderboardTimeframe
} from './types';
import { ApiClient } from './services/apiClient';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroSection } from './components/HeroSection';
import { TipCard } from './components/TipCard';
import { ResultsTracker } from './components/ResultsTracker';
import { FansPredictionZone } from './components/FansPredictionZone';
import { LeaderboardSection } from './components/LeaderboardSection';
import { LiveScoresSection } from './components/LiveScoresSection';
import { BettingGuideSection } from './components/BettingGuideSection';
import { VipSection } from './components/VipSection';
import { NewsSection } from './components/NewsSection';
import { AdminDashboard } from './components/AdminDashboard';
import { UserAccountModal } from './components/UserAccountModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SlipAccumulatorBar } from './components/SlipAccumulatorBar';
import { AdBanner } from './components/AdBanner';
import { ResponsibleGamblingBanner } from './components/ResponsibleGamblingBanner';
import { Footer } from './components/Footer';
import { Toast, ToastMessage } from './components/Toast';
import { MessageCircle, Send, ArrowRight, Sparkles, Flame, ShieldAlert, Award, Radio } from 'lucide-react';
import { INITIAL_SETTINGS } from './data/seedData';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  
  // Data State
  const [tips, setTips] = useState<BettingTip[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<LeaderboardTimeframe>('weekly');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [liveMatchMeta, setLiveMatchMeta] = useState<{
    lastUpdated: string;
    total: number;
    liveCount: number;
    upcomingCount: number;
    finishedCount: number;
    isSyncing: boolean;
    error: string | null;
  }>({
    lastUpdated: '',
    total: 0,
    liveCount: 0,
    upcomingCount: 0,
    finishedCount: 0,
    isSyncing: false,
    error: null,
  });
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Community Feed State (Server-Side Paginated & Filtered)
  const [communityPredictions, setCommunityPredictions] = useState<CommunityPrediction[]>([]);
  const [feedTotal, setFeedTotal] = useState(0);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [hasMoreFeed, setHasMoreFeed] = useState(false);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('latest');

  // Interactive Accumulator Slip
  const [slipTips, setSlipTips] = useState<BettingTip[]>([]);

  // Modals & Toasts
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingUsername, setViewingUsername] = useState<string | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Current User & Notifications
  const loadUserSession = useCallback(async () => {
    const meRes = await ApiClient.getMe();
    if (meRes.success && meRes.data) {
      setCurrentUser(meRes.data);
      loadNotifications();
    } else {
      setCurrentUser(null);
    }
  }, []);

  const loadNotifications = async () => {
    const res = await ApiClient.getNotifications();
    if (res.success && res.data) {
      setNotifications(res.data.items);
      setUnreadCount(res.data.unreadCount);
    }
  };

  // Load Community Feed (Server-Side)
  const loadCommunityFeed = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMoreFeed(true);

    const res = await ApiClient.getCommunityFeed({
      cursor: isLoadMore ? feedCursor || undefined : undefined,
      limit: 10,
      league: selectedLeague,
      status: selectedStatus,
      search: searchQuery,
      sort: selectedSort,
    });

    if (isLoadMore) setLoadingMoreFeed(false);

    if (res.success && res.data) {
      if (isLoadMore) {
        setCommunityPredictions(prev => [...prev, ...res.data!.items]);
      } else {
        setCommunityPredictions(res.data.items);
      }
      setFeedTotal(res.data.total);
      setFeedCursor(res.data.nextCursor);
      setHasMoreFeed(res.data.hasMore);
    }
  }, [feedCursor, selectedLeague, selectedStatus, searchQuery, selectedSort]);

  // Dedicated Live Matches Fetch
  const loadLiveMatches = useCallback(async (quiet = false) => {
    if (!quiet) {
      setLiveMatchMeta(prev => ({ ...prev, isSyncing: true }));
    }
    const liveRes = await ApiClient.getLiveMatches();
    if (liveRes.success && liveRes.data) {
      setLiveMatches(liveRes.data.matches);
      setLiveMatchMeta({
        lastUpdated: liveRes.data.lastUpdated,
        total: liveRes.data.total,
        liveCount: liveRes.data.liveCount,
        upcomingCount: liveRes.data.upcomingCount,
        finishedCount: liveRes.data.finishedCount,
        isSyncing: false,
        error: liveRes.data.error,
      });
    } else {
      setLiveMatchMeta(prev => ({ ...prev, isSyncing: false, error: liveRes.error?.message || 'Sync issue' }));
    }
  }, []);

  // Load All Primary Data
  const loadAllData = useCallback(async () => {
    const [tipsRes, lbRes, newsRes, setRes] = await Promise.all([
      ApiClient.getOfficialTips(),
      ApiClient.getWeeklyLeaderboard(),
      ApiClient.getNews(),
      ApiClient.getSettings(),
    ]);

    if (tipsRes.success && tipsRes.data) setTips(tipsRes.data);
    if (lbRes.success && lbRes.data) setLeaderboard(lbRes.data);
    if (newsRes.success && newsRes.data) setNews(newsRes.data);
    if (setRes.success && setRes.data) setSettings(setRes.data);

    await loadLiveMatches(false);
    loadCommunityFeed(false);
  }, [loadCommunityFeed, loadLiveMatches]);

  const handleLeaderboardTimeframeChange = async (tf: LeaderboardTimeframe) => {
    setLeaderboardTimeframe(tf);
    const res = await ApiClient.getLeaderboard(tf);
    if (res.success && res.data) {
      setLeaderboard(res.data);
    }
  };

  useEffect(() => {
    loadUserSession();
    loadAllData();
  }, [loadUserSession, loadAllData]);

  // Automated background polling for real live scores every 25 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadLiveMatches(true);
    }, 25000);
    return () => clearInterval(interval);
  }, [loadLiveMatches]);

  // Reload feed whenever filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCommunityFeed(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedLeague, selectedStatus, selectedSort]);

  // Automated Statistics calculation from actual stored tips
  const calculatedStats = useMemo(() => {
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

    const netOddsFormatted = (netProfitUnits >= 0 ? '+' : '') + netProfitUnits.toFixed(2) + ' Odds';

    return {
      total,
      won,
      lost,
      pending,
      voidCount,
      settled,
      winRate,
      netProfitUnits: Number(netProfitUnits.toFixed(2)),
      netOddsFormatted,
    };
  }, [tips]);

  // Filtered views
  const todayFreeTips = useMemo(() => {
    return tips.filter(t => !t.isVip && (t.date.toLowerCase() === 'today' || t.status === 'Pending'));
  }, [tips]);

  const vipTips = useMemo(() => {
    return tips.filter(t => t.isVip);
  }, [tips]);

  const savedTipsList = useMemo(() => {
    if (!currentUser) return [];
    return tips.filter(t => currentUser.savedTipIds.includes(t.id));
  }, [tips, currentUser]);

  // Handlers for Tips
  const handleCopyTip = (tip: BettingTip) => {
    const textToCopy = `🔥 Safe2Odds Nigeria Tip: ${tip.homeTeam} vs ${tip.awayTeam} (${tip.league})\nPrediction: ${tip.predictionDetail || tip.prediction} @ ${tip.odds.toFixed(2)}\nAnalysis: ${tip.analysis}\n🌐 Safe2Odds Nigeria: https://safe2odds.ng`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    showToast(`«Tip copied successfully!»: ${tip.homeTeam} vs ${tip.awayTeam} (${tip.predictionDetail || tip.prediction} @ ${tip.odds.toFixed(2)})`);
  };

  const handleShareTip = (tip: BettingTip, platform: 'whatsapp' | 'twitter' | 'facebook' | 'copy') => {
    const message = `🔥 Safe2Odds Tip\n⚽ Match: ${tip.homeTeam} vs ${tip.awayTeam}\n🎯 Prediction: ${tip.predictionDetail || tip.prediction}\n📊 Odds: ${tip.odds.toFixed(2)}\n\nView the full tip on Safe2Odds Nigeria.`;
    const shareUrl = 'https://safe2odds.ng';

    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${message}\n${shareUrl}`)}`;
      window.open(url, '_blank');
      showToast('WhatsApp sharing initiated.');
    } else if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank');
    } else if (platform === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${message}\n${shareUrl}`).catch(() => {});
      }
      showToast('Share link copied to clipboard!');
    }
  };

  const handleToggleBookmark = (tipId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const has = currentUser.savedTipIds.includes(tipId);
    const updatedIds = has 
      ? currentUser.savedTipIds.filter(id => id !== tipId)
      : [...currentUser.savedTipIds, tipId];
    
    setCurrentUser({ ...currentUser, savedTipIds: updatedIds });
    showToast(has ? 'Tip removed from bookmarks.' : 'Tip saved to bookmarks!', 'info');
  };

  const handleToggleSlip = (tip: BettingTip) => {
    setSlipTips(prev => {
      const exists = prev.some(t => t.id === tip.id);
      if (exists) {
        showToast(`Removed from 2-Odds slip: ${tip.homeTeam}`, 'info');
        return prev.filter(t => t.id !== tip.id);
      } else {
        showToast(`Added to 2-Odds slip: ${tip.homeTeam} (@${tip.odds.toFixed(2)})`, 'success');
        return [...prev, tip];
      }
    });
  };

  // Community Interactions
  const handleSubmitPrediction = async (data: any) => {
    const res = await ApiClient.submitPrediction(data);
    if (res.success) {
      loadCommunityFeed(false);
      showToast('Tip published to community feed! Pending staff verification for +10 points.');
    }
    return res;
  };

  const handleVoteCommunity = async (id: string, type: 'like' | 'dislike') => {
    const res = await ApiClient.votePrediction(id, type);
    if (res.success && res.data) {
      setCommunityPredictions(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, likes: res.data!.likes, dislikes: res.data!.dislikes };
        }
        return p;
      }));
      showToast(type === 'like' ? 'Upvoted prediction 👍' : 'Feedback recorded', 'info');
    }
  };

  const handleReportCommunity = async (data: { targetId: string; targetSummary: string; reason: ReportReason; description: string }) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const res = await ApiClient.submitReport({
      targetType: 'prediction',
      targetId: data.targetId,
      targetSummary: data.targetSummary,
      reason: data.reason,
      description: data.description,
    });
    if (res.success) {
      showToast('Report submitted. Our moderation team will investigate.', 'info');
    } else {
      showToast(res.error || 'Report submission failed.', 'error');
    }
  };

  const handleBlockUser = async (authorId: string, authorUsername: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const res = await ApiClient.blockUser(authorId);
    if (res.success) {
      loadCommunityFeed(false);
      showToast(`User @${authorUsername} blocked. Their predictions have been hidden from your feed.`, 'info');
    }
  };

  const handleCopyCommunityPrediction = (pred: CommunityPrediction) => {
    const text = `🔥 Safe2Odds Community Tip: ${pred.match}\n🎯 Pick: ${pred.prediction} @ ${pred.odds.toFixed(2)}\n👤 By: @${pred.authorUsername}\n🌐 https://safe2odds.ng`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast('«Tip copied successfully!»');
  };

  const handleShareWhatsAppCommunity = (pred: CommunityPrediction) => {
    const msg = `🔥 Safe2Odds Tip\n⚽ Match: ${pred.match}\n🎯 Prediction: ${pred.prediction}\n📊 Odds: ${pred.odds.toFixed(2)}\n\nView the full tip on Safe2Odds Nigeria.\nhttps://safe2odds.ng`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    showToast('WhatsApp sharing initiated.');
  };

  const handleOpenProfile = (username?: string) => {
    setViewingUsername(username || currentUser?.username);
    setProfileModalOpen(true);
  };

  // Official Tip CRUD (Admin)
  const handleSaveOfficialTip = async (tipData: any, id?: string) => {
    const res = await ApiClient.saveOfficialTip(tipData, id);
    if (res.success) {
      const refreshed = await ApiClient.getOfficialTips();
      if (refreshed.success && refreshed.data) setTips(refreshed.data);
      showToast(id ? 'Official tip updated.' : 'New official tip published!');
    }
  };

  const handleDeleteOfficialTip = async (id: string) => {
    const res = await ApiClient.deleteOfficialTip(id);
    if (res.success) {
      setTips(prev => prev.filter(t => t.id !== id));
      showToast('Official tip deleted.', 'info');
    }
  };

  const handleSaveNews = async (article: any, id?: string) => {
    showToast('News article published.', 'success');
  };

  const handleDeleteNews = async (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    showToast('Article deleted.', 'info');
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await ApiClient.updateSettings(newSettings);
    if (res.success && res.data) {
      setSettings(res.data);
      showToast('Platform settings saved successfully.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#111827]">
      
      {/* Top Affiliate Ad Banner */}
      <AdBanner location="top" settings={settings} />

      {/* Primary Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        settings={settings}
        onOpenAdmin={() => setCurrentTab('admin')}
        onOpenUserModal={() => setAuthModalOpen(true)}
        onOpenProfile={handleOpenProfile}
        currentUser={currentUser}
        notifications={notifications}
        unreadCount={unreadCount}
        onRefreshNotifications={loadNotifications}
      />

      {/* Responsible Betting Disclaimer Bar */}
      <ResponsibleGamblingBanner text={settings.disclaimer} />

      {/* Main Page Body */}
      <main className="flex-1">
        {/* TAB 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-10 sm:space-y-12">
            
            {/* Hero Section */}
            <HeroSection
              settings={settings}
              todayTips={tips}
              stats={calculatedStats}
              onViewTips={() => {
                const el = document.getElementById('todays-tips-feed');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setCurrentTab('tips');
              }}
              onJoinWhatsApp={() => showToast('Redirecting to official WhatsApp group...')}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
              
              {/* In-feed Ad Banner */}
              <AdBanner location="in-feed" settings={settings} />

              {/* TODAY'S TIPS FEED */}
              <section id="todays-tips-feed" className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-green-100 text-green-700 rounded-lg">
                        <Flame className="w-5 h-5 fill-current" />
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        Today's Free Football Tips
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Target: {settings.targetOdds} Odds · Conservative selections backed by statistical form and head-to-head analysis.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentTab('results')}
                      className="text-xs font-bold text-gray-600 hover:text-green-700 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
                    >
                      Results Tracker ({calculatedStats.winRate}% Win Rate)
                    </button>
                    <button
                      onClick={() => setCurrentTab('vip')}
                      className="text-xs font-extrabold text-amber-900 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> VIP Tips
                    </button>
                  </div>
                </div>

                {todayFreeTips.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">
                      Today's matches are being processed by the quantitative modeling team. Check back shortly!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {todayFreeTips.map(tip => (
                      <TipCard
                        key={tip.id}
                        tip={tip}
                        onCopyTip={handleCopyTip}
                        onShareTip={handleShareTip}
                        isBookmarked={Boolean(currentUser?.savedTipIds.includes(tip.id))}
                        onToggleBookmark={handleToggleBookmark}
                        isInSlip={slipTips.some(t => t.id === tip.id)}
                        onToggleSlip={handleToggleSlip}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* LIVE MATCH CENTER PREVIEW (REAL TIME) */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-red-100 text-red-700 rounded-lg">
                        <Radio className="w-4 h-4" />
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-gray-900">
                        Real-Time Match Center
                      </h3>
                      {liveMatchMeta.liveCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          {liveMatchMeta.liveCount} LIVE NOW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Verified live scores, match minutes, events, and results directly from official sports data feeds.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentTab('livescores')}
                      className="text-xs font-bold text-green-700 hover:text-green-800 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Full Match Center ({liveMatchMeta.total} Matches)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <LiveScoresSection
                  matches={liveMatches.slice(0, 8)}
                  lastUpdated={liveMatchMeta.lastUpdated}
                  totalMatches={liveMatchMeta.total}
                  liveCount={liveMatchMeta.liveCount}
                  upcomingCount={liveMatchMeta.upcomingCount}
                  finishedCount={liveMatchMeta.finishedCount}
                  isSyncing={liveMatchMeta.isSyncing}
                  syncError={liveMatchMeta.error}
                  onRefresh={async () => {
                    await loadLiveMatches(false);
                    showToast('Synchronized with official real-time sports feed.', 'info');
                  }}
                />
              </section>

              {/* RESULTS TRACKER SUMMARY SECTION */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900">
                      Automated Results Tracker
                    </h3>
                    <p className="text-xs text-gray-500">
                      Zero fake claims. Dynamically calculated from our actual match picks stored in the database.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('results')}
                    className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
                  >
                    <span>Full Results History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ResultsTracker allTips={tips} />
              </section>

              {/* FANS PREDICTION ZONE & COMMUNITY (Cursor-Paginated Feed) */}
              <section className="space-y-4 pt-4 border-t border-gray-200">
                <FansPredictionZone
                  predictions={communityPredictions}
                  totalPredictions={feedTotal}
                  hasMore={hasMoreFeed}
                  loadingMore={loadingMoreFeed}
                  onLoadMore={() => loadCommunityFeed(true)}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedLeague={selectedLeague}
                  onLeagueChange={setSelectedLeague}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedSort={selectedSort}
                  onSortChange={setSelectedSort}
                  onSubmitPrediction={handleSubmitPrediction}
                  onVote={handleVoteCommunity}
                  onReport={handleReportCommunity}
                  onBlockUser={handleBlockUser}
                  onSelectAuthor={handleOpenProfile}
                  onCopyPrediction={handleCopyCommunityPrediction}
                  onShareWhatsApp={handleShareWhatsAppCommunity}
                  isAuthenticated={Boolean(currentUser)}
                  onOpenLogin={() => setAuthModalOpen(true)}
                />
              </section>

              {/* WEEKLY TOP 10 TIPPERS LEADERBOARD */}
              <section className="space-y-4">
                <LeaderboardSection
                  users={leaderboard}
                  currentTimeframe={leaderboardTimeframe}
                  onTimeframeChange={handleLeaderboardTimeframeChange}
                  onSelectUser={handleOpenProfile}
                />
              </section>

              {/* WHATSAPP & TELEGRAM COMMUNITY CTA BANNER */}
              <section className="rounded-3xl bg-gradient-to-r from-[#111827] via-emerald-950 to-[#111827] text-white p-6 sm:p-10 border border-green-800/40 shadow-xl relative overflow-hidden">
                <div className="max-w-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-400 bg-green-950/80 border border-green-800 px-2.5 py-1 rounded-md inline-block mb-3">
                    Fast Community Updates
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                    Want faster tips and lively match discussions?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
                    Join over 15,000 Nigerian punters receiving early team lineups, odds drift alerts, and daily safe banker slips directly on WhatsApp and Telegram.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={settings.whatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Join WhatsApp Group</span>
                    </a>

                    <a
                      href={settings.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>Join Telegram Channel</span>
                    </a>
                  </div>
                </div>
              </section>

              {/* FOOTBALL NEWS PREVIEWS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900">
                      Football Analysis & Tactical Insights
                    </h3>
                    <p className="text-xs text-gray-500">
                      Deep dives into expected goals, NPFL trends, and smart betting strategy.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('news')}
                    className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
                  >
                    <span>View All Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <NewsSection articles={news} />
              </section>

            </div>
          </div>
        )}

        {/* TAB 2: TODAY'S TIPS PAGE */}
        {currentTab === 'tips' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Today's Football Betting Tips
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Target odds: {settings.targetOdds} · Select tips to build your accumulator slip below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('vip')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View VIP Banker Slips</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {todayFreeTips.map(tip => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  onCopyTip={handleCopyTip}
                  onShareTip={handleShareTip}
                  isBookmarked={Boolean(currentUser?.savedTipIds.includes(tip.id))}
                  onToggleBookmark={handleToggleBookmark}
                  isInSlip={slipTips.some(t => t.id === tip.id)}
                  onToggleSlip={handleToggleSlip}
                />
              ))}
            </div>

            <AdBanner location="in-feed" settings={settings} />
          </div>
        )}

        {/* TAB 3: RESULTS PAGE */}
        {currentTab === 'results' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                Betting Results & Performance Tracker
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Transparent match-by-match settlement with automatically calculated win rates, total odds profit, and verified history.
              </p>
            </div>

            <ResultsTracker allTips={tips} />
          </div>
        )}

        {/* TAB 4: LIVE SCORES PAGE */}
        {currentTab === 'livescores' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <LiveScoresSection
              matches={liveMatches}
              lastUpdated={liveMatchMeta.lastUpdated}
              totalMatches={liveMatchMeta.total}
              liveCount={liveMatchMeta.liveCount}
              upcomingCount={liveMatchMeta.upcomingCount}
              finishedCount={liveMatchMeta.finishedCount}
              isSyncing={liveMatchMeta.isSyncing}
              syncError={liveMatchMeta.error}
              onRefresh={async () => {
                await loadLiveMatches(false);
                showToast('Synchronized with official real-time sports feed.', 'info');
              }}
            />
          </div>
        )}

        {/* TAB 5: BETTING GUIDE PAGE */}
        {currentTab === 'guide' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <BettingGuideSection />
          </div>
        )}

        {/* TAB 6: COMMUNITY PAGE */}
        {currentTab === 'community' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <FansPredictionZone
              predictions={communityPredictions}
              totalPredictions={feedTotal}
              hasMore={hasMoreFeed}
              loadingMore={loadingMoreFeed}
              onLoadMore={() => loadCommunityFeed(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              onSubmitPrediction={handleSubmitPrediction}
              onVote={handleVoteCommunity}
              onReport={handleReportCommunity}
              onBlockUser={handleBlockUser}
              onSelectAuthor={handleOpenProfile}
              onCopyPrediction={handleCopyCommunityPrediction}
              onShareWhatsApp={handleShareWhatsAppCommunity}
              isAuthenticated={Boolean(currentUser)}
              onOpenLogin={() => setAuthModalOpen(true)}
            />

            <LeaderboardSection
              users={leaderboard}
              currentTimeframe={leaderboardTimeframe}
              onTimeframeChange={handleLeaderboardTimeframeChange}
              onSelectUser={handleOpenProfile}
            />
          </div>
        )}

        {/* TAB 7: VIP PAGE */}
        {currentTab === 'vip' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <VipSection
              vipTips={vipTips}
              settings={settings}
              userSession={currentUser}
              onCopyTip={handleCopyTip}
              onShareTip={handleShareTip}
              onUpgradeToVip={() => {
                if (currentUser) {
                  setCurrentUser({ ...currentUser, isVip: true });
                }
                showToast('👑 VIP membership activated on your profile!');
              }}
            />
          </div>
        )}

        {/* TAB 8: NEWS PAGE */}
        {currentTab === 'news' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <NewsSection articles={news} />
          </div>
        )}

        {/* TAB 9: ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard
              currentUser={currentUser}
              onOpenLogin={() => setAuthModalOpen(true)}
              onCloseAdmin={() => setCurrentTab('home')}
              officialTips={tips}
              news={news}
              settings={settings}
              onSaveOfficialTip={handleSaveOfficialTip}
              onDeleteOfficialTip={handleDeleteOfficialTip}
              onSaveNews={handleSaveNews}
              onDeleteNews={handleDeleteNews}
              onSaveSettings={handleSaveSettings}
              onRefreshAllData={loadAllData}
            />
          </div>
        )}

      </main>

      {/* Floating Accumulator Slip Bar */}
      <SlipAccumulatorBar
        slipTips={slipTips}
        onRemoveTip={id => setSlipTips(prev => prev.filter(t => t.id !== id))}
        onClearSlip={() => {
          setSlipTips([]);
          showToast('Slip cleared', 'info');
        }}
        onCopySlip={text => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {});
          }
          showToast('Accumulator slip copied to clipboard!');
        }}
      />

      {/* User Login/Register Modal */}
      <UserAccountModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={user => {
          setCurrentUser(user);
          loadNotifications();
          showToast(`Welcome back, ${user.displayName || user.username}!`, 'success');
        }}
        onLogout={async () => {
          await ApiClient.logout();
          setCurrentUser(null);
          showToast('You have signed out.', 'info');
        }}
        savedTips={savedTipsList}
      />

      {/* User Public Profile Modal with Prediction History */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        targetUsername={viewingUsername}
        currentUser={currentUser}
        onUserBlocked={userId => {
          loadCommunityFeed(false);
          setProfileModalOpen(false);
        }}
        onProfileUpdated={updated => {
          setCurrentUser(updated);
          showToast('Profile bio and display name updated successfully.');
        }}
      />

      {/* Floating Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Footer */}
      <Footer
        settings={settings}
        onSelectTab={setCurrentTab}
        onOpenAdmin={() => setCurrentTab('admin')}
      />

    </div>
  );
}
