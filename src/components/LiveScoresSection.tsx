import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RefreshCw, 
  Clock, 
  ChevronRight, 
  Activity, 
  Calendar, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { LiveMatch } from '../types';
import { MatchDetailsModal } from './MatchDetailsModal';

interface LiveScoresSectionProps {
  matches: LiveMatch[];
  lastUpdated?: string;
  totalMatches?: number;
  liveCount?: number;
  upcomingCount?: number;
  finishedCount?: number;
  isSyncing?: boolean;
  syncError?: string | null;
  onRefresh: () => void;
  onOpenMatchModal?: (matchId: string) => void;
}

export const LiveScoresSection: React.FC<LiveScoresSectionProps> = ({
  matches,
  lastUpdated,
  totalMatches = matches.length,
  liveCount = matches.filter(m => m.status === 'LIVE').length,
  upcomingCount = matches.filter(m => m.status === 'UPCOMING').length,
  finishedCount = matches.filter(m => m.status === 'FINISHED').length,
  isSyncing = false,
  syncError = null,
  onRefresh,
}) => {
  // Main Category Tabs requested: LIVE NOW | TODAY'S MATCHES | UPCOMING | RESULTS
  const [activeTab, setActiveTab] = useState<'LIVE' | 'TODAY' | 'UPCOMING' | 'RESULTS'>('TODAY');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Auto poll countdown (30s)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  // Extract leagues
  const leagues = ['ALL', ...Array.from(new Set(matches.map(m => m.league))).sort()];

  // Filter matches
  const filteredMatches = matches.filter(m => {
    const matchTime = new Date(m.startTimeIso).getTime();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (activeTab === 'LIVE') {
      if (m.status !== 'LIVE') return false;
    } else if (activeTab === 'TODAY') {
      // Matches happening within 24 hours or status LIVE/FINISHED today
      const isWithin24h = Math.abs(matchTime - now) <= oneDayMs;
      if (!isWithin24h && m.status !== 'LIVE') return false;
    } else if (activeTab === 'UPCOMING') {
      if (m.status !== 'UPCOMING') return false;
    } else if (activeTab === 'RESULTS') {
      if (m.status !== 'FINISHED') return false;
    }

    if (selectedLeague !== 'ALL' && m.league !== selectedLeague) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.homeTeam} ${m.awayTeam} ${m.league} ${m.country}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-green-100 text-green-700 rounded-xl">
              <Radio className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Real-Time Match Center
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> 100% Real Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Automated live scores, verified match minutes, lineups, and results across official worldwide leagues & NPFL.
          </p>
        </div>

        {/* Sync Status & Action */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Auto-sync in <strong className="font-bold text-gray-900">{secondsUntilRefresh}s</strong></span>
          </div>

          <button
            onClick={() => {
              onRefresh();
              setSecondsUntilRefresh(30);
            }}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-green-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Trust & Transparency Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Verified Sports Data Engine:</span>
            <span className="text-emerald-900 ml-1">
              Direct live connection to official sports wire data feeds. No simulated scores or placeholder matches.
            </span>
          </div>
        </div>
        {lastUpdated && (
          <span className="text-[11px] text-emerald-800 font-medium shrink-0">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Sync Failure Graceful Alert */}
      {syncError && matches.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Live data temporarily unavailable from provider. Attempting automatic reconnection...</span>
        </div>
      )}

      {/* 4 PRIMARY SECTION TABS: LIVE NOW | TODAY'S MATCHES | UPCOMING | RESULTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 p-1.5 rounded-2xl">
        {[
          { id: 'LIVE', label: 'LIVE NOW', icon: Radio, count: liveCount, isLive: true },
          { id: 'TODAY', label: "TODAY'S MATCHES", icon: Calendar, count: matches.length },
          { id: 'UPCOMING', label: 'UPCOMING', icon: Clock, count: upcomingCount },
          { id: 'RESULTS', label: 'RESULTS', icon: CheckCircle2, count: finishedCount },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 rounded-xl font-black text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {tab.isLive && liveCount > 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-green-700' : 'text-gray-500'}`} />
                )}
                <span>{tab.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive 
                  ? tab.isLive && liveCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Competition Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teams, leagues, countries..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-green-600"
          />
        </div>

        {/* League dropdown filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Competition:</span>
          <select
            value={selectedLeague}
            onChange={e => setSelectedLeague(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-hidden focus:border-green-600"
          >
            {leagues.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-2">
            <Info className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="text-sm font-bold text-gray-700">No matches found in this section</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {activeTab === 'LIVE' 
                ? 'There are currently no live matches in progress right now. Check "UPCOMING" or "TODAYS MATCHES" to see scheduled fixtures.'
                : 'No matches matched your search or league filter.'}
            </p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div
              key={match.id}
              onClick={() => setSelectedMatchId(match.id)}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:border-green-600/60 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Competition header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-800 group-hover:text-green-700 transition-colors">
                    {match.league}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">{match.country}</span>
                </div>

                <div>
                  {match.status === 'LIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      LIVE {match.statusDetail || match.time}
                    </span>
                  )}
                  {match.status === 'FINISHED' && (
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      FT · Full Time
                    </span>
                  )}
                  {match.status === 'UPCOMING' && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {match.time}
                    </span>
                  )}
                  {match.status === 'POSTPONED' && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-0.5 rounded-full">
                      Postponed
                    </span>
                  )}
                  {match.status === 'CANCELLED' && (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>

              {/* Match Teams and Score */}
              <div className="grid grid-cols-12 items-center gap-2 py-2">
                {/* Home Team */}
                <div className="col-span-5 flex items-center justify-end gap-2 text-right">
                  <span className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                    {match.homeTeam}
                  </span>
                  {match.homeTeamLogo && (
                    <img 
                      src={match.homeTeamLogo} 
                      alt={match.homeTeam} 
                      className="w-6 h-6 object-contain shrink-0"
                      onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                </div>

                {/* Score or VS */}
                <div className="col-span-2 text-center">
                  {match.status === 'UPCOMING' ? (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                      VS
                    </span>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 bg-[#111827] text-white font-black text-base sm:text-lg px-3 py-1 rounded-xl shadow-xs tabular-nums">
                      <span>{match.homeScore}</span>
                      <span className="text-gray-500">-</span>
                      <span>{match.awayScore}</span>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="col-span-5 flex items-center justify-start gap-2 text-left">
                  {match.awayTeamLogo && (
                    <img 
                      src={match.awayTeamLogo} 
                      alt={match.awayTeam} 
                      className="w-6 h-6 object-contain shrink-0"
                      onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                  <span className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                    {match.awayTeam}
                  </span>
                </div>
              </div>

              {/* Footer row: venue & open details affordance */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="truncate max-w-[70%]">
                  {match.venue ? `📍 ${match.venue}` : `Kickoff: ${new Date(match.startTimeIso).toLocaleDateString()}`}
                </span>

                <div className="flex items-center gap-1 font-bold text-green-700 group-hover:translate-x-1 transition-transform">
                  <span>Match Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Match Details Modal (Real statistics, events, lineups, and live commentary) */}
      {selectedMatchId && (
        <MatchDetailsModal
          matchId={selectedMatchId}
          initialMatch={matches.find(m => m.id === selectedMatchId)}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

    </div>
  );
};
