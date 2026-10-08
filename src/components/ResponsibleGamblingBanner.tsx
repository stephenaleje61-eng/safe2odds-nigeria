import React from 'react';
import { ShieldAlert, PhoneCall } from 'lucide-react';

interface Props {
  text?: string;
  compact?: boolean;
}

export const ResponsibleGamblingBanner: React.FC<Props> = ({ text, compact = false }) => {
  const disclaimerText = text || '18+ Bet Responsibly. Betting involves financial risk. 2 Sure Odd Football does not guarantee winning bets, fixed matches, or guaranteed profits. Our predictions are for informational and entertainment purposes only.';

  if (compact) {
    return (
      <div className="bg-red-950/60 border border-red-700/40 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2.5">
        <span className="font-black text-white bg-red-600 px-1.5 py-0.5 rounded text-[11px] shrink-0">18+</span>
        <p className="leading-relaxed text-red-300 text-[11px] sm:text-xs">
          {disclaimerText}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#090C12] text-white border-y border-red-950/40 py-2.5 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="inline-flex items-center justify-center font-black text-[11px] bg-red-600 text-white rounded px-1.5 py-0.5 shrink-0 shadow-xs">
            18+
          </span>
          <p className="leading-snug text-gray-400 text-[11px] sm:text-xs max-w-4xl">
            {disclaimerText}
          </p>
        </div>
        <div className="flex items-center gap-2 text-red-400 shrink-0 text-[11px] font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          <span>Strictly Statistical Entertainment</span>
        </div>
      </div>
    </div>
  );
};
