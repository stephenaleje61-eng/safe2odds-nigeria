import React from 'react';
import { ShieldCheck, MessageCircle, Twitter, Facebook, Send, Lock } from 'lucide-react';
import { AppSettings } from '../types';

interface FooterProps {
  settings: AppSettings;
  onSelectTab: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onSelectTab, onOpenAdmin }) => {
  return (
    <footer className="bg-[#111827] text-white border-t border-gray-800 pt-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-red-600 flex items-center justify-center text-white shadow-md">
                <span className="text-xl font-black">2</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                2 Sure Odd <span className="text-red-500">Football</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
              Professional football match predictions, real live scoreboards, and global chat room for punters. Disciplined mathematical modeling, zero fake games.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={settings.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-colors"
                title="WhatsApp Group"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>
              <a
                href={settings.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors"
                title="Telegram Channel"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={settings.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4 fill-current" />
              </a>
              <a
                href={settings.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => onSelectTab('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('tips')} className="hover:text-white transition-colors">
                  Today's Tips
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('results')} className="hover:text-white transition-colors">
                  Results & History
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('livescores')} className="hover:text-white transition-colors">
                  Live Scores
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('community')} className="hover:text-white transition-colors">
                  Fans Prediction Zone
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">
              Community & Chat
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => onSelectTab('chat')} className="hover:text-white transition-colors flex items-center gap-1.5 font-bold text-gray-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Live Match Chat Room</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('guide')} className="hover:text-white transition-colors">
                  Betting Guide for Beginners
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('news')} className="hover:text-white transition-colors">
                  Football News & Analysis
                </button>
              </li>
              <li>
                <a href={settings.whatsAppLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Join WhatsApp Community
                </a>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-white transition-colors flex items-center gap-1 text-gray-500">
                  <Lock className="w-3 h-3" /> Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Responsible Gaming Notice */}
          <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800">
            <span className="inline-block text-[11px] font-bold text-red-500 bg-red-950 border border-red-800 px-2 py-0.5 rounded mb-2">
              18+ ONLY
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Betting involves financial risk and may become addictive. Safe2Odds is not an operator and accepts no wagers. Our statistical predictions are for informational and entertainment purposes only.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Safe2Odds Nigeria. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Lagos, Nigeria</span>
            <span>·</span>
            <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
              {settings.contactEmail}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
