import React, { useState } from 'react';
import { BookOpen, Calculator, HelpCircle, ShieldCheck, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

export const BettingGuideSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Calculator State
  const [calcStake, setCalcStake] = useState<number>(2000);
  const [calcOdds, setCalcOdds] = useState<number>(1.95);

  const potentialPayout = Math.round(calcStake * calcOdds);
  const potentialProfit = Math.max(0, potentialPayout - calcStake);

  const articles = [
    {
      title: 'What Are Betting Odds & How Decimal Odds Work?',
      summary: 'Decimal odds represent the total return you receive for every 1 unit staked, including your initial stake.',
      content: `In Nigeria and across modern international sports betting, Decimal Odds (e.g., 1.50, 1.95, 2.40) are the standard format.
      
How to calculate your return:
• Total Payout = Stake × Decimal Odds
• Net Profit = Total Payout - Stake

Example with ₦1,000 Stake:
If you place ₦1,000 on a selection at 1.90 odds:
• Total Payout: ₦1,000 × 1.90 = ₦1,900
• Net Profit: ₦1,900 - ₦1,000 = ₦900

Lower odds (e.g. 1.25) reflect higher statistical probability of winning, while higher odds (e.g. 4.50) represent high risk/high reward situations.`
    },
    {
      title: 'What Does Over 1.5 Goals Mean in Football?',
      summary: 'Over 1.5 Goals means 2 or more total goals must be scored by either or both teams combined during regular time.',
      content: `The Over 1.5 Goals market is one of the most popular conservative betting options used to construct Safe 2 Odds combinations.

Winning scorelines for Over 1.5:
• 1 - 1 (2 goals = WIN)
• 2 - 0 (2 goals = WIN)
• 0 - 2 (2 goals = WIN)
• 2 - 1, 3 - 0, 2 - 2, 4 - 1, etc. (All WIN)

Losing scorelines for Over 1.5:
• 0 - 0 (0 goals = LOSS)
• 1 - 0 or 0 - 1 (1 goal only = LOSS)

Because modern professional teams average over 2.6 goals per game, Over 1.5 offers a consistent safety margin when both sides favor attacking football.`
    },
    {
      title: 'What Does BTTS (Both Teams To Score) Mean?',
      summary: 'BTTS Yes means both teams must score at least 1 goal during regular playing time.',
      content: `BTTS stands for Both Teams To Score (often written as GG or Goal/Goal in Nigeria).

When does BTTS win?
• As soon as both the home and away team score at least one goal, the bet wins regardless of who eventually wins the game.
• Examples: 1 - 1, 2 - 1, 1 - 3, 2 - 2 are winning results.

When does BTTS lose?
• If any team fails to score (e.g., 0 - 0, 1 - 0, 3 - 0).

BTTS is ideal for matches featuring top attacking squads with leaky or injury-depleted defenses.`
    },
    {
      title: 'What is Double Chance (1X, 12, X2)?',
      summary: 'Double Chance allows you to cover two out of three possible match outcomes with a single bet.',
      content: `In football, a standard match has three outcomes: Home Win (1), Draw (X), or Away Win (2). Double Chance combines two of them:

1. 1X (Home Win or Draw):
You win if the home team wins OR if the match ends in a draw. You only lose if the away team wins. Highly favored when betting on strong home teams.

2. X2 (Draw or Away Win):
You win if the visiting team wins OR if the match ends in a draw.

3. 12 (Home Win or Away Win):
You win if either team wins. You only lose if the match finishes in a draw.

Double Chance reduces variance dramatically, making it a cornerstone for disciplined 2-odds slips.`
    },
    {
      title: 'How to Manage a Betting Budget & Bankroll Discipline',
      summary: 'Bankroll management is the single most important habit separating disciplined punters from emotional gamblers.',
      content: `Rule #1: Only bet with discretionary funds you can afford to lose without impacting household bills, rent, food, or emergency savings.

The Unit System:
• Divide your total dedicated monthly betting budget into 50 or 100 equal "units".
• Example: If your recreational monthly budget is ₦20,000, 1 Unit = ₦200 to ₦400.
• Flat Staking: Stake exactly 1 unit per safe selection. Never increase your stake to "chase" a lost bet. Chasing losses is the fastest way to lose discipline.`
    },
    {
      title: 'Why Betting is Not Guaranteed Income & Responsible Gambling',
      summary: 'Sports betting is entertainment, not an investment or reliable salary.',
      content: `No betting prediction is ever 100% guaranteed. Even the best teams in the world with 90% statistical favoritism can suffer unexpected red cards, referee errors, injuries, or fluke bounces.

Beware of Scammers:
• Anyone offering "100% fixed matches" or "guaranteed wealth" on social media or Telegram is running a scam.
• Fixed matches do not exist for public sale.

Responsible Gambling Resources in Nigeria:
If gambling is causing stress or affecting your finances, take an immediate break. Safe2Odds promotes strict recreational self-control.
• Set personal deposit and time limits.
• Never borrow money or use credit for betting.
• 18+ Strictly.`
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header with tactical graphic */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="p-6 sm:p-8 md:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Beginner to Pro Guide
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Betting Guide & Strategy Hub
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Master the fundamentals of sports betting odds, understanding markets, calculating risk, and building smart, disciplined betting habits.
            </p>
          </div>

          <div className="md:col-span-5 h-48 md:h-full relative overflow-hidden">
            <img
              src="/src/assets/images/football_tactics_guide_1791379697899.jpg"
              alt="Tactics board and football strategy"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-white" />
          </div>
        </div>
      </div>

      {/* Interactive Odds & Payout Calculator */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
          <Calculator className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">
            Interactive Decimal Odds & Profit Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Stake Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Stake Amount (₦ Naira)
            </label>
            <input
              type="number"
              min="100"
              step="500"
              value={calcStake}
              onChange={e => setCalcStake(Math.max(0, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-hidden focus:border-green-500"
            />
            <span className="text-[11px] text-gray-500 mt-1 block">Your wager in Nigerian Naira</span>
          </div>

          {/* Odds Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Target Decimal Odds
            </label>
            <input
              type="number"
              min="1.01"
              max="50"
              step="0.05"
              value={calcOdds}
              onChange={e => setCalcOdds(Math.max(1.01, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-hidden focus:border-green-500"
            />
            <span className="text-[11px] text-gray-500 mt-1 block">Example: 1.90 or 2.05</span>
          </div>

          {/* Result Card */}
          <div className="bg-gray-800/90 rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Total Payout:</span>
              <span className="font-extrabold text-white tabular-nums text-sm">
                ₦{potentialPayout.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-700">
              <span className="text-green-400 font-bold">Net Profit:</span>
              <span className="text-lg font-black text-green-400 tabular-nums">
                +₦{potentialProfit.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block mt-2 text-center">
              Formula: (₦{calcStake.toLocaleString()} × {calcOdds.toFixed(2)}) - ₦{calcStake.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Articles List */}
      <div className="space-y-3">
        {articles.map((art, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
              >
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {art.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {art.summary}
                  </p>
                </div>
                <div className="p-1 rounded-lg bg-gray-100 text-gray-600 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 whitespace-pre-line bg-gray-50/40">
                  {art.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
