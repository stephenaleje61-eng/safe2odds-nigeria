import React from 'react';
import { ShieldCheck, MessageCircle, ArrowRight, TrendingUp, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';
import { AppSettings, BettingTip } from '../types';

interface HeroSectionProps {
  settings: AppSettings;
  todayTips: BettingTip[];
  stats: {
    won: number;
    lost: number;
    winRate: number;
    netOddsFormatted: string;
  };
  onViewTips: () => void;
  onJoinWhatsApp: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  todayTips,
  stats,
  onViewTips,
  onJoinWhatsApp,
}) => {
  // Compute combined odds of the top 2 today's pending safe selections
  const safePicks = todayTips.filter(t => !t.isVip && t.status === 'Pending').slice(0, 2);
  const combinedCalculatedOdds = safePicks.length >= 2 
    ? (safePicks[0].odds * safePicks[1].odds).toFixed(2)
    : settings.targetOdds.toFixed(2);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#090C12] via-[#0E121A] to-[#0B0E14] text-white">
      {/* Background Image with Dark Red/Black Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_football_stadium_1791379697899.jpg"
          alt="Football stadium under lights"
          className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/90 to-[#090C12]/80" />
      </div>

      {/* Decorative Red Light Leaks */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-600/40 text-red-300 text-xs font-bold mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Worldwide Match Coverage · 100% Real Live Data</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white mb-4 text-balance">
              Welcome to <span className="text-white">2 Sure Odd</span> <span className="text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]">Football</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed mb-8">
              Verified mathematical match predictions, live worldwide soccer scores, and real-time public banter. Reliable odds, zero simulated data.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto mb-8">
              <button
                onClick={onViewTips}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-red-700/30 transition-transform active:scale-95 border border-red-500/30"
              >
                <span>View Today's Tips</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={settings.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onJoinWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-red-400 fill-current" />
                <span>Join WhatsApp Community</span>
              </a>
            </div>

            {/* Verified Statistics Bar (Adjacency proof) */}
            <div className="w-full pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Last 7 Days Won
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
                  {stats.won} Tips
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Settled Losses
                </span>
                <span className="text-xl sm:text-2xl font-black text-gray-400 tabular-nums">
                  {stats.lost}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Win Rate
                </span>
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                  {stats.winRate}%
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Net Profit Impact
                </span>
                <span className="text-xl sm:text-2xl font-black text-red-400 tabular-nums">
                  {stats.netOddsFormatted}
                </span>
              </div>
            </div>

          </div>

          {/* Right Card: Today's Featured 2-Odds Combination Ticket */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-[#161C26] via-[#121620] to-[#0E121A] border-2 border-red-600/30 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Today's Banker Slip
                    </h3>
                    <span className="text-[11px] text-gray-400">Verified Mathematical Selection</span>
                  </div>
                </div>
                
                {/* Target Odds Badge */}
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">Target Odds</span>
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                    @{combinedCalculatedOdds}
                  </span>
                </div>
              </div>

              {/* Match Slips preview */}
              <div className="space-y-3 mb-5">
                {safePicks.map((tip) => (
                  <div key={tip.id} className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                        <span className="text-red-400 font-extrabold">{tip.league}</span>
                        <span>·</span>
                        <span>Today {tip.time}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-black text-white">
                        {tip.homeTeam} vs {tip.awayTeam}
                      </div>
                      <div className="text-xs text-gray-300 font-medium mt-0.5">
                        Pick: <span className="text-red-300 font-bold">{tip.predictionDetail || tip.prediction}</span>
                      </div>
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <span className="text-xs font-black text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 tabular-nums">
                        @{tip.odds.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slip Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="text-gray-400">
                  <span className="text-white font-bold">{safePicks.length} Games</span> combined
                </div>
                <button
                  onClick={onViewTips}
                  className="font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors"
                >
                  View full analysis & copy <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
