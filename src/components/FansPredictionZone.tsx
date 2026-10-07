import React, { useState } from 'react';
import { 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Flag, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Search,
  Filter,
  Ban,
  Copy,
  Check,
  ChevronDown,
  User,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { CommunityPrediction, ReportReason, PredictionComment } from '../types';
import { ApiClient } from '../services/apiClient';

interface FansPredictionZoneProps {
  predictions: CommunityPrediction[];
  totalPredictions: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onSubmitPrediction: (data: {
    match: string;
    league: string;
    sport?: string;
    prediction: string;
    predictionType?: string;
    odds: number;
    comment: string;
    analysis?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onVote: (id: string, type: 'like' | 'dislike') => void;
  onReport: (data: { targetId: string; targetSummary: string; reason: ReportReason; description: string }) => Promise<void>;
  onBlockUser: (authorId: string, authorUsername: string) => void;
  onSelectAuthor: (username: string) => void;
  onCopyPrediction: (pred: CommunityPrediction) => void;
  onShareWhatsApp: (pred: CommunityPrediction) => void;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
}

export const FansPredictionZone: React.FC<FansPredictionZoneProps> = ({
  predictions,
  totalPredictions,
  hasMore,
  loadingMore,
  onLoadMore,
  searchQuery,
  onSearchChange,
  selectedLeague,
  onLeagueChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  onSubmitPrediction,
  onVote,
  onReport,
  onBlockUser,
  onSelectAuthor,
  onCopyPrediction,
  onShareWhatsApp,
  isAuthenticated,
  onOpenLogin,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [match, setMatch] = useState('');
  const [league, setLeague] = useState('Premier League');
  const [prediction, setPrediction] = useState('');
  const [odds, setOdds] = useState('1.60');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments state
  const [expandedCommentsPredId, setExpandedCommentsPredId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PredictionComment[]>>({});
  const [loadingCommentsId, setLoadingCommentsId] = useState<string | null>(null);
  const [newCommentInput, setNewCommentInput] = useState<Record<string, string>>({});
  const [postingCommentId, setPostingCommentId] = useState<string | null>(null);
  const [copiedCodeName, setCopiedCodeName] = useState<string | null>(null);

  // Report modal state
  const [reportingPred, setReportingPred] = useState<CommunityPrediction | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>('Spam');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleCopyBookingCode = (bookmaker: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCodeName(bookmaker);
    setTimeout(() => setCopiedCodeName(null), 2000);
  };

  const handleToggleComments = async (predictionId: string) => {
    if (expandedCommentsPredId === predictionId) {
      setExpandedCommentsPredId(null);
      return;
    }
    setExpandedCommentsPredId(predictionId);
    if (!commentsMap[predictionId]) {
      setLoadingCommentsId(predictionId);
      const res = await ApiClient.getPredictionComments(predictionId);
      setLoadingCommentsId(null);
      if (res.success && res.data) {
        setCommentsMap(prev => ({ ...prev, [predictionId]: res.data! }));
      }
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent, predictionId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }
    const text = (newCommentInput[predictionId] || '').trim();
    if (!text) return;

    setPostingCommentId(predictionId);
    const res = await ApiClient.addPredictionComment(predictionId, text);
    setPostingCommentId(null);
    if (res.success && res.data) {
      setCommentsMap(prev => ({
        ...prev,
        [predictionId]: [...(prev[predictionId] || []), res.data!],
      }));
      setNewCommentInput(prev => ({ ...prev, [predictionId]: '' }));
    } else {
      alert(res.error || 'Failed to post comment.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }

    setErrorMsg('');
    if (!match.trim() || !prediction.trim()) {
      setErrorMsg('Please specify match and prediction.');
      return;
    }

    setSubmitting(true);
    const res = await onSubmitPrediction({
      match: match.trim(),
      league: league.trim(),
      sport: 'Football',
      prediction: prediction.trim(),
      odds: parseFloat(odds) || 1.60,
      comment: comment.trim(),
    });
    setSubmitting(false);

    if (res.success) {
      setMatch('');
      setPrediction('');
      setComment('');
      setShowForm(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit prediction.');
    }
  };

  const handleConfirmReport = async () => {
    if (!reportingPred) return;
    setSubmittingReport(true);
    await onReport({
      targetId: reportingPred.id,
      targetSummary: `${reportingPred.match} (${reportingPred.prediction}) by @${reportingPred.authorUsername}`,
      reason: reportReason,
      description: reportDescription,
    });
    setSubmittingReport(false);
    setReportingPred(null);
    setReportDescription('');
  };

  const reportReasons: ReportReason[] = [
    'Spam',
    'Scam',
    'Offensive content',
    'Misleading content',
    'Abuse',
    'Illegal content',
    'Other'
  ];

  return (
    <div className="space-y-6">
      
      {/* Zone Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827]">
              Fans Prediction Zone
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Post football predictions, earn +10 points when verified WON, and climb the weekly leaderboard!
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              onOpenLogin();
            } else {
              setShowForm(!showForm);
            }
          }}
          className="inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Submit Prediction (+10 Pts on Win)'}</span>
        </button>
      </div>

      {/* Creation Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-green-50/60 via-white to-gray-50 p-5 sm:p-6 rounded-3xl border-2 border-green-500/40 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" /> Share Match Prediction
            </h3>
            <span className="text-[11px] text-gray-500">Atomic server-verified points</span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Match Fixture *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arsenal vs Chelsea"
                  value={match}
                  onChange={e => setMatch(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  League / Competition *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premier League, NPFL"
                  value={league}
                  onChange={e => setLeague(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Prediction *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Over 1.5 Goals, BTTS"
                  value={prediction}
                  onChange={e => setPrediction(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Decimal Odds *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.05"
                  max="50.0"
                  placeholder="1.60"
                  value={odds}
                  onChange={e => setOdds(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-hidden focus:border-green-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Short Analysis / Reasoning (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Share your statistical reasoning (e.g. expected goals, injuries, recent form)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-500">
                Anti-spam protected. Scam/fixed-match solicitations are strictly prohibited.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Verifying...' : 'Publish to Feed'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Server-Side Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team, league, prediction, or @username..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-green-600 focus:bg-white"
            />
          </div>

          {/* League Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedLeague}
              onChange={e => onLeagueChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-green-600"
            >
              <option value="ALL">All Leagues</option>
              <option value="Premier League">Premier League</option>
              <option value="La Liga">La Liga</option>
              <option value="NPFL (Nigeria)">NPFL (Nigeria)</option>
              <option value="Serie A">Serie A</option>
              <option value="Bundesliga">Bundesliga</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={e => onStatusChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-green-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Active (Pending)</option>
              <option value="WON">Verified WON</option>
              <option value="LOST">Settled Lost</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedSort}
              onChange={e => onSortChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-green-600"
            >
              <option value="latest">Latest First</option>
              <option value="popular">Most Liked</option>
              <option value="top_tipsters">Top Tipsters</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
          <span>Showing {predictions.length} of {totalPredictions} community predictions</span>
          <span>Indexed server-side queries</span>
        </div>
      </div>

      {/* Predictions Feed */}
      <div className="space-y-3">
        {predictions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">
              No community predictions matched your search or filter.
            </p>
          </div>
        ) : (
          predictions.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                item.status === 'WON' 
                  ? 'border-emerald-300 bg-emerald-50/15' 
                  : item.isReported 
                  ? 'border-amber-300/80 bg-amber-50/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Post Header: Author info, Win rate, and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div 
                  onClick={() => onSelectAuthor(item.authorUsername)}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                    <img
                      src={item.authorAvatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg'}
                      alt={item.authorUsername}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-[#111827] group-hover:text-green-700 transition-colors">
                        {item.authorDisplayName || item.authorUsername}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">@{item.authorUsername}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                      {item.authorWinRate !== undefined && (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {item.authorWinRate.toFixed(1)}% Win Rate
                        </span>
                      )}
                      <span>·</span>
                      <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {item.status === 'WON' && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WON (+10 Pts Awarded)
                    </span>
                  )}
                  {item.status === 'LOST' && (
                    <span className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300/80 px-2.5 py-0.5 rounded-md">
                      LOST
                    </span>
                  )}
                  {item.status === 'PENDING' && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Verification
                    </span>
                  )}
                </div>
              </div>

              {/* Match Details & Selection */}
              <div className="my-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="font-bold text-green-700">{item.league}</span>
                  <span>·</span>
                  <span>{item.sport}</span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-gray-900">
                  {item.match}
                </h4>

                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="text-xs font-bold text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-xl">
                    {item.prediction}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-gray-800 tabular-nums bg-gray-100 px-2.5 py-1 rounded-xl">
                    @{item.odds.toFixed(2)}
                  </span>
                </div>

                {item.comment && (
                  <p className="text-xs sm:text-sm text-gray-700 mt-2.5 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    "{item.comment}"
                  </p>
                )}

                {/* Nigerian Booking Codes for Community Tip */}
                {item.bookingCodes && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] mb-1 text-gray-600">
                      <span className="font-bold flex items-center gap-1">🇳🇬 Booking Codes:</span>
                      <span className="text-[10px] text-gray-400">
                        {copiedCodeName ? `✓ Copied ${copiedCodeName} code!` : 'Click to copy'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {item.bookingCodes.sportyBet && (
                        <button
                          type="button"
                          onClick={() => handleCopyBookingCode('SportyBet', item.bookingCodes!.sportyBet!)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200/70 rounded-lg text-[10px] flex items-center justify-between transition-colors"
                        >
                          <span className="font-bold text-red-700">SportyBet</span>
                          <span className="font-mono font-bold">{item.bookingCodes.sportyBet}</span>
                        </button>
                      )}
                      {item.bookingCodes.bet9ja && (
                        <button
                          type="button"
                          onClick={() => handleCopyBookingCode('Bet9ja', item.bookingCodes!.bet9ja!)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 rounded-lg text-[10px] flex items-center justify-between transition-colors"
                        >
                          <span className="font-bold text-emerald-700">Bet9ja</span>
                          <span className="font-mono font-bold">{item.bookingCodes.bet9ja}</span>
                        </button>
                      )}
                      {item.bookingCodes.oneXBet && (
                        <button
                          type="button"
                          onClick={() => handleCopyBookingCode('1xBet', item.bookingCodes!.oneXBet!)}
                          className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/70 rounded-lg text-[10px] flex items-center justify-between transition-colors"
                        >
                          <span className="font-bold text-sky-700">1xBet</span>
                          <span className="font-mono font-bold">{item.bookingCodes.oneXBet}</span>
                        </button>
                      )}
                      {item.bookingCodes.betKing && (
                        <button
                          type="button"
                          onClick={() => handleCopyBookingCode('BetKing', item.bookingCodes!.betKing!)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 rounded-lg text-[10px] flex items-center justify-between transition-colors"
                        >
                          <span className="font-bold text-amber-700">BetKing</span>
                          <span className="font-mono font-bold">{item.bookingCodes.betKing}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                {/* Social interactions */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={() => onVote(item.id, 'like')}
                    className="flex items-center gap-1 text-gray-600 hover:text-green-600 p-1 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-bold tabular-nums">{item.likes}</span>
                  </button>

                  <button
                    onClick={() => onVote(item.id, 'dislike')}
                    className="flex items-center gap-1 text-gray-600 hover:text-rose-600 p-1 rounded-lg transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span className="font-bold tabular-nums">{item.dislikes}</span>
                  </button>

                  {/* Comments Toggle Button */}
                  <button
                    onClick={() => handleToggleComments(item.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                      expandedCommentsPredId === item.id
                        ? 'bg-green-100 text-green-800 font-bold'
                        : 'text-gray-600 hover:text-green-700 hover:bg-gray-50 font-semibold'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{commentsMap[item.id] ? commentsMap[item.id].length : (item.commentsCount || 0)}</span>
                    <span className="hidden sm:inline">Comments</span>
                  </button>

                  <button
                    onClick={() => onCopyPrediction(item)}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 p-1 rounded-lg transition-colors"
                    title="Copy tip to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    onClick={() => onShareWhatsApp(item)}
                    className="flex items-center gap-1 text-green-700 hover:text-green-800 p-1 rounded-lg transition-colors"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>

                {/* Report and Block buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReportingPred(item)}
                    className="text-gray-400 hover:text-rose-600 flex items-center gap-1 text-[11px] transition-colors p-1"
                    title="Report post"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report</span>
                  </button>

                  <button
                    onClick={() => onBlockUser(item.authorId, item.authorUsername)}
                    className="text-gray-400 hover:text-gray-700 flex items-center gap-1 text-[11px] transition-colors p-1"
                    title={`Block @${item.authorUsername}`}
                  >
                    <Ban className="w-3 h-3" />
                    <span className="hidden sm:inline">Block</span>
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE COMMENTS THREAD */}
              {expandedCommentsPredId === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/70 p-3 sm:p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                      <span>Community Discussion</span>
                    </span>
                    <span className="text-[11px] text-gray-500 font-normal">
                      Keep tips civil & data-grounded
                    </span>
                  </div>

                  {/* Comments list */}
                  {loadingCommentsId === item.id ? (
                    <div className="text-center py-3 text-xs text-gray-500">
                      Loading comments...
                    </div>
                  ) : (commentsMap[item.id] || []).length === 0 ? (
                    <div className="text-center py-3 text-xs text-gray-400 bg-white rounded-lg border border-gray-100">
                      No comments on this prediction yet. Be the first to share your tactical take!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {(commentsMap[item.id] || []).map(comment => (
                        <div key={comment.id} className="bg-white p-2.5 rounded-xl border border-gray-200/80 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900">
                                {comment.authorDisplayName || comment.authorUsername}
                              </span>
                              <span className="text-[10px] text-gray-400">@{comment.authorUsername}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment input */}
                  {isAuthenticated ? (
                    <form onSubmit={e => handleAddCommentSubmit(e, item.id)} className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a comment or tactical reaction..."
                        value={newCommentInput[item.id] || ''}
                        onChange={e => setNewCommentInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                        maxLength={400}
                      />
                      <button
                        type="submit"
                        disabled={postingCommentId === item.id || !(newCommentInput[item.id] || '').trim()}
                        className="px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                      >
                        {postingCommentId === item.id ? 'Posting...' : 'Comment'}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-center">
                      <button
                        onClick={onOpenLogin}
                        className="text-xs font-bold text-green-700 hover:text-green-800"
                      >
                        Sign in to join the match discussion and reply
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          ))
        )}

        {/* Cursor Pagination "Load More" */}
        {hasMore && (
          <div className="pt-2 text-center">
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl shadow-2xs transition-colors"
            >
              {loadingMore ? 'Loading next predictions...' : 'Load More Predictions'}
            </button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportingPred && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-sm text-gray-900">Report Inappropriate Content</h4>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Help maintain a safe betting community. Reports are reviewed by human staff.
            </p>

            <div className="space-y-2 mb-4">
              {reportReasons.map(reason => (
                <label key={reason} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="Provide additional details (optional)..."
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-hidden mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReportingPred(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                disabled={submittingReport}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
