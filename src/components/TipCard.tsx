import React, { useState } from 'react';
import { 
  Copy, 
  Share2, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Twitter,
  Facebook,
  Plus,
  Trash2,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { BettingTip } from '../types';

interface TipCardProps {
  tip: BettingTip;
  onCopyTip: (tip: BettingTip) => void;
  onShareTip: (tip: BettingTip, platform: 'whatsapp' | 'twitter' | 'facebook' | 'copy') => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (tipId: string) => void;
  isInSlip?: boolean;
  onToggleSlip?: (tip: BettingTip) => void;
}

export const TipCard: React.FC<TipCardProps> = ({
  tip,
  onCopyTip,
  onShareTip,
  isBookmarked = false,
  onToggleBookmark,
  isInSlip = false,
  onToggleSlip,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeName, setCopiedCodeName] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState(false);

  const handleCopy = () => {
    onCopyTip(tip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBookingCode = (bookmaker: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCodeName(bookmaker);
    setTimeout(() => setCopiedCodeName(null), 2000);
  };

  const getStatusBadge = () => {
    switch (tip.status) {
      case 'Won':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Won {tip.resultScore ? `(${tip.resultScore})` : ''}
          </span>
        );
      case 'Lost':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-black text-red-400 bg-red-950/80 border border-red-500/50 px-2.5 py-1 rounded-lg">
            <XCircle className="w-3.5 h-3.5 text-red-400" /> Lost {tip.resultScore ? `(${tip.resultScore})` : ''}
          </span>
        );
      case 'Void':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-black text-gray-300 bg-gray-900 border border-gray-700 px-2.5 py-1 rounded-lg">
            <MinusCircle className="w-3.5 h-3.5 text-gray-400" /> Void {tip.resultScore ? `(${tip.resultScore})` : ''}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Pending
          </span>
        );
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
      tip.status === 'Won' 
        ? 'border-emerald-600/50 bg-gradient-to-b from-[#111C18] to-[#0E1219]' 
        : 'border-white/10 hover:border-red-600/40 bg-gradient-to-b from-[#141923] to-[#0E121A]'
    }`}>
      {/* Top Header: League, Match Date/Time, and Status */}
      <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-extrabold text-red-400">{tip.league}</span>
          <span aria-hidden="true" className="text-gray-600">·</span>
          <span className="flex items-center gap-1 text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /> {tip.date}
          </span>
          <span aria-hidden="true" className="text-gray-600">·</span>
          <span className="flex items-center gap-1 text-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> {tip.time}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Match Info & Odds */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {/* Teams */}
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {tip.homeTeam} <span className="text-red-500 font-normal">vs</span> {tip.awayTeam}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-gray-400">Market:</span>
              <span className="text-xs font-bold text-gray-200 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                {tip.prediction}
              </span>
            </div>
          </div>

          {/* Odds & Prediction Highlight Box */}
          <div className="bg-gradient-to-br from-red-950/80 to-black border border-red-600/40 rounded-xl p-3 sm:text-right shrink-0 shadow-md">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-red-300">
              Prediction
            </span>
            <span className="text-sm font-black text-white block">
              {tip.predictionDetail || tip.prediction}
            </span>
            <span className="inline-block mt-0.5 text-base sm:text-lg font-black text-red-400 tabular-nums">
              @{tip.odds.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Short Analysis */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
            {expandedAnalysis || tip.analysis.length <= 130
              ? tip.analysis
              : `${tip.analysis.slice(0, 130)}...`}
          </p>
          {tip.analysis.length > 130 && (
            <button
              onClick={() => setExpandedAnalysis(!expandedAnalysis)}
              className="text-xs font-bold text-red-400 hover:text-red-300 mt-1 inline-flex items-center gap-0.5"
            >
              {expandedAnalysis ? 'Show less' : 'Read full analysis'}
              {expandedAnalysis ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Bookmaker Booking Codes */}
        {tip.bookingCodes && (
          <div className="mb-3 pt-2.5 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-gray-300 flex items-center gap-1">
                <span>Load Booking Code:</span>
              </span>
              <span className="text-[10px] text-gray-400">
                {copiedCodeName ? `✓ Copied ${copiedCodeName} code!` : 'Click code to copy'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {tip.bookingCodes.sportyBet && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('SportyBet', tip.bookingCodes!.sportyBet!)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-white border border-red-700/50 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy SportyBet Booking Code"
                >
                  <span className="font-bold text-[10px] text-red-400">SportyBet</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.sportyBet}</span>
                </button>
              )}
              {tip.bookingCodes.bet9ja && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('Bet9ja', tip.bookingCodes!.bet9ja!)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-white border border-emerald-700/50 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy Bet9ja Booking Code"
                >
                  <span className="font-bold text-[10px] text-emerald-400">Bet9ja</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.bet9ja}</span>
                </button>
              )}
              {tip.bookingCodes.oneXBet && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('1xBet', tip.bookingCodes!.oneXBet!)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-sky-950/60 hover:bg-sky-900/80 text-white border border-sky-700/50 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy 1xBet Booking Code"
                >
                  <span className="font-bold text-[10px] text-sky-400">1xBet</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.oneXBet}</span>
                </button>
              )}
              {tip.bookingCodes.betKing && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('MSport', tip.bookingCodes!.betKing!)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-white border border-amber-700/50 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy MSport Booking Code"
                >
                  <span className="font-bold text-[10px] text-amber-400">MSport</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.betKing}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons: COPY TIP | SHARE | ADD TO SLIP */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            {/* COPY TIP BUTTON */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY TIP'}</span>
            </button>

            {/* SHARE BUTTON with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-gray-200 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </button>

              {showShareMenu && (
                <div className="absolute left-0 bottom-full mb-2 z-30 bg-[#141923] border border-white/20 rounded-xl shadow-2xl p-1.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      onShareTip(tip, 'whatsapp');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-red-600/20 hover:text-red-300 rounded-lg text-left"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareTip(tip, 'twitter');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-red-600/20 hover:text-red-300 rounded-lg text-left"
                  >
                    <Twitter className="w-4 h-4 text-sky-400 fill-current" />
                    <span>X (Twitter)</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareTip(tip, 'facebook');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-red-600/20 hover:text-red-300 rounded-lg text-left"
                  >
                    <Facebook className="w-4 h-4 text-blue-400 fill-current" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareTip(tip, 'copy');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-white/10 rounded-lg text-left border-t border-white/10 mt-1"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span>Copy Share Link</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Add to Accumulator Slip */}
            {onToggleSlip && (
              <button
                onClick={() => onToggleSlip(tip)}
                title={isInSlip ? 'Remove from slip' : 'Add to 2-Odds Slip'}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                  isInSlip 
                    ? 'bg-red-950/80 text-red-300 border border-red-500/50' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {isInSlip ? <Check className="w-3.5 h-3.5 text-red-400" /> : <Plus className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isInSlip ? 'In Slip' : 'Add to Slip'}</span>
              </button>
            )}

            {/* Bookmark button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(tip.id)}
                title={isBookmarked ? 'Saved' : 'Save Tip'}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-red-500 fill-red-500" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
