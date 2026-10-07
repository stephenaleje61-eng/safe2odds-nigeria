import React, { useState } from 'react';
import { Trophy, Crown, Medal, Award, Flame, Star, CheckCircle2, User, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { LeaderboardUser, LeaderboardTimeframe } from '../types';

interface LeaderboardSectionProps {
  users: LeaderboardUser[];
  onSelectUser?: (username: string) => void;
  currentTimeframe?: LeaderboardTimeframe;
  onTimeframeChange?: (tf: LeaderboardTimeframe) => void;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ 
  users, 
  onSelectUser,
  currentTimeframe = 'weekly',
  onTimeframeChange,
}) => {
  const [internalTimeframe, setInternalTimeframe] = useState<LeaderboardTimeframe>(currentTimeframe);
  const activeTimeframe = onTimeframeChange ? currentTimeframe : internalTimeframe;

  const handleTimeframeClick = (tf: LeaderboardTimeframe) => {
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    } else {
      setInternalTimeframe(tf);
    }
  };

  const top10 = users.slice(0, 10);

  const getBadgeColor = (badgeName: string) => {
    if (badgeName.includes('Pro Tipster')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (badgeName.includes('High Accuracy')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (badgeName.includes('Veteran')) return 'bg-blue-100 text-blue-900 border-blue-300';
    if (badgeName.includes('Safe Banker')) return 'bg-purple-100 text-purple-900 border-purple-300';
    if (badgeName.includes('Rising Star')) return 'bg-rose-100 text-rose-900 border-rose-300';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-md ring-2 ring-amber-300/60">
            <Crown className="w-4 h-4 fill-current" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-md ring-2 ring-slate-300/60">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-black text-xs flex items-center justify-center shadow-md ring-2 ring-amber-600/60">
            3
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white p-6 sm:p-7 rounded-3xl border border-gray-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" /> Official Safe2Odds Leaderboard
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Official Leaderboard & Verified Standings
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Server-materialized rankings. Earn +10 points for every verified winning community prediction.
            </p>
          </div>

          {/* Timeframe Switcher Tabs */}
          <div className="bg-gray-800/90 p-1.5 rounded-2xl border border-gray-700 flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleTimeframeClick('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTimeframe === 'weekly'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleTimeframeClick('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTimeframe === 'monthly'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleTimeframeClick('all_time')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTimeframe === 'all_time'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All-Time
            </button>
          </div>
        </div>

        {/* Badges Legend */}
        <div className="mt-5 pt-4 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-gray-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Community Badges:
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800">
            👑 Pro Tipster (100+ pts)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            🎯 High Accuracy (75%+ Win)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800">
            🛡️ Veteran (15+ Tips)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800">
            🔒 Safe Banker (80%+ Streak)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800">
            ⭐ Rising Star
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top10.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* #2 Rank */}
          <div 
            onClick={() => onSelectUser && onSelectUser(top10[1].username)}
            className="cursor-pointer bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between order-2 md:order-1 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getRankBadge(2)}
                <span className="text-[11px] font-bold text-slate-500 uppercase">Runner Up</span>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                {top10[1].points} pts
              </span>
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-gray-100">
                <img
                  src={top10[1].avatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg'}
                  alt={top10[1].username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-green-700 transition-colors">
                  {top10[1].displayName || top10[1].username}
                </h4>
                <span className="text-xs text-gray-500">@{top10[1].username}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Win Rate: <strong className="text-gray-900">{top10[1].winRate}%</strong></span>
              <span className="text-gray-500">Wins: <strong className="text-emerald-700">{top10[1].wins}</strong></span>
            </div>
          </div>

          {/* #1 Champion */}
          <div 
            onClick={() => onSelectUser && onSelectUser(top10[0].username)}
            className="cursor-pointer bg-gradient-to-b from-amber-50/60 to-white rounded-3xl p-6 border-2 border-amber-400 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between order-1 md:order-2 relative overflow-hidden group md:-translate-y-2"
          >
            <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Weekly #1 Tipper
            </div>
            <div className="flex items-center gap-2 mb-3">
              {getRankBadge(1)}
              <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Champion</span>
            </div>
            <div className="flex items-center gap-3.5 my-2">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 shadow-md bg-gray-100">
                <img
                  src={top10[0].avatar || '/src/assets/images/vip_club_crest_1791379729058.jpg'}
                  alt={top10[0].username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-black text-base text-gray-900 group-hover:text-green-700 transition-colors">
                  {top10[0].displayName || top10[0].username}
                </h4>
                <span className="text-xs text-amber-800 font-semibold">@{top10[0].username}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-600">Points: <strong className="text-green-700 text-sm font-black">{top10[0].points} pts</strong></span>
              <span className="text-gray-600">Win Rate: <strong className="text-gray-900 font-black">{top10[0].winRate}%</strong></span>
            </div>
          </div>

          {/* #3 Bronze */}
          <div 
            onClick={() => onSelectUser && onSelectUser(top10[2].username)}
            className="cursor-pointer bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between order-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getRankBadge(3)}
                <span className="text-[11px] font-bold text-amber-800 uppercase">3rd Place</span>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full">
                {top10[2].points} pts
              </span>
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-200 shrink-0 bg-gray-100">
                <img
                  src={top10[2].avatar || '/src/assets/images/football_news_action_1791379720643.jpg'}
                  alt={top10[2].username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-green-700 transition-colors">
                  {top10[2].displayName || top10[2].username}
                </h4>
                <span className="text-xs text-gray-500">@{top10[2].username}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Win Rate: <strong className="text-gray-900">{top10[2].winRate}%</strong></span>
              <span className="text-gray-500">Wins: <strong className="text-emerald-700">{top10[2].wins}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Complete Top 10 Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-4 text-center w-16">Rank</th>
                <th scope="col" className="py-3.5 px-4">Tipster</th>
                <th scope="col" className="py-3.5 px-4 text-right">Points Earned</th>
                <th scope="col" className="py-3.5 px-4 text-right">Predictions</th>
                <th scope="col" className="py-3.5 px-4 text-right">Verified Wins</th>
                <th scope="col" className="py-3.5 px-4 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {top10.map((user, index) => {
                const rank = index + 1;
                return (
                  <tr 
                    key={user.id} 
                    onClick={() => onSelectUser && onSelectUser(user.username)}
                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                      rank === 1 ? 'bg-amber-50/20' : rank <= 3 ? 'bg-gray-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(rank)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <img
                            src={user.avatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg'}
                            alt={user.username}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-sm text-gray-900">
                              {user.displayName || user.username}
                            </span>
                            {user.badge && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(user.badge)}`}>
                                {user.badge}
                              </span>
                            )}
                            {user.badges && user.badges.filter(b => b !== user.badge).slice(0, 2).map(b => (
                              <span key={b} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${getBadgeColor(b)}`}>
                                {b}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-500 block">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-sm text-green-700 tabular-nums">
                      {user.points} pts
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-700 tabular-nums">
                      {user.totalPredictions}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">
                      {user.wins}
                    </td>
                    <td className="py-3 px-4 text-right font-black tabular-nums text-gray-900">
                      <span className="inline-block bg-gray-100 px-2.5 py-0.5 rounded-md text-xs font-bold">
                        {user.winRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
