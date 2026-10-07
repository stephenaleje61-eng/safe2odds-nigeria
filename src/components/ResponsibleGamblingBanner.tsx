import React from 'react';
import { ShieldAlert, PhoneCall } from 'lucide-react';

interface Props {
  text?: string;
  compact?: boolean;
}

export const ResponsibleGamblingBanner: React.FC<Props> = ({ text, compact = false }) => {
  const disclaimerText = text || '18+ Bet Responsibly. Betting involves financial risk. Safe2Odds does not guarantee winning bets, fixed matches, or guaranteed profits. Our predictions are for informational and entertainment purposes only.';

  if (compact) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <span className="font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded text-[11px] shrink-0">18+</span>
        <p className="leading-relaxed text-amber-800 text-[11px] sm:text-xs">
          {disclaimerText}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111827] text-white border-y border-gray-800 py-3 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-300">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="inline-flex items-center justify-center font-extrabold text-[11px] bg-red-600 text-white rounded px-1.5 py-0.5 shrink-0">
            18+
          </span>
          <p className="leading-snug text-gray-300 text-[11px] sm:text-xs max-w-4xl">
            {disclaimerText}
          </p>
        </div>
        <div className="flex items-center gap-2 text-green-400 shrink-0 text-[11px] font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-green-400" />
          <span>Strictly Entertainment</span>
        </div>
      </div>
    </div>
  );
};
