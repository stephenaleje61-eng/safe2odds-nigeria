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
      accentBorder: 'hover:border-red-500',
      description: 'Official SportyBet sports betting portal. Enter Safe2Odds booking codes directly on your slip.',
      tag: 'Popular in Nigeria & Ghana',
      features: ['Fast Code Loading', 'Instant Payouts', 'Cashout Available'],
    },
    {
      id: 'bet9ja',
      name: 'Bet9ja',
      officialUrl: 'https://register.bet9ja.com',
      badgeColor: 'bg-emerald-700 text-white',
      accentBorder: 'hover:border-emerald-600',
      description: 'Nigeria’s premier gaming operator. Direct booking code synchronization supported.',
      tag: 'Licensed in Nigeria',
      features: ['Official Odds Slip', 'Multiple Bonus', 'Retail & Online'],
    },
    {
      id: 'msport',
      name: 'MSport',
      officialUrl: 'https://www.msport.com',
      badgeColor: 'bg-amber-600 text-white',
      accentBorder: 'hover:border-amber-500',
      description: 'Legitimate international sportsbook with competitive margins on 2-odds accumulator selections.',
      tag: 'Worldwide Coverage',
      features: ['High Odds Matchups', 'Live Betting', 'Welcome Bonus'],
    },
    {
      id: 'football_com',
      name: 'Football.com',
      officialUrl: 'https://www.football.com',
      badgeColor: 'bg-blue-700 text-white',
      accentBorder: 'hover:border-blue-600',
      description: 'Dedicated football gaming destination with deep statistical coverage and global leagues.',
      tag: 'Global Platform',
      features: ['Comprehensive Stats', 'Accumulator Boost', 'Secure Verification'],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Verified Bookmaker Portals
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Dedicated spaces for SportyBet, Bet9ja, MSport, and Football.com. Use official links only.
          </p>
        </div>

        {/* Regulatory Disclosure */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-2xl text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Independent verification. We are not bookmakers and do not handle betting deposits.</span>
        </div>
      </div>

      {/* Bookmaker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {books.map(book => (
          <div
            key={book.id}
            className={`bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${book.accentBorder}`}
          >
            <div>
              {/* Header badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wide ${book.badgeColor}`}>
                  {book.name}
                </span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {book.tag}
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {book.description}
              </p>

              {/* Bullet Features */}
              <div className="space-y-1.5 mb-5 text-[11px] text-gray-500">
                {book.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
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
