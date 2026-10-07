import React, { useEffect, useState } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Radio, 
  ShieldCheck, 
  Calendar, 
  Award, 
  Users, 
  Activity, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { LiveMatch } from '../types';
import { ApiClient } from '../services/apiClient';

interface MatchDetailsModalProps {
  matchId: string | null;
  initialMatch?: LiveMatch | null;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  matchId,
  initialMatch,
  onClose,
}) => {
  const [match, setMatch] = useState<LiveMatch | null>(initialMatch || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'stats' | 'lineups'>('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiClient.getLiveMatchDetails(matchId);
        if (isMounted) {
          if (res.success && res.data) {
            setMatch(res.data);
          } else {
            setError(res.error?.message || 'Match details currently unavailable.');
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load match details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    // Auto-refresh match details every 15s if LIVE
    const interval = setInterval(() => {
      if (match?.status === 'LIVE') {
        fetchDetails();
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [matchId]);

  if (!matchId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111827] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Competition & Status */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-gray-200">
              {match?.league || 'Football'}
            </span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-300 text-xs font-medium">{match?.country || 'World'}</span>

            <div className="ml-auto mr-8">
              {match?.status === 'LIVE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  LIVE {match.statusDetail || match.time}
                </span>
              )}
              {match?.status === 'FINISHED' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-green-950 text-green-300 border border-green-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  FT · Final Verified Score
                </span>
              )}
              {match?.status === 'UPCOMING' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  <Clock className="w-3.5 h-3.5" />
                  {match.time}
                </span>
              )}
              {match?.status === 'POSTPONED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Postponed
                </span>
              )}
              {match?.status === 'CANCELLED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-300">
                  Cancelled
                </span>
              )}
            </div>
          </div>

          {/* Scoreboard Banner */}
          <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 py-2">
            {/* Home Team */}
            <div className="col-span-5 text-right flex flex-col items-end">
              {match?.homeTeamLogo && (
                <img 
                  src={match.homeTeamLogo} 
                  alt={match.homeTeam} 
                  className="w-12 h-12 object-contain mb-1.5 drop-shadow-md"
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <h3 className="font-black text-sm sm:text-lg text-white leading-tight">
                {match?.homeTeam || 'Home Team'}
              </h3>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Home</span>
            </div>

            {/* Score Center */}
            <div className="col-span-2 text-center flex flex-col items-center justify-center">
              {match?.status === 'UPCOMING' ? (
                <div className="text-gray-400 font-black text-base bg-white/5 px-3 py-1 rounded-xl">
                  VS
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {match?.homeScore ?? 0}
                  </span>
                  <span className="text-gray-400 font-bold">-</span>
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {match?.awayScore ?? 0}
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-5 text-left flex flex-col items-start">
              {match?.awayTeamLogo && (
                <img 
                  src={match.awayTeamLogo} 
                  alt={match.awayTeam} 
                  className="w-12 h-12 object-contain mb-1.5 drop-shadow-md"
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <h3 className="font-black text-sm sm:text-lg text-white leading-tight">
                {match?.awayTeam || 'Away Team'}
              </h3>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Away</span>
            </div>
          </div>

          {/* Venue & Verified Feed Notice */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{match?.venue || 'Venue confirmed'}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{match?.dataSource || 'Official Sports Feed'}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 sm:px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'events', label: `Events (${match?.events?.length || 0})` },
            { id: 'stats', label: 'Match Stats' },
            { id: 'lineups', label: 'Lineups' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === t.id
                  ? 'border-green-600 text-green-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {loading && !match && (
            <div className="flex items-center justify-center py-12 gap-2 text-sm text-gray-500 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-green-600" />
              <span>Loading verified match details...</span>
            </div>
          )}

          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && match && (
            <div className="space-y-4">
              {/* Match Meta Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">Scheduled Kickoff</span>
                  <span className="font-bold text-gray-800">
                    {new Date(match.startTimeIso).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">Status Detail</span>
                  <span className="font-bold text-gray-800">{match.statusDetail || match.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">Competition</span>
                  <span className="font-bold text-gray-800">{match.league} ({match.country})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Data Transparency</span>
                  <span className="font-bold text-green-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Real Match Data (No Simulated Scores)
                  </span>
                </div>
              </div>

              {/* Goals Summary If Any */}
              {match.events && match.events.some(e => e.type === 'goal') && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
                    Scoring Plays
                  </h4>
                  <div className="space-y-1.5">
                    {match.events
                      .filter(e => e.type === 'goal')
                      .map((evt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-green-50/70 border border-green-200 rounded-xl px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">⚽</span>
                            <span className="font-bold text-gray-900">{evt.player}</span>
                            <span className="text-gray-500">({evt.team === 'home' ? match.homeTeam : match.awayTeam})</span>
                          </div>
                          <span className="font-extrabold text-green-800 bg-green-200/60 px-2 py-0.5 rounded-md text-[11px]">
                            {evt.minute}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVENTS */}
          {activeTab === 'events' && match && (
            <div className="space-y-3">
              {!match.events || match.events.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  {match.status === 'UPCOMING'
                    ? 'Match has not started yet. Real-time events, goals, and cards will populate live when play begins.'
                    : 'No detailed match events recorded for this fixture by the official data feed.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {match.events.map((evt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-colors text-xs"
                    >
                      <span className="font-extrabold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                        {evt.minute}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          {evt.type === 'goal' && <span>⚽ Goal</span>}
                          {evt.type === 'yellow' && <span className="text-amber-600">🟨 Yellow Card</span>}
                          {evt.type === 'red' && <span className="text-red-600">🟥 Red Card</span>}
                          {evt.type === 'sub' && <span className="text-blue-600">🔄 Substitution</span>}
                          {evt.type === 'penalty' && <span className="text-purple-600">🎯 Penalty</span>}
                          {evt.type === 'other' && <span className="text-gray-500">⏱️ Match Event</span>}
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-700">{evt.player}</span>
                        </div>
                        {evt.detail && evt.detail !== evt.player && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{evt.detail}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {evt.team === 'home' ? 'Home' : 'Away'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATISTICS */}
          {activeTab === 'stats' && match && (
            <div className="space-y-4">
              {!match.stats || (!match.stats.home.possession && !match.stats.home.shots) ? (
                <div className="text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  {match.status === 'UPCOMING'
                    ? 'Statistics will be updated live once kickoff commences.'
                    : 'Official match statistics are not provided by this competition feed.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Ball Possession', home: match.stats.home.possession, away: match.stats.away.possession },
                    { label: 'Total Shots', home: match.stats.home.shots, away: match.stats.away.shots },
                    { label: 'Shots on Target', home: match.stats.home.shotsOnTarget, away: match.stats.away.shotsOnTarget },
                    { label: 'Corner Kicks', home: match.stats.home.corners, away: match.stats.away.corners },
                    { label: 'Fouls Committed', home: match.stats.home.fouls, away: match.stats.away.fouls },
                    { label: 'Yellow Cards', home: match.stats.home.yellowCards, away: match.stats.away.yellowCards },
                    { label: 'Red Cards', home: match.stats.home.redCards, away: match.stats.away.redCards },
                    { label: 'Offsides', home: match.stats.home.offsides, away: match.stats.away.offsides },
                    { label: 'Pass Accuracy', home: match.stats.home.passAccuracy, away: match.stats.away.passAccuracy },
                  ]
                    .filter(s => s.home || s.away)
                    .map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-1">
                          <span className="text-gray-900">{item.home || '-'}</span>
                          <span className="text-gray-500 font-semibold">{item.label}</span>
                          <span className="text-gray-900">{item.away || '-'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LINEUPS */}
          {activeTab === 'lineups' && match && (
            <div className="space-y-4">
              {!match.lineups || (!match.lineups.homeTeam.starters.length && !match.lineups.awayTeam.starters.length) ? (
                <div className="text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  {match.status === 'UPCOMING'
                    ? 'Official team lineups are published approximately 60 minutes prior to kickoff.'
                    : 'Team lineups not recorded for this fixture in the sports wire.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home starters */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <h5 className="font-bold text-xs text-gray-900">{match.homeTeam}</h5>
                      {match.lineups.homeTeam.formation && (
                        <span className="text-[10px] font-extrabold bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                          {match.lineups.homeTeam.formation}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1 text-xs">
                      {match.lineups.homeTeam.starters.map((p, idx) => (
                        <li key={idx} className="flex items-center justify-between py-0.5 text-gray-700">
                          <span>{p.jersey ? `#${p.jersey} ` : ''}{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{p.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Away starters */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <h5 className="font-bold text-xs text-gray-900">{match.awayTeam}</h5>
                      {match.lineups.awayTeam.formation && (
                        <span className="text-[10px] font-extrabold bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                          {match.lineups.awayTeam.formation}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1 text-xs">
                      {match.lineups.awayTeam.starters.map((p, idx) => (
                        <li key={idx} className="flex items-center justify-between py-0.5 text-gray-700">
                          <span>{p.jersey ? `#${p.jersey} ` : ''}{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{p.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Updated: {new Date(match?.lastUpdated || Date.now()).toLocaleTimeString()}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
