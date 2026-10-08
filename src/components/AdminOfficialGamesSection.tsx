import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Flame, 
  Plus, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Edit2,
  Trash2,
  Radio,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { BettingTip, UserProfile, PredictionMarket, TipStatus } from '../types';
import { TipCard } from './TipCard';
import { ApiClient } from '../services/apiClient';

interface AdminOfficialGamesSectionProps {
  tips: BettingTip[];
  currentUser: UserProfile | null;
  onOpenCreateTipModal?: () => void;
  onCopyTip: (tip: BettingTip) => void;
  onShareTip: (tip: BettingTip) => void;
  onToggleBookmark: (tipId: string) => void;
  onToggleSlip: (tip: BettingTip) => void;
  slipTips: BettingTip[];
  onTipCreatedOrUpdated?: () => void;
}

export const AdminOfficialGamesSection: React.FC<AdminOfficialGamesSectionProps> = ({
  tips,
  currentUser,
  onOpenCreateTipModal,
  onCopyTip,
  onShareTip,
  onToggleBookmark,
  onToggleSlip,
  slipTips,
  onTipCreatedOrUpdated,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

  // Inline Quick Admin Post Modal / Form State
  const [showQuickPostModal, setShowQuickPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  const [formMatch, setFormMatch] = useState({
    homeTeam: '',
    awayTeam: '',
    league: 'UEFA Champions League',
    date: 'Today',
    time: '20:00',
    prediction: 'Over 1.5' as PredictionMarket,
    predictionDetail: 'Over 1.5 Total Goals',
    odds: 1.95,
    analysis: 'Statistical model shows 82% expected probability based on recent expected goals and head-to-head metrics.',
    isVip: false,
    status: 'Pending' as TipStatus,
    sportyBetCode: '',
    bet9jaCode: '',
  });

  const handleQuickPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMatch.homeTeam.trim() || !formMatch.awayTeam.trim()) {
      setPostError('Both home and away teams are required.');
      return;
    }

    setIsPosting(true);
    setPostError('');
    setPostSuccess('');

    try {
      const payload: any = {
        homeTeam: formMatch.homeTeam.trim(),
        awayTeam: formMatch.awayTeam.trim(),
        league: formMatch.league,
        date: formMatch.date,
        time: formMatch.time,
        prediction: formMatch.prediction,
        predictionDetail: formMatch.predictionDetail || formMatch.prediction,
        odds: Number(formMatch.odds) || 1.95,
        analysis: formMatch.analysis.trim(),
        status: formMatch.status,
        isVip: formMatch.isVip,
        bookingCodes: {
          sportyBet: formMatch.sportyBetCode.trim() || undefined,
          bet9ja: formMatch.bet9jaCode.trim() || undefined,
        }
      };

      const res = await ApiClient.createOfficialTip(payload);
      if (res.success) {
        setPostSuccess('Official game published live! Instantly broadcasted to all users.');
        setShowQuickPostModal(false);
        // Reset form
        setFormMatch({
          homeTeam: '',
          awayTeam: '',
          league: 'UEFA Champions League',
          date: 'Today',
          time: '20:00',
          prediction: 'Over 1.5',
          predictionDetail: 'Over 1.5 Total Goals',
          odds: 1.95,
          analysis: '',
          isVip: false,
          status: 'Pending',
          sportyBetCode: '',
          bet9jaCode: '',
        });
        if (onTipCreatedOrUpdated) {
          onTipCreatedOrUpdated();
        }
      } else {
        setPostError(res.error || 'Failed to publish game.');
      }
    } catch (err: any) {
      setPostError(err.message || 'Network error.');
    } finally {
      setIsPosting(false);
    }
  };

  // Sort: Pending official games first
  const sortedOfficialGames = [...tips].sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeOfficialCount = sortedOfficialGames.filter(t => t.status === 'Pending').length;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#141922] via-[#10141C] to-[#0D1017] p-5 sm:p-7 md:p-8 rounded-3xl border-2 border-red-600/40 shadow-2xl shadow-red-950/30 space-y-6 text-white">
      
      {/* Decorative Red Accent Glow in Background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <span className="p-2 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-xl shadow-lg shadow-red-600/30">
              <Crown className="w-5 h-5 text-amber-300" />
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Admin Official Games</span>
              <span className="text-red-500 font-extrabold">& Predictions</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-red-500/20 text-red-400 border border-red-500/40 shadow-xs">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" /> REAL-TIME BROADCAST
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> VERIFIED 2 SURE ODDS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Published directly by authorized administrators. Rigorously vetted selections that sync instantly to every connected user worldwide.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          {isAdmin && (
            <button
              onClick={() => setShowQuickPostModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-red-700/40 border border-red-500/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post Admin Game</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-gray-400 font-medium">Active Tips:</span>
            <span className="font-mono font-black text-red-400 text-sm">{activeOfficialCount}</span>
          </div>
        </div>
      </div>

      {/* Welcome Banner Box (Per User Spec: Professional Welcome to 2 Sure Odd Football) */}
      <div className="relative z-10 bg-gradient-to-r from-black via-[#161B24] to-[#1F1316] text-white p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-red-900/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Welcome to 2 Sure Odd Football
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl font-normal">
            Conservative 1.85 to 2.10 odds accumulator strategies built on verified historical metrics, team form, and zero fake claims. Every game posted by administrators appears here in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="bg-red-950/80 px-3.5 py-2 rounded-xl text-red-300 font-extrabold border border-red-700/40 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-red-400 fill-current" />
            <span>100% Free & Open Access</span>
          </span>
        </div>
      </div>

      {/* Official Games Cards Grid */}
      <div className="relative z-10">
        {sortedOfficialGames.length === 0 ? (
          <div className="bg-[#12161F]/80 rounded-2xl p-10 text-center border border-white/10 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-300 font-bold mb-1">
              No official games published yet today.
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Our analysts are finalizing the latest statistical checks. New verified banker selections will be broadcasted live shortly!
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowQuickPostModal(true)}
                className="mt-4 inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Game Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {sortedOfficialGames.map(tip => (
              <TipCard
                key={tip.id}
                tip={tip}
                onCopyTip={onCopyTip}
                onShareTip={onShareTip}
                isBookmarked={Boolean(currentUser?.savedTipIds.includes(tip.id))}
                onToggleBookmark={onToggleBookmark}
                isInSlip={slipTips.some(t => t.id === tip.id)}
                onToggleSlip={onToggleSlip}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Admin Post Modal (Instant Creation for Admin users) */}
      {showQuickPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141923] text-white border-2 border-red-600/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-black text-white">
                  Publish Admin Official Game
                </h3>
              </div>
              <button
                onClick={() => setShowQuickPostModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-red-950/80 border border-red-600/60 text-red-200 text-xs rounded-xl font-medium">
                {postError}
              </div>
            )}
            {postSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs rounded-xl font-medium">
                {postSuccess}
              </div>
            )}

            <form onSubmit={handleQuickPostSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Home Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={formMatch.homeTeam}
                    onChange={e => setFormMatch({ ...formMatch, homeTeam: e.target.value })}
                    placeholder="e.g. Real Madrid"
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Away Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={formMatch.awayTeam}
                    onChange={e => setFormMatch({ ...formMatch, awayTeam: e.target.value })}
                    placeholder="e.g. Barcelona"
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    League / Competition
                  </label>
                  <select
                    value={formMatch.league}
                    onChange={e => setFormMatch({ ...formMatch, league: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Premier League">Premier League</option>
                    <option value="UEFA Champions League">UEFA Champions League</option>
                    <option value="La Liga">La Liga</option>
                    <option value="Serie A">Serie A</option>
                    <option value="Bundesliga">Bundesliga</option>
                    <option value="Ligue 1">Ligue 1</option>
                    <option value="NPFL">Nigeria NPFL</option>
                    <option value="Europa League">Europa League</option>
                    <option value="International">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Kickoff Time
                  </label>
                  <input
                    type="text"
                    value={formMatch.time}
                    onChange={e => setFormMatch({ ...formMatch, time: e.target.value })}
                    placeholder="e.g. 20:00"
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Target Odds
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.05"
                    max="10.0"
                    value={formMatch.odds}
                    onChange={e => setFormMatch({ ...formMatch, odds: parseFloat(e.target.value) || 1.95 })}
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Market Selection
                  </label>
                  <select
                    value={formMatch.prediction}
                    onChange={e => setFormMatch({ ...formMatch, prediction: e.target.value as any, predictionDetail: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Over 1.5">Over 1.5 Goals</option>
                    <option value="Home Win">Home Win (1)</option>
                    <option value="Away Win">Away Win (2)</option>
                    <option value="Double Chance (1X)">Double Chance (1X)</option>
                    <option value="Double Chance (X2)">Double Chance (X2)</option>
                    <option value="BTTS / GG">Both Teams to Score (GG)</option>
                    <option value="Over 2.5">Over 2.5 Goals</option>
                    <option value="Under 3.5">Under 3.5 Goals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Market Detail Label
                  </label>
                  <input
                    type="text"
                    value={formMatch.predictionDetail}
                    onChange={e => setFormMatch({ ...formMatch, predictionDetail: e.target.value })}
                    placeholder="e.g. Over 1.5 Total Match Goals"
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    SportyBet Booking Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formMatch.sportyBetCode}
                    onChange={e => setFormMatch({ ...formMatch, sportyBetCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SB-BC9214"
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Bet9ja Booking Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formMatch.bet9jaCode}
                    onChange={e => setFormMatch({ ...formMatch, bet9jaCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. B9J-48910"
                    className="w-full bg-[#0B0E14] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Tactical & Statistical Analysis *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formMatch.analysis}
                  onChange={e => setFormMatch({ ...formMatch, analysis: e.target.value })}
                  placeholder="Explain the mathematical edge, team news, form metrics, and tactical match-up..."
                  className="w-full bg-[#0B0E14] border border-white/20 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowQuickPostModal(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isPosting ? 'Publishing...' : 'Publish Official Game Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
