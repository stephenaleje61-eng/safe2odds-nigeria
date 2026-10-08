import React from 'react';
import { ExternalLink, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface SportsbookSpacesProps {
  onOpenBookingModal?: (bookmaker: string) => void;
}

export const SportsbookSpaces: React.FC<SportsbookSpacesProps> = () => {
  const books = [
    {
      id: 'sportybet',
      name: 'SportyBet',
      officialUrl: 'https://www.sportybet.com',
      badgeColor: 'bg-red-600 text-white',
      accentBorder: 'border-red-600/40 hover:border-red-500',
      description: 'Official SportyBet sports betting portal. Enter Safe2Odds booking codes directly on your slip.',
      tag: 'Worldwide & Africa',
      features: ['Fast Code Loading', 'Instant Payouts', 'Cashout Available'],
    },
    {
      id: 'bet9ja',
      name: 'Bet9ja',
      officialUrl: 'https://register.bet9ja.com',
      badgeColor: 'bg-emerald-700 text-white',
      accentBorder: 'border-emerald-600/30 hover:border-emerald-500',
      description: 'Premier certified gaming operator. Direct booking code synchronization supported.',
      tag: 'Fully Licensed',
      features: ['Official Odds Slip', 'Multiple Bonus', 'Retail & Online'],
    },
    {
      id: 'msport',
      name: 'MSport',
      officialUrl: 'https://www.msport.com',
      badgeColor: 'bg-amber-600 text-white',
      accentBorder: 'border-amber-600/30 hover:border-amber-500',
      description: 'Legitimate international sportsbook with competitive margins on 2-odds accumulator selections.',
      tag: 'Worldwide Coverage',
      features: ['High Odds Matchups', 'Live Betting', 'Welcome Bonus'],
    },
    {
      id: 'football_com',
      name: 'Football.com',
      officialUrl: 'https://www.football.com',
      badgeColor: 'bg-blue-700 text-white',
      accentBorder: 'border-blue-600/30 hover:border-blue-500',
      description: 'Dedicated football gaming destination with deep statistical coverage and global leagues.',
      tag: 'Global Platform',
      features: ['Comprehensive Stats', 'Accumulator Boost', 'Secure Verification'],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-[#141923] p-5 sm:p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Verified Bookmaker Portals
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            Dedicated spaces for SportyBet, Bet9ja, MSport, and Football.com. Use official links only.
          </p>
        </div>

        {/* Regulatory Disclosure */}
        <div className="bg-red-950/70 border border-red-700/50 text-red-200 px-3.5 py-2 rounded-2xl text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Independent verification. We are not bookmakers and do not handle betting deposits.</span>
        </div>
      </div>

      {/* Bookmaker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {books.map(book => (
          <div
            key={book.id}
            className={`bg-[#0E121A] rounded-2xl border p-5 shadow-md flex flex-col justify-between transition-all hover:shadow-xl ${book.accentBorder}`}
          >
            <div>
              {/* Header badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wide ${book.badgeColor}`}>
                  {book.name}
                </span>
                <span className="text-[10px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {book.tag}
                </span>
              </div>

              <p className="text-xs text-gray-300 mb-4 leading-relaxed font-normal">
                {book.description}
              </p>

              {/* Bullet Features */}
              <div className="space-y-1.5 mb-5 text-[11px] text-gray-400">
                {book.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official External Link Button */}
            <a
              href={book.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-black py-2.5 px-4 rounded-xl border border-white/15 transition-all active:scale-95 shadow-sm"
            >
              <span>Visit Official {book.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
