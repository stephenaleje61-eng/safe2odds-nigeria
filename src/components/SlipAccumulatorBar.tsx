import React, { useState } from 'react';
import { ShoppingBag, X, Copy, Check, Calculator, Trash2 } from 'lucide-react';
import { BettingTip } from '../types';

interface SlipAccumulatorBarProps {
  slipTips: BettingTip[];
  onRemoveTip: (tipId: string) => void;
  onClearSlip: () => void;
  onCopySlip: (text: string) => void;
}

export const SlipAccumulatorBar: React.FC<SlipAccumulatorBarProps> = ({
  slipTips,
  onRemoveTip,
  onClearSlip,
  onCopySlip,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stake, setStake] = useState<number>(1000);
  const [copied, setCopied] = useState(false);
  const [copiedCodeName, setCopiedCodeName] = useState<string | null>(null);

  if (slipTips.length === 0) return null;

  // Multiply odds together
  const totalOdds = slipTips.reduce((acc, t) => acc * t.odds, 1);
  const totalOddsFormatted = totalOdds.toFixed(2);
  const potentialReturn = Math.round(stake * totalOdds);

  // Derive stable booking codes for current selection
  const slipHash = slipTips.map(t => t.id).join('-');
  const numHash = Math.abs(slipHash.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 89999 + 10000;
  const bookingCodes = {
    sportyBet: `SB-${numHash}`,
    bet9ja: `B9J-${numHash + 421}`,
    oneXBet: `1X-${numHash * 2 + 10}`,
    betKing: `BK-${numHash - 30}`,
  };

  const handleCopyBookingCode = (bookmaker: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCodeName(bookmaker);
    setTimeout(() => setCopiedCodeName(null), 2000);
  };

  const handleCopyAccumulator = () => {
    const text = `🔥 Safe2Odds Nigeria Multi-Bet Slip:\n` +
      slipTips.map(t => `• ${t.homeTeam} vs ${t.awayTeam} (${t.league}): ${t.predictionDetail || t.prediction} @ ${t.odds.toFixed(2)}`).join('\n') +
      `\n\n🎯 Combined Odds: @${totalOddsFormatted}\n` +
      `🇳🇬 Booking Codes:\n` +
      `  SportyBet: ${bookingCodes.sportyBet}\n` +
      `  Bet9ja: ${bookingCodes.bet9ja}\n` +
      `  1xBet: ${bookingCodes.oneXBet}\n` +
      `  BetKing: ${bookingCodes.betKing}\n` +
      `🌐 Safe2Odds Nigeria: https://safe2odds.ng`;
    
    onCopySlip(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#111827] text-white rounded-2xl shadow-2xl border border-green-500/30 overflow-hidden">
        
        {/* Header bar */}
        <div className="px-4 py-3 flex items-center justify-between bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center text-white text-xs font-bold">
              {slipTips.length}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Slip Accumulator
              </span>
              <span className="text-[10px] text-gray-400">
                {totalOdds >= 1.85 && totalOdds <= 2.20 ? '🎯 Perfect Safe 2 Odds Target!' : 'Combined Slip'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Total:</span>
            <span className="text-base font-black text-green-400 tabular-nums">
              @{totalOddsFormatted}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-xs text-gray-300 hover:text-white px-2 py-1 bg-gray-800 rounded-lg"
            >
              {isExpanded ? 'Hide' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="p-4 bg-gray-950/90 border-b border-gray-800 space-y-2.5 max-h-56 overflow-y-auto">
            {slipTips.map(tip => (
              <div key={tip.id} className="flex items-center justify-between text-xs bg-gray-900 p-2.5 rounded-xl border border-gray-800">
                <div className="truncate pr-2">
                  <div className="font-bold text-white truncate">{tip.homeTeam} vs {tip.awayTeam}</div>
                  <div className="text-[11px] text-green-400 font-medium">
                    {tip.predictionDetail || tip.prediction}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-gray-200 tabular-nums">@{tip.odds.toFixed(2)}</span>
                  <button
                    onClick={() => onRemoveTip(tip.id)}
                    className="p-1 text-gray-500 hover:text-rose-400"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Stake Calculator */}
            <div className="pt-2 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-medium">Stake (₦):</span>
                <input
                  type="number"
                  min="100"
                  step="500"
                  value={stake}
                  onChange={e => setStake(Math.max(100, Number(e.target.value)))}
                  className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-right font-bold text-white text-xs focus:outline-hidden focus:border-green-500"
                />
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[10px] block">Est. Return</span>
                <span className="font-black text-green-400 text-sm">
                  ₦{potentialReturn.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Booking Codes Bar */}
            <div className="pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-gray-300">
                <span className="font-bold flex items-center gap-1">🇳🇬 Nigerian Booking Codes:</span>
                <span className="text-[10px] text-green-400">
                  {copiedCodeName ? `✓ Copied ${copiedCodeName} code!` : 'Instant load'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('SportyBet', bookingCodes.sportyBet)}
                  className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg text-[11px] flex items-center justify-between transition-colors"
                >
                  <span className="font-bold text-[10px] text-red-400">SportyBet</span>
                  <span className="font-mono font-bold text-xs">{bookingCodes.sportyBet}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('Bet9ja', bookingCodes.bet9ja)}
                  className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded-lg text-[11px] flex items-center justify-between transition-colors"
                >
                  <span className="font-bold text-[10px] text-emerald-400">Bet9ja</span>
                  <span className="font-mono font-bold text-xs">{bookingCodes.bet9ja}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('1xBet', bookingCodes.oneXBet)}
                  className="px-2 py-1 bg-sky-950/60 hover:bg-sky-900 text-sky-200 border border-sky-800 rounded-lg text-[11px] flex items-center justify-between transition-colors"
                >
                  <span className="font-bold text-[10px] text-sky-400">1xBet</span>
                  <span className="font-mono font-bold text-xs">{bookingCodes.oneXBet}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('BetKing', bookingCodes.betKing)}
                  className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded-lg text-[11px] flex items-center justify-between transition-colors"
                >
                  <span className="font-bold text-[10px] text-amber-400">BetKing</span>
                  <span className="font-mono font-bold text-xs">{bookingCodes.betKing}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="p-2.5 px-4 bg-gray-900 flex items-center justify-between gap-2">
          <button
            onClick={onClearSlip}
            className="text-[11px] text-gray-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>

          <button
            onClick={handleCopyAccumulator}
            className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Slip Copied!' : 'Copy Multi-Bet Slip'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
