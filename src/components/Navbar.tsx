import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  Flame, 
  User, 
  BookOpen, 
  Radio, 
  Newspaper,
  CheckCircle,
  MessageCircle,
  Bell,
  Crown
} from 'lucide-react';
import { AppSettings, UserProfile, NotificationItem } from '../types';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  settings: AppSettings;
  onOpenAdmin: () => void;
  onOpenUserModal: () => void;
  onOpenProfile: (username?: string) => void;
  currentUser: UserProfile | null;
  notifications: NotificationItem[];
  unreadCount: number;
  onRefreshNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onOpenAdmin,
  onOpenUserModal,
  onOpenProfile,
  currentUser,
  notifications,
  unreadCount,
  onRefreshNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'tips', label: "Today's Tips" },
    { id: 'chat', label: 'Live Chat' },
    { id: 'livescores', label: 'Live Scores' },
    { id: 'results', label: 'Results' },
    { id: 'community', label: 'Community' },
    { id: 'guide', label: 'Betting Guide' },
    { id: 'news', label: 'News' },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStaff = currentUser && ['moderator', 'admin', 'super_admin'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-[#0E121A]/95 backdrop-blur-md border-b border-red-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ZONE 1: Brand Wordmark: 2 Sure Odd Football */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-700/30 shrink-0 border border-red-500/30 group-hover:scale-105 transition-transform">
                <span className="text-xl font-black">2</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white leading-none flex items-center gap-1.5">
                  <span>2 Sure Odd</span>
                  <span className="text-red-500">Football</span>
                </span>
                <span className="text-[11px] font-medium text-gray-400 mt-0.5 hidden sm:inline">
                  Verified Real Matches & Community
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: Clean Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {item.id === 'chat' && (
                    <span className="ml-1.5 text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse border border-white/20">
                      LIVE
                    </span>
                  )}
                  {item.id === 'livescores' && (
                    <span className="ml-1.5 text-[9px] bg-emerald-500/20 text-emerald-400 font-black px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                      REAL
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Join WhatsApp button */}
            <a
              href={settings.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-red-700/30 transition-transform active:scale-95 border border-red-500/30"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Join WhatsApp</span>
            </a>

            {/* Notification Dropdown (if logged in) */}
            {currentUser && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onRefresh={onRefreshNotifications}
              />
            )}

            {/* User Session trigger */}
            {currentUser ? (
              <button
                onClick={() => onOpenProfile(currentUser.username)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                title={`Profile: @${currentUser.username}`}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-red-500/50 bg-[#161B24] shrink-0">
                  <img
                    src={currentUser.avatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg'}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] text-red-400 font-black leading-none tabular-nums">
                    {currentUser.points} pts
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-red-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Staff Admin Portal trigger */}
            <button
              onClick={onOpenAdmin}
              title={isStaff ? 'Staff Portal' : 'Admin Login'}
              className={`p-2 rounded-xl transition-all relative ${
                currentTab === 'admin'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Lock className="w-4 h-4" />
              {isStaff && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-red-950/40 bg-[#0E121A] px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold text-left transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white/5 text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile(currentUser.username);
                }}
                className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs font-bold text-white border border-white/10"
              >
                <span>My Profile (@{currentUser.username})</span>
                <span className="text-red-400 font-black">{currentUser.points} pts</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserModal();
                }}
                className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-black text-center shadow-md shadow-red-700/30"
              >
                Sign In / Register
              </button>
            )}

            <a
              href={settings.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-current" /> Join Official WhatsApp Group
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 bg-white/10 text-white py-2.5 rounded-xl text-xs font-bold"
            >
              <Lock className="w-3.5 h-3.5" /> Staff Management Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
