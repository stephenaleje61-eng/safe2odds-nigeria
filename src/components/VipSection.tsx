import React, { useState } from 'react';
import { Sparkles, Crown, Check, ShieldCheck, Lock, Unlock, MessageCircle, CreditCard, ArrowRight } from 'lucide-react';
import { BettingTip, AppSettings, UserAccount } from '../types';
import { TipCard } from './TipCard';

interface VipSectionProps {
  vipTips: BettingTip[];
  settings: AppSettings;
  userSession: UserAccount | null;
  onCopyTip: (tip: BettingTip) => void;
  onShareTip: (tip: BettingTip, platform: 'whatsapp' | 'twitter' | 'facebook' | 'copy') => void;
  onUpgradeToVip: () => void;
}

export const VipSection: React.FC<VipSectionProps> = ({
  vipTips,
  settings,
  userSession,
  onCopyTip,
  onShareTip,
  onUpgradeToVip,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const isVipUnlocked = Boolean(userSession?.isVip);

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowCheckoutModal(false);
      onUpgradeToVip();
    }, 1500);
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner for VIP */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-emerald-950 to-gray-950 text-white rounded-3xl border border-amber-500/30 shadow-2xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Safe2Odds Premium Members Club</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Premium Football Tips & Elite Banker Slips
            </h2>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              Deeper statistical breakdown, high-confidence tactical setups, and exclusive VIP community updates curated by our quantitative sports analysts.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!isVipUnlocked ? (
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  <Crown className="w-4 h-4" />
                  <span>Join VIP Club Today</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>VIP Access Active on Your Account</span>
                </div>
              )}

              <a
                href={settings.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-white/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl">
              <img
                src="/src/assets/images/vip_club_crest_1791379729058.jpg"
                alt="VIP Club Trophy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold text-amber-300">
                Exclusive Statistical Models
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      {!isVipUnlocked && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Weekly Pass */}
          <div 
            onClick={() => setSelectedPlan('weekly')}
            className={`cursor-pointer rounded-3xl p-6 border transition-all ${
              selectedPlan === 'weekly'
                ? 'bg-white border-green-600 ring-2 ring-green-600/20 shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Pass</span>
                <h3 className="text-xl font-black text-gray-900">7-Day VIP Access</h3>
              </div>
              <span className="text-2xl font-black text-gray-900 tabular-nums">
                {settings.vipPriceWeekly}
              </span>
            </div>
            <ul className="text-xs text-gray-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Daily curated VIP safe accumulator tips
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Priority notifications via Telegram / WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Full statistical match analysis breakdown
              </li>
            </ul>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gray-100 hover:bg-green-600 hover:text-white text-gray-800 transition-colors"
            >
              Select Weekly Plan
            </button>
          </div>

          {/* Monthly Pass (Popular) */}
          <div 
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer rounded-3xl p-6 border transition-all relative overflow-hidden ${
              selectedPlan === 'monthly'
                ? 'bg-gradient-to-br from-green-50/50 via-white to-gray-50 border-green-600 ring-2 ring-green-600/30 shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute top-0 right-0 bg-amber-500 text-gray-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Most Popular
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-green-700 tracking-wider">VIP Club</span>
                <h3 className="text-xl font-black text-gray-900">30-Day VIP Pass</h3>
              </div>
              <span className="text-2xl font-black text-green-700 tabular-nums">
                {settings.vipPriceMonthly}
              </span>
            </div>
            <ul className="text-xs text-gray-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Complete 30-day coverage of all major leagues
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Direct VIP Concierge WhatsApp support
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Save ₦2,000 compared to weekly renewal
              </li>
            </ul>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-green-600 text-white hover:bg-green-700 transition-colors shadow-xs"
            >
              Get 30-Day Pass
            </button>
          </div>
        </div>
      )}

      {/* VIP Tips List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              Today's VIP Selections ({vipTips.length})
            </h3>
            <p className="text-xs text-gray-500">
              Handpicked games reserved for VIP subscribers.
            </p>
          </div>

          {!isVipUnlocked && (
            <button
              onClick={onUpgradeToVip}
              className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
            >
              <Unlock className="w-3.5 h-3.5" /> Demo Instant Unlock
            </button>
          )}
        </div>

        {vipTips.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <p className="text-xs text-gray-500">No VIP tips posted for today yet. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vipTips.map(tip => (
              <div key={tip.id} className="relative">
                {/* If locked, overlay lock screen */}
                {!isVipUnlocked ? (
                  <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        VIP MATCH LOCK
                      </span>
                      <span className="text-xs text-gray-400">{tip.league} · Today {tip.time}</span>
                    </div>

                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-gray-900 mb-1">
                        {tip.homeTeam} vs {tip.awayTeam}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                        High-confidence tactical prediction (@{tip.odds.toFixed(2)} Odds) reserved for VIP subscribers.
                      </p>
                      <button
                        onClick={() => setShowCheckoutModal(true)}
                        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs px-4 py-2 rounded-xl transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5" /> Unlock VIP Slip
                      </button>
                    </div>
                  </div>
                ) : (
                  <TipCard
                    tip={tip}
                    onCopyTip={onCopyTip}
                    onShareTip={onShareTip}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strict disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 text-center">
        <strong className="font-bold text-gray-800">VIP Transparency Policy:</strong> Safe2Odds does not claim 100% guarantees or fixed games. VIP selections are backed by deeper statistical quantitative analysis, but sports events always carry financial variance. Bet responsibly (18+).
      </div>

      {/* Subscription Checkout Modal (Paystack / Flutterwave placeholder ready) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-base text-gray-900">
                  {selectedPlan === 'weekly' ? 'Weekly VIP Pass' : 'Monthly VIP Pass'}
                </h4>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2 mb-4 bg-gray-50 rounded-2xl p-4">
              <span className="text-xs text-gray-500 block mb-1">Amount to Pay</span>
              <span className="text-3xl font-black text-green-700">
                {selectedPlan === 'weekly' ? settings.vipPriceWeekly : settings.vipPriceMonthly}
              </span>
              <span className="text-[11px] text-gray-400 block mt-1">One-time payment. No automatic deduction.</span>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-green-500 bg-green-50/50 hover:bg-green-100 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-green-700" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Pay with Card / Bank Transfer (Paystack / Flutterwave)</span>
                    <span className="text-[10px] text-gray-500">Instant automatic account activation</span>
                  </div>
                </div>
                {isProcessingPayment ? (
                  <span className="text-xs font-bold text-green-700 animate-pulse">Processing...</span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-green-700" />
                )}
              </button>

              <a
                href={settings.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-green-600 fill-current" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Pay via WhatsApp Concierge</span>
                    <span className="text-[10px] text-gray-500">Send receipt to admin directly</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>

            <p className="text-[10px] text-gray-600 text-center">
              Prototype Notice: Clicking "Pay with Card" simulates immediate successful VIP activation so you can evaluate the full VIP flow.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
