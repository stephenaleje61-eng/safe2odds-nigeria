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
    <footer className="bg-[#090C12] text-white border-t border-red-950/40 pt-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-700/30 border border-red-500/30">
                <span className="text-xl font-black">2</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
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
                className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
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
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4 fill-current" />
              </a>
              <a
                href={settings.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-400 mb-3">
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
            <h4 className="text-xs font-black uppercase tracking-wider text-red-400 mb-3">
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
                <button onClick={onOpenAdmin} className="hover:text-white transition-colors flex items-center gap-1 text-gray-400">
                  <Lock className="w-3 h-3 text-red-400" /> Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Responsible Gaming Notice */}
          <div className="bg-[#10141D] p-4 rounded-2xl border border-white/10">
            <span className="inline-block text-[11px] font-black text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded mb-2">
              18+ ONLY
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
              Betting involves financial risk and may become addictive. 2 Sure Odd Football is not an operator and accepts no wagers. Our statistical predictions are for informational and entertainment purposes only.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} 2 Sure Odd Football. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Worldwide Coverage</span>
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
