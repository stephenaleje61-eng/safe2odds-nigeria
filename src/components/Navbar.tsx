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
  Bell
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
    { id: 'results', label: 'Results' },
    { id: 'livescores', label: 'Live Scores' },
    { id: 'guide', label: 'Betting Guide' },
    { id: 'community', label: 'Community' },
    { id: 'vip', label: 'VIP' },
    { id: 'news', label: 'News' },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStaff = currentUser && ['moderator', 'admin', 'super_admin'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ZONE 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white shadow-md shadow-green-700/20 shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#111827] leading-none flex items-center gap-1.5">
                  Safe<span className="text-[#16A34A]">2</span>Odds
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
                    NG
                  </span>
                </span>
                <span className="text-[11px] font-medium text-gray-500 mt-0.5 hidden sm:inline">
                  Smart Tips. Better Decisions.
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-green-50 text-green-700 border border-green-200/80 shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                  {item.id === 'vip' && (
                    <span className="ml-1 text-[9px] bg-amber-500 text-white font-bold px-1 py-0.2 rounded-xs">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Join WhatsApp prominent button */}
            <a
              href={settings.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-transform active:scale-95"
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                title={`Profile: @${currentUser.username}`}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-green-500/40 bg-gray-100 shrink-0">
                  <img
                    src={currentUser.avatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg'}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[90px]">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] text-green-700 font-extrabold leading-none tabular-nums">
                    {currentUser.points} pts
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Staff Admin Dashboard trigger */}
            <button
              onClick={onOpenAdmin}
              title={isStaff ? 'Staff Portal' : 'Admin Login'}
              className={`p-2 rounded-xl transition-colors relative ${
                currentTab === 'admin'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              {isStaff && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'vip' && (
                    <span className="text-[9px] bg-amber-400 text-gray-900 font-extrabold px-1 rounded">VIP</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile(currentUser.username);
                }}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-900"
              >
                <span>My Profile (@{currentUser.username})</span>
                <span className="text-green-700 font-extrabold">{currentUser.points} pts</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserModal();
                }}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold text-center"
              >
                Sign In / Register
              </button>
            )}

            <a
              href={settings.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#16A34A] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" /> Join Official WhatsApp Group
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-xs font-semibold"
            >
              <Lock className="w-3.5 h-3.5" /> Staff Management Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
