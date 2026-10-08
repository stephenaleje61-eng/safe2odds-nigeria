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
  Trash2
} from 'lucide-react';
import { BettingTip, UserProfile } from '../types';
import { TipCard } from './TipCard';

interface AdminOfficialGamesSectionProps {
  tips: BettingTip[];
  currentUser: UserProfile | null;
  onOpenCreateTipModal?: () => void;
  onCopyTip: (tip: BettingTip) => void;
  onShareTip: (tip: BettingTip) => void;
  onToggleBookmark: (tipId: string) => void;
  onToggleSlip: (tip: BettingTip) => void;
  slipTips: BettingTip[];
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
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

  // Sort: Pending official games first
  const sortedOfficialGames = [...tips].sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section className="bg-gradient-to-b from-white to-gray-50/50 p-6 sm:p-8 rounded-3xl border-2 border-green-600/30 shadow-md space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
              <Crown className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Admin Official Games & Predictions
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-green-100 text-green-800 border border-green-300">
              <ShieldCheck className="w-3 h-3" /> VERIFIED 2 SURE ODDS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Published directly by authorized administrators. Mathematically modeled selections appearing instantly for all users.
          </p>
        </div>

        {/* Admin Publish Trigger if Admin */}
        {isAdmin && onOpenCreateTipModal && (
          <button
            onClick={onOpenCreateTipModal}
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Official Game</span>
          </button>
        )}
      </div>

      {/* Welcome Banner Banner Box */}
      <div className="bg-[#111827] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-black text-white">
              Welcome to 2 Sure Odd Football
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
            Conservative 1.85 to 2.10 odds accumulator strategies built on actual statistical distributions and zero fake claims.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-white/10 px-3 py-1.5 rounded-xl text-green-400 font-bold border border-white/10">
            100% Free & Open Access
          </span>
        </div>
      </div>

      {/* Official Games Cards Grid */}
      {sortedOfficialGames.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">
            No official games published yet today. Check back shortly as admin analysis concludes!
          </p>
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

    </section>
  );
};
