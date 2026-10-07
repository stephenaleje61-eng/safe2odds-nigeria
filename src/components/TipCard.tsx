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
  Trash2
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
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300/60 px-2.5 py-0.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Won {tip.resultScore ? `(${tip.resultScore})` : ''}
          </span>
        );
      case 'Lost':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300/60 px-2.5 py-0.5 rounded-md">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Lost {tip.resultScore ? `(${tip.resultScore})` : ''}
          </span>
        );
      case 'Void':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300/60 px-2.5 py-0.5 rounded-md">
            <MinusCircle className="w-3.5 h-3.5 text-gray-500" /> Void {tip.resultScore ? `(${tip.resultScore})` : ''}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300/60 px-2.5 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
      tip.status === 'Won' 
        ? 'border-emerald-300/80 bg-gradient-to-b from-emerald-50/20 to-white' 
        : tip.isVip 
        ? 'border-amber-300 bg-amber-50/10' 
        : 'border-gray-200'
    }`}>
      {/* Top Header: League, Match Date/Time, and Status */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-bold text-green-700">{tip.league}</span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-3 h-3" /> {tip.date}
          </span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" /> {tip.time}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tip.isVip && (
            <span className="text-[10px] uppercase font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded tracking-wider">
              VIP
            </span>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Match Info & Odds */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {/* Teams */}
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] tracking-tight">
              {tip.homeTeam} <span className="text-gray-400 font-normal">vs</span> {tip.awayTeam}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-gray-500">Market:</span>
              <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                {tip.prediction}
              </span>
            </div>
          </div>

          {/* Odds & Prediction Highlight Box */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/80 rounded-xl p-3 sm:text-right shrink-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-green-800">
              Prediction
            </span>
            <span className="text-sm font-extrabold text-green-900 block">
              {tip.predictionDetail || tip.prediction}
            </span>
            <span className="inline-block mt-0.5 text-base sm:text-lg font-black text-[#15803D] tabular-nums">
              @{tip.odds.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Short Analysis */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            {expandedAnalysis || tip.analysis.length <= 130
              ? tip.analysis
              : `${tip.analysis.slice(0, 130)}...`}
          </p>
          {tip.analysis.length > 130 && (
            <button
              onClick={() => setExpandedAnalysis(!expandedAnalysis)}
              className="text-xs font-semibold text-green-700 hover:text-green-800 mt-1 inline-flex items-center gap-0.5"
            >
              {expandedAnalysis ? 'Show less' : 'Read full analysis'}
              {expandedAnalysis ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Nigerian Bookmaker Booking Codes */}
        {tip.bookingCodes && (
          <div className="mb-3 pt-2.5 border-t border-gray-100">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <span>🇳🇬 Load Booking Code:</span>
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
                  className="flex items-center justify-between px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200/80 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy SportyBet Booking Code"
                >
                  <span className="font-bold text-[10px] text-red-700">SportyBet</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.sportyBet}</span>
                </button>
              )}
              {tip.bookingCodes.bet9ja && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('Bet9ja', tip.bookingCodes!.bet9ja!)}
                  className="flex items-center justify-between px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy Bet9ja Booking Code"
                >
                  <span className="font-bold text-[10px] text-emerald-700">Bet9ja</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.bet9ja}</span>
                </button>
              )}
              {tip.bookingCodes.oneXBet && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('1xBet', tip.bookingCodes!.oneXBet!)}
                  className="flex items-center justify-between px-2 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy 1xBet Booking Code"
                >
                  <span className="font-bold text-[10px] text-sky-700">1xBet</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.oneXBet}</span>
                </button>
              )}
              {tip.bookingCodes.betKing && (
                <button
                  type="button"
                  onClick={() => handleCopyBookingCode('BetKing', tip.bookingCodes!.betKing!)}
                  className="flex items-center justify-between px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                  title="Copy BetKing Booking Code"
                >
                  <span className="font-bold text-[10px] text-amber-700">BetKing</span>
                  <span className="font-mono font-bold text-xs">{tip.bookingCodes.betKing}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons: COPY TIP | SHARE | ADD TO SLIP */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            {/* COPY TIP BUTTON */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs active:scale-95'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY TIP'}</span>
            </button>

            {/* SHARE BUTTON with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </button>

              {showShareMenu && (
                <div className="absolute left-0 bottom-full mb-2 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      onShareTip(tip, 'whatsapp');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-lg text-left"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600 fill-current" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareTip(tip, 'twitter');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-800 rounded-lg text-left"
                  >
                    <Twitter className="w-4 h-4 text-blue-500 fill-current" />
                    <span>X (Twitter)</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareTip(tip, 'facebook');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-800 rounded-lg text-left"
                  >
                    <Facebook className="w-4 h-4 text-blue-600 fill-current" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareTip(tip, 'copy');
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left border-t border-gray-100 mt-1"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
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
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {isInSlip ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isInSlip ? 'In Slip' : 'Add to Slip'}</span>
              </button>
            )}

            {/* Bookmark button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(tip.id)}
                title={isBookmarked ? 'Saved' : 'Save Tip'}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-green-600 fill-green-600" />
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
