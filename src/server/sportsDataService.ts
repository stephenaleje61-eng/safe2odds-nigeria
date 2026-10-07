import { LiveMatch, LiveMatchEvent, MatchTeamStats, MatchLineups } from '../types/index';

interface ESPNEvent {
  id: string;
  uid?: string;
  date: string;
  name: string;
  shortName?: string;
  season?: {
    slug?: string;
    displayName?: string;
  };
  competitions?: Array<{
    id: string;
    venue?: { fullName?: string };
    competitors?: Array<{
      id: string;
      homeAway: 'home' | 'away';
      score?: string;
      team?: {
        id: string;
        displayName: string;
        shortDisplayName?: string;
        logo?: string;
      };
      records?: Array<{ summary?: string }>;
    }>;
    details?: Array<any>;
  }>;
  status?: {
    clock?: number;
    displayClock?: string;
    period?: number;
    type?: {
      id?: string;
      name?: string;
      state?: 'pre' | 'in' | 'post';
      completed?: boolean;
      description?: string;
      detail?: string;
      shortDetail?: string;
    };
  };
}

export class SportsDataService {
  private static instance: SportsDataService;
  private cachedMatches: LiveMatch[] = [];
  private lastSyncTimestamp: string = '';
  private syncInProgress: boolean = false;
  private syncError: string | null = null;
  private syncCount: number = 0;
  private detailedMatchCache: Map<string, { data: LiveMatch; expiresAt: number }> = new Map();

  private syncPromise: Promise<any> | null = null;

  private constructor() {
    // Initial async sync on boot
    this.syncPromise = this.performSync();
    // Automated background refresh every 30 seconds for live match agility
    setInterval(() => {
      this.performSync().catch(err => console.error('[SportsDataService] Background sync error:', err.message));
    }, 30 * 1000);
  }

  public static getInstance(): SportsDataService {
    if (!SportsDataService.instance) {
      SportsDataService.instance = new SportsDataService();
    }
    return SportsDataService.instance;
  }

  /**
   * Fetches real, verified fixtures and live scores across key competitions and dates
   */
  public async syncFromRealDataSources(): Promise<{ success: boolean; matchCount: number; error?: string }> {
    if (this.syncPromise) {
      await this.syncPromise;
      return { success: !this.syncError, matchCount: this.cachedMatches.length, error: this.syncError || undefined };
    }
    return this.performSync();
  }

  private async performSync(): Promise<{ success: boolean; matchCount: number; error?: string }> {
    if (this.syncInProgress) {
      return { success: true, matchCount: this.cachedMatches.length };
    }
    this.syncInProgress = true;

    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10).replace(/-/g, '');
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10).replace(/-/g, '');

      // Pull today's all-leagues scoreboard + major leagues
      const urls = [
        `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${today}`,
        `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${yesterday}`,
        `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${tomorrow}`,
        `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`,
        `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard`,
        `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard`,
        `https://site.api.espn.com/apis/site/v2/sports/soccer/nga.1/scoreboard`,
      ];

      const fetchPromises = urls.map(url =>
        fetch(url, { headers: { 'User-Agent': 'Safe2Odds-LiveScores/2.0' } })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .catch(err => {
            console.warn(`[SportsDataService] Error fetching ${url}:`, err.message);
            return null;
          })
      );

      const responses = await Promise.all(fetchPromises);
      const allEventsMap = new Map<string, ESPNEvent>();

      for (const data of responses) {
        if (data && Array.isArray(data.events)) {
          for (const ev of data.events) {
            if (ev && ev.id && !allEventsMap.has(ev.id)) {
              allEventsMap.set(ev.id, ev);
            }
          }
        }
      }

      if (allEventsMap.size === 0) {
        // If external network is temporarily down, preserve previous cache if exists
        if (this.cachedMatches.length > 0) {
          this.syncInProgress = false;
          return { success: true, matchCount: this.cachedMatches.length };
        }
        throw new Error('Live sports data provider feed temporarily unreachable.');
      }

      const parsedMatches: LiveMatch[] = [];

      for (const [id, ev] of allEventsMap.entries()) {
        const comp = ev.competitions?.[0];
        if (!comp || !comp.competitors || comp.competitors.length < 2) continue;

        const homeComp = comp.competitors.find(c => c.homeAway === 'home');
        const awayComp = comp.competitors.find(c => c.homeAway === 'away');
        if (!homeComp?.team?.displayName || !awayComp?.team?.displayName) continue;

        const state = ev.status?.type?.state || 'pre';
        const description = ev.status?.type?.description?.toLowerCase() || '';
        const isCompleted = ev.status?.type?.completed === true;

        let status: LiveMatch['status'] = 'UPCOMING';
        if (description.includes('postponed')) {
          status = 'POSTPONED';
        } else if (description.includes('cancel')) {
          status = 'CANCELLED';
        } else if (isCompleted || state === 'post') {
          status = 'FINISHED';
        } else if (state === 'in') {
          status = 'LIVE';
        } else {
          status = 'UPCOMING';
        }

        const homeScore = parseInt(homeComp.score || '0', 10);
        const awayScore = parseInt(awayComp.score || '0', 10);

        // Derive competition name
        let leagueName = ev.season?.displayName || ev.season?.slug || 'International Soccer';
        if (leagueName.includes('-')) {
          leagueName = leagueName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        }

        // Clean common competition naming
        if (leagueName.toLowerCase().includes('english premier') || leagueName.toLowerCase().includes('premier league')) {
          leagueName = 'Premier League';
        } else if (leagueName.toLowerCase().includes('la liga') || leagueName.toLowerCase().includes('spanish primera')) {
          leagueName = 'La Liga';
        } else if (leagueName.toLowerCase().includes('serie a')) {
          leagueName = 'Serie A';
        } else if (leagueName.toLowerCase().includes('bundesliga')) {
          leagueName = 'Bundesliga';
        } else if (leagueName.toLowerCase().includes('champions league')) {
          leagueName = 'UEFA Champions League';
        } else if (leagueName.toLowerCase().includes('europa league')) {
          leagueName = 'UEFA Europa League';
        } else if (leagueName.toLowerCase().includes('nigerian') || leagueName.toLowerCase().includes('npfl')) {
          leagueName = 'NPFL (Nigeria)';
        }

        // Country inference
        let country = 'World';
        if (leagueName === 'Premier League') country = 'England';
        else if (leagueName === 'La Liga') country = 'Spain';
        else if (leagueName === 'Serie A') country = 'Italy';
        else if (leagueName === 'Bundesliga') country = 'Germany';
        else if (leagueName === 'NPFL (Nigeria)') country = 'Nigeria';
        else if (leagueName.includes('UEFA')) country = 'Europe';

        // Display time
        const matchDate = new Date(ev.date);
        const hours = matchDate.getUTCHours().toString().padStart(2, '0');
        const minutes = matchDate.getUTCMinutes().toString().padStart(2, '0');
        const displayTime = status === 'LIVE' 
          ? (ev.status?.displayClock || `${ev.status?.clock || 0}'`)
          : `${hours}:${minutes} UTC`;

        const matchObj: LiveMatch = {
          id: `espn-${id}`,
          league: leagueName,
          country,
          homeTeam: homeComp.team.displayName,
          homeTeamLogo: homeComp.team.logo,
          awayTeam: awayComp.team.displayName,
          awayTeamLogo: awayComp.team.logo,
          homeScore: isNaN(homeScore) ? 0 : homeScore,
          awayScore: isNaN(awayScore) ? 0 : awayScore,
          status,
          statusDetail: ev.status?.type?.detail || ev.status?.type?.shortDetail || (status === 'FINISHED' ? 'FT' : status),
          time: displayTime,
          startTimeIso: ev.date,
          minute: ev.status?.clock,
          venue: comp.venue?.fullName,
          dataSource: 'ESPN Live Sports Wire (Official Real-Time Feed)',
          lastUpdated: new Date().toISOString(),
        };

        parsedMatches.push(matchObj);
      }

      // Sort matches: LIVE first, then UPCOMING (sorted by time), then FINISHED (recently finished first)
      parsedMatches.sort((a, b) => {
        const priority = { LIVE: 1, UPCOMING: 2, FINISHED: 3, POSTPONED: 4, CANCELLED: 5 };
        const diff = priority[a.status] - priority[b.status];
        if (diff !== 0) return diff;
        return new Date(b.startTimeIso).getTime() - new Date(a.startTimeIso).getTime();
      });

      this.cachedMatches = parsedMatches;
      this.lastSyncTimestamp = new Date().toISOString();
      this.syncError = null;
      this.syncCount++;

      console.log(`[SportsDataService] Synced ${parsedMatches.length} real matches successfully at ${this.lastSyncTimestamp}`);
      return { success: true, matchCount: parsedMatches.length };
    } catch (err: any) {
      console.error('[SportsDataService] Sync failed:', err.message);
      this.syncError = err.message;
      return { success: false, matchCount: this.cachedMatches.length, error: err.message };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Retrieves full real details (events, scorers, cards, team stats, lineups) for a specific match
   */
  public async getMatchDetails(matchId: string): Promise<LiveMatch | null> {
    const rawId = matchId.replace(/^espn-/, '');
    
    // Check detail cache (15s TTL)
    const cached = this.detailedMatchCache.get(rawId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const baseMatch = this.cachedMatches.find(m => m.id === matchId || m.id === `espn-${rawId}`);

    try {
      const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${rawId}`;
      const res = await fetch(summaryUrl, { headers: { 'User-Agent': 'Safe2Odds-LiveScores/2.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Extract real events
      const events: LiveMatchEvent[] = [];
      if (Array.isArray(data.keyEvents)) {
        for (const item of data.keyEvents) {
          const typeStr = item.type?.type || item.type?.text || '';
          let evtType: LiveMatchEvent['type'] = 'other';
          if (typeStr.includes('goal') || item.scoringPlay) evtType = 'goal';
          else if (typeStr.includes('yellow')) evtType = 'yellow';
          else if (typeStr.includes('red')) evtType = 'red';
          else if (typeStr.includes('sub')) evtType = 'sub';
          else if (typeStr.includes('penalty')) evtType = 'penalty';

          const teamSide = item.team?.id === data.boxscore?.teams?.[0]?.team?.id ? 'home' : 'away';

          events.push({
            id: item.id,
            minute: item.clock?.displayValue || `${Math.floor((item.clock?.value || 0) / 60)}'`,
            type: evtType,
            team: teamSide,
            player: item.text?.split('(')?.[0]?.replace(/^Goal!|^Yellow Card|^Red Card/i, '').trim() || 'Player',
            detail: item.text,
          });
        }
      }

      // Extract real team stats
      const stats = {
        home: {} as MatchTeamStats,
        away: {} as MatchTeamStats,
      };

      const homeBox = data.boxscore?.teams?.find((t: any) => t.homeAway === 'home') || data.boxscore?.teams?.[0];
      const awayBox = data.boxscore?.teams?.find((t: any) => t.homeAway === 'away') || data.boxscore?.teams?.[1];

      const parseBoxStats = (teamBox: any): MatchTeamStats => {
        if (!teamBox || !Array.isArray(teamBox.statistics)) return {};
        const s: MatchTeamStats = {};
        for (const stat of teamBox.statistics) {
          const name = stat.name?.toLowerCase() || '';
          const val = stat.displayValue || stat.value?.toString() || '';
          if (name.includes('possession')) s.possession = `${val}%`;
          else if (name === 'shots') s.shots = val;
          else if (name.includes('on goal') || name.includes('shotsontarget')) s.shotsOnTarget = val;
          else if (name.includes('fouls')) s.fouls = val;
          else if (name.includes('corner')) s.corners = val;
          else if (name.includes('yellowcard')) s.yellowCards = val;
          else if (name.includes('redcard')) s.redCards = val;
          else if (name.includes('offside')) s.offsides = val;
          else if (name.includes('save')) s.saves = val;
          else if (name === 'passes') s.passes = val;
          else if (name.includes('pass completion') || name.includes('passaccuracy')) s.passAccuracy = `${val}%`;
        }
        return s;
      };

      stats.home = parseBoxStats(homeBox);
      stats.away = parseBoxStats(awayBox);

      // Extract lineups if provided
      let lineups: MatchLineups | undefined;
      if (data.rosters && Array.isArray(data.rosters)) {
        const homeRoster = data.rosters.find((r: any) => r.homeAway === 'home') || data.rosters[0];
        const awayRoster = data.rosters.find((r: any) => r.homeAway === 'away') || data.rosters[1];

        const parseRoster = (r: any) => {
          if (!r?.roster) return { starters: [], bench: [] };
          const starters = (r.roster || []).filter((p: any) => p.starter).map((p: any) => ({
            name: p.athlete?.displayName || p.athlete?.shortName || 'Unknown',
            jersey: p.jersey,
            position: p.position?.abbreviation || p.position?.name,
            isStarter: true,
          }));
          const bench = (r.roster || []).filter((p: any) => !p.starter).map((p: any) => ({
            name: p.athlete?.displayName || p.athlete?.shortName || 'Unknown',
            jersey: p.jersey,
            position: p.position?.abbreviation || p.position?.name,
            isStarter: false,
          }));
          return { formation: r.formation, starters, bench };
        };

        lineups = {
          homeTeam: parseRoster(homeRoster),
          awayTeam: parseRoster(awayRoster),
        };
      }

      const mergedMatch: LiveMatch = {
        ...(baseMatch || {
          id: `espn-${rawId}`,
          league: data.header?.league?.name || 'International Soccer',
          country: 'World',
          homeTeam: homeBox?.team?.displayName || 'Home Team',
          homeTeamLogo: homeBox?.team?.logo,
          awayTeam: awayBox?.team?.displayName || 'Away Team',
          awayTeamLogo: awayBox?.team?.logo,
          homeScore: parseInt(homeBox?.score || '0', 10),
          awayScore: parseInt(awayBox?.score || '0', 10),
          status: data.header?.competitions?.[0]?.status?.type?.completed ? 'FINISHED' : 'LIVE',
          statusDetail: data.header?.competitions?.[0]?.status?.type?.detail || 'FT',
          time: 'FT',
          startTimeIso: data.header?.competitions?.[0]?.date || new Date().toISOString(),
          dataSource: 'ESPN Live Sports Wire (Official Real-Time Feed)',
          lastUpdated: new Date().toISOString(),
        }),
        events: events.length > 0 ? events : baseMatch?.events,
        stats: (Object.keys(stats.home).length > 0 || Object.keys(stats.away).length > 0) ? stats : baseMatch?.stats,
        lineups: lineups || baseMatch?.lineups,
        venue: data.gameInfo?.venue?.fullName || baseMatch?.venue,
        lastUpdated: new Date().toISOString(),
      };

      // Cache for 15 seconds
      this.detailedMatchCache.set(rawId, {
        data: mergedMatch,
        expiresAt: Date.now() + 15 * 1000,
      });

      return mergedMatch;
    } catch (err: any) {
      console.warn(`[SportsDataService] Could not fetch detailed summary for match ${rawId}:`, err.message);
      return baseMatch || null;
    }
  }

  public getMatches(filter?: {
    status?: 'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
    league?: string;
    search?: string;
  }): {
    matches: LiveMatch[];
    lastUpdated: string;
    total: number;
    liveCount: number;
    upcomingCount: number;
    finishedCount: number;
    isSyncing: boolean;
    error: string | null;
  } {
    let result = [...this.cachedMatches];

    if (filter) {
      if (filter.status && filter.status !== 'ALL') {
        result = result.filter(m => m.status === filter.status);
      }
      if (filter.league && filter.league !== 'ALL') {
        result = result.filter(m => m.league.toLowerCase() === filter.league?.toLowerCase());
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase();
        result = result.filter(
          m =>
            m.homeTeam.toLowerCase().includes(q) ||
            m.awayTeam.toLowerCase().includes(q) ||
            m.league.toLowerCase().includes(q) ||
            m.country.toLowerCase().includes(q)
        );
      }
    }

    const liveCount = this.cachedMatches.filter(m => m.status === 'LIVE').length;
    const upcomingCount = this.cachedMatches.filter(m => m.status === 'UPCOMING').length;
    const finishedCount = this.cachedMatches.filter(m => m.status === 'FINISHED').length;

    return {
      matches: result,
      lastUpdated: this.lastSyncTimestamp || new Date().toISOString(),
      total: this.cachedMatches.length,
      liveCount,
      upcomingCount,
      finishedCount,
      isSyncing: this.syncInProgress,
      error: this.syncError,
    };
  }
}

export const sportsDataService = SportsDataService.getInstance();
