import React, { useState } from 'react';
import { User, Mail, Lock, Sparkles, X, CheckCircle2, Bookmark, Crown, LogOut, KeyRound, ShieldAlert, Globe } from 'lucide-react';
import { UserProfile, BettingTip } from '../types';
import { ApiClient } from '../services/apiClient';
import { WORLD_COUNTRIES } from '../data/countries';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  savedTips: BettingTip[];
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
  savedTips,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo('');
    setLoading(true);

    if (mode === 'login') {
      const res = await ApiClient.login(email.trim(), password);
      setLoading(false);
      if (res.success && res.data) {
        onAuthSuccess(res.data.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed. Please check your credentials.');
      }
    } else if (mode === 'register') {
      const countryObj = WORLD_COUNTRIES.find(c => c.code === selectedCountryCode) || WORLD_COUNTRIES[0];
      const res = await ApiClient.register(
        email.trim(), 
        password, 
        username.trim(), 
        displayName.trim(),
        countryObj.name,
        countryObj.code,
        countryObj.flag
      );
      setLoading(false);
      if (res.success && res.data) {
        onAuthSuccess(res.data.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else if (mode === 'forgot') {
      if (resetStep === 1) {
        const res = await ApiClient.requestPasswordReset(email.trim());
        setLoading(false);
        if (res.success && res.data) {
          setResetToken(res.data.token);
          setResetStep(2);
          setSuccessInfo(`Reset code sent! Use code: ${res.data.token}`);
        } else {
          setErrorMsg(res.error || 'Password reset request failed.');
        }
      } else {
        const res = await ApiClient.resetPassword(resetToken.trim(), newPassword);
        setLoading(false);
        if (res.success) {
          setSuccessInfo('Password reset successfully! Please sign in with your new password.');
          setMode('login');
          setResetStep(1);
          setPassword(newPassword);
        } else {
          setErrorMsg(res.error || 'Invalid or expired reset code.');
        }
      }
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    const res = await ApiClient.verifyEmail();
    setVerifyingEmail(false);
    if (res.success && currentUser) {
      onAuthSuccess({ ...currentUser, emailVerified: true });
      setSuccessInfo('Email address verified successfully! ✅');
    } else {
      setErrorMsg(res.error || 'Email verification failed.');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const res = await ApiClient.loginWithGoogle(email.trim() || 'google.user@safe2odds.ng', displayName || 'Verified Google Punter');
    setLoading(false);
    if (res.success && res.data) {
      onAuthSuccess(res.data.user);
      onClose();
    } else {
      setErrorMsg(res.error || 'Google sign in failed.');
    }
  };

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141923] border border-red-900/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[94vh] overflow-y-auto text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                {currentUser 
                  ? 'Account Overview' 
                  : mode === 'login' 
                  ? 'Sign In to 2 Sure Odd' 
                  : mode === 'register' 
                  ? 'Create Free Account' 
                  : 'Reset Password'}
              </h3>
              <span className="text-[10px] text-gray-400">
                Production Worldwide Authentication
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logged in state */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1C2331] to-[#121620] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Account</span>
                  <span className="text-base font-black text-white">{currentUser.displayName || currentUser.username}</span>
                  <span className="text-xs text-gray-400 block">@{currentUser.username} · {currentUser.email}</span>
                </div>
                {currentUser.role !== 'user' && (
                  <span className="bg-red-950 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-red-700/60 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    {currentUser.role}
                  </span>
                )}
              </div>

              {/* Email Verification Status & Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
                {currentUser.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Email Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifyingEmail}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 px-2.5 py-0.5 rounded-md transition-colors"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>{verifyingEmail ? 'Verifying...' : 'Verify Email (1-Click)'}</span>
                  </button>
                )}

                {currentUser.badges && currentUser.badges.map(b => (
                  <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-gray-200 shadow-2xs">
                    {b}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400">Points Balance:</span>
                <span className="font-black text-red-400 text-sm tabular-nums">
                  {currentUser.points} pts
                </span>
              </div>
            </div>

            {/* Saved Tips Bookmark List */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-red-400" /> Bookmarked Tips ({savedTips.length})
              </h4>
              {savedTips.length === 0 ? (
                <p className="text-xs text-gray-400 bg-black/40 p-3 rounded-xl text-center border border-white/5">
                  No bookmarks yet. Click the bookmark icon on any tip card to save it.
                </p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {savedTips.map(tip => (
                    <div key={tip.id} className="p-2.5 bg-black/40 rounded-xl text-xs flex items-center justify-between border border-white/10">
                      <div>
                        <span className="font-bold text-white block">{tip.homeTeam} vs {tip.awayTeam}</span>
                        <span className="text-red-400">{tip.predictionDetail || tip.prediction} (@{tip.odds.toFixed(2)})</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{tip.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        ) : (
          /* Authentication Forms */
          <div>
            {/* Mode Tabs */}
            <div className="flex border-b border-white/10 mb-4 text-xs font-bold">
              <button
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessInfo(''); }}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  mode === 'login' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessInfo(''); }}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  mode === 'register' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-600/60 text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successInfo && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successInfo}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  {/* Mandatory Country Selection Before Signing Up */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-red-400" />
                        <span>Select Your Country *</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">Worldwide Support</span>
                    </label>
                    <select
                      value={selectedCountryCode}
                      onChange={e => setSelectedCountryCode(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                    >
                      {WORLD_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Unique Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VictorOsimhenFan"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Victor O."
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </>
              )}

              {mode === 'forgot' ? (
                <>
                  {resetStep === 1 ? (
                    <div>
                      <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                        Enter your registered email address. We will verify your account and provide a password reset authorization code.
                      </p>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-emerald-950/80 border border-emerald-700/60 p-2.5 rounded-xl text-xs text-emerald-200">
                        Authorization code received. Enter your code and chosen new password below.
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Reset Authorization Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. RESET-481920"
                          value={resetToken}
                          onChange={e => setResetToken(e.target.value)}
                          className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">New Password (min 8 chars) *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setResetStep(1); }}
                      className="px-3 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-gray-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-700/30 transition-colors"
                    >
                      {loading ? 'Verifying...' : resetStep === 1 ? 'Request Reset Code' : 'Save New Password'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-300">Password *</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setResetStep(1); }}
                          className="text-[11px] text-red-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-md shadow-red-700/40 transition-all border border-red-500/30"
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </>
              )}
            </form>

            {/* Google OAuth Button */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-bold text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Quick Demo Credentials helper */}
            <div className="mt-4 pt-3 border-t border-white/10 bg-[#0A0D14] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Quick 1-Click Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickAccount('sirrodstephen@gmail.com', 'Safe2Odds2026!')}
                  className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 rounded text-[10px] font-bold"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('moderator@safe2odds.ng', 'Safe2Odds2026!')}
                  className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 rounded text-[10px] font-bold"
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('punter@safe2odds.ng', 'Safe2Odds2026!')}
                  className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded text-[10px] font-bold"
                >
                  Pro Punter
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
