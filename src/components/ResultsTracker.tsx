import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  TrendingUp, 
  Filter, 
  Calendar,
  Award,
  ChevronRight,
  Percent
} from 'lucide-react';
import { BettingTip, TipStatus } from '../types';

interface ResultsTrackerProps {
  allTips: BettingTip[];
  onSelectTip?: (tip: BettingTip) => void;
}

export const ResultsTracker: React.FC<ResultsTrackerProps> = ({ allTips }) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | 'month'>('7days');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WON' | 'LOST' | 'VOID'>('ALL');

  // Filter tips by time range
  const filteredByTime = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 86400000;

    return allTips.filter(tip => {
      // If tip date is explicitly "Today" or "Yesterday"
      if (timeFilter === 'today') {
        return tip.date.toLowerCase() === 'today';
      }
      if (timeFilter === 'yesterday') {
        return tip.date.toLowerCase() === 'yesterday';
      }
      if (timeFilter === '7days') {
        const createdMs = new Date(tip.createdAt).getTime();
        return (now - createdMs) <= oneDayMs * 7 || tip.date.toLowerCase() === 'today' || tip.date.toLowerCase() === 'yesterday';
      }
      if (timeFilter === 'month') {
        const createdMs = new Date(tip.createdAt).getTime();
        return (now - createdMs) <= oneDayMs * 30;
      }
      return true; // 'all'
    });
  }, [allTips, timeFilter]);

  // Compute real statistics automatically from filtered tips
  const stats = useMemo(() => {
    const total = filteredByTime.length;
    const won = filteredByTime.filter(t => t.status === 'Won').length;
    const lost = filteredByTime.filter(t => t.status === 'Lost').length;
    const pending = filteredByTime.filter(t => t.status === 'Pending').length;
    const voidCount = filteredByTime.filter(t => t.status === 'Void').length;

    const settled = won + lost;
    const winRate = settled > 0 ? Math.round((won / settled) * 100) : 0;

    // Unit calculation: + (odds - 1) on win, -1.00 on loss
    let netProfitUnits = 0;
    filteredByTime.forEach(t => {
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
  }, [filteredByTime]);

  // Filter by status tab (WON, LOST, VOID, ALL)
  const displayTips = useMemo(() => {
    if (statusFilter === 'WON') return filteredByTime.filter(t => t.status === 'Won');
    if (statusFilter === 'LOST') return filteredByTime.filter(t => t.status === 'Lost');
    if (statusFilter === 'VOID') return filteredByTime.filter(t => t.status === 'Void');
    return filteredByTime;
  }, [filteredByTime, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Time Range Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
          <Calendar className="w-4 h-4 text-green-600" />
          <span>Timeline Filter:</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                timeFilter === f.id
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* AUTOMATIC SUMMARY STATISTICS CARDS (Dynamically Calculated) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Tips */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Tips
          </span>
          <span className="text-2xl font-black text-gray-900 tabular-nums">
            {stats.total}
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">In timeframe</span>
        </div>

        {/* Won */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Wins
          </span>
          <span className="text-2xl font-black text-emerald-700 tabular-nums">
            {stats.won}
          </span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Successful picks</span>
        </div>

        {/* Lost */}
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Losses
          </span>
          <span className="text-2xl font-black text-rose-700 tabular-nums">
            {stats.lost}
          </span>
          <span className="text-[10px] text-rose-700 block mt-0.5">Settled lost</span>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
          </span>
          <span className="text-2xl font-black text-amber-700 tabular-nums">
            {stats.pending}
          </span>
          <span className="text-[10px] text-amber-700 block mt-0.5">Active games</span>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-green-600" /> Win Rate
          </span>
          <span className="text-2xl font-black text-gray-900 tabular-nums">
            {stats.winRate}%
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Of settled tickets</span>
        </div>

        {/* Net Profit / Return */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-2xl border border-gray-700 shadow-xs">
          <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Profit / Loss
          </span>
          <span className={`text-xl font-black tabular-nums ${stats.netProfitUnits >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.netOddsFormatted}
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Flat 1-unit staking</span>
        </div>

      </div>

      {/* Status Filter Tabs (WON | LOST | VOID | ALL) */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {(['ALL', 'WON', 'LOST', 'VOID'] as const).map(status => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#16A34A] text-white shadow-2xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-gray-500 font-medium">
          Showing {displayTips.length} records
        </span>
      </div>

      {/* Results Table / Cards */}
      {displayTips.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
          <p className="text-sm text-gray-500">No predictions found for the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-gray-100">
            {displayTips.map(tip => (
              <div 
                key={tip.id} 
                className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Date, League, Teams */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-semibold text-green-700">{tip.league}</span>
                    <span>·</span>
                    <span>{tip.date} ({tip.time})</span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#111827]">
                    {tip.homeTeam} <span className="text-gray-400 font-normal">vs</span> {tip.awayTeam}
                  </h4>
                  <div className="text-xs text-gray-600">
                    Selection: <span className="font-bold text-gray-900">{tip.predictionDetail || tip.prediction}</span>
                  </div>
                </div>

                {/* Right: Odds, Result Score, Status */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Odds</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums bg-gray-100 px-2 py-0.5 rounded-md">
                      @{tip.odds.toFixed(2)}
                    </span>
                  </div>

                  {tip.resultScore && (
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Score</span>
                      <span className="text-sm font-extrabold text-[#111827] tabular-nums">
                        {tip.resultScore}
                      </span>
                    </div>
                  )}

                  <div className="shrink-0">
                    {tip.status === 'Won' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WON
                      </span>
                    )}
                    {tip.status === 'Lost' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-xl">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> LOST
                      </span>
                    )}
                    {tip.status === 'Void' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl">
                        <MinusCircle className="w-3.5 h-3.5 text-gray-500" /> VOID
                      </span>
                    )}
                    {tip.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> PENDING
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
