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
    const res = await ApiClient.loginWithGoogle(email.trim() || 'google.user@safe2odds.ng', displayName || 'Naija Google Punter');
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {currentUser 
                  ? 'Account Overview' 
                  : mode === 'login' 
                  ? 'Sign In to Safe2Odds' 
                  : mode === 'register' 
                  ? 'Create Free Account' 
                  : 'Reset Password'}
              </h3>
              <span className="text-[10px] text-gray-500">
                Production Authentication Engine
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logged in state */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-gray-50 p-4 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Active Account</span>
                  <span className="text-base font-extrabold text-gray-900">{currentUser.displayName || currentUser.username}</span>
                  <span className="text-xs text-gray-500 block">@{currentUser.username} · {currentUser.email}</span>
                </div>
                {currentUser.role !== 'user' && (
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {currentUser.role}
                  </span>
                )}
              </div>

              {/* Email Verification Status & Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
                {currentUser.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifyingEmail}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-0.5 rounded-md transition-colors"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                    <span>{verifyingEmail ? 'Verifying...' : 'Verify Email (1-Click)'}</span>
                  </button>
                )}

                {currentUser.badges && currentUser.badges.map(b => (
                  <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800 shadow-2xs">
                    {b}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                <span className="text-gray-600">Points Balance:</span>
                <span className="font-black text-green-700 text-sm tabular-nums">
                  {currentUser.points} pts
                </span>
              </div>
            </div>

            {/* Saved Tips Bookmark List */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-green-600" /> Bookmarked Tips ({savedTips.length})
              </h4>
              {savedTips.length === 0 ? (
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl text-center">
                  No bookmarks yet. Click the bookmark icon on any tip card to save it.
                </p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {savedTips.map(tip => (
                    <div key={tip.id} className="p-2.5 bg-gray-50 rounded-xl text-xs flex items-center justify-between border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900 block">{tip.homeTeam} vs {tip.awayTeam}</span>
                        <span className="text-green-700">{tip.predictionDetail || tip.prediction} (@{tip.odds.toFixed(2)})</span>
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
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        ) : (
          /* Authentication Forms */
          <div>
            {/* Mode Tabs */}
            <div className="flex border-b border-gray-100 mb-4 text-xs font-bold">
              <button
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessInfo(''); }}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  mode === 'login' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessInfo(''); }}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  mode === 'register' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'
                }`}
              >
                Register
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successInfo && (
              <div className="mb-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{successInfo}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  {/* Mandatory Country Selection Before Signing Up */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-green-600" />
                        <span>Select Your Country *</span>
                      </span>
                      <span className="text-[10px] text-gray-500 font-normal">Worldwide Support</span>
                    </label>
                    <select
                      value={selectedCountryCode}
                      onChange={e => setSelectedCountryCode(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-hidden focus:border-green-600"
                    >
                      {WORLD_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Unique Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VictorOsimhenFan"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Victor O."
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                    />
                  </div>
                </>
              )}

              {mode === 'forgot' ? (
                <>
                  {resetStep === 1 ? (
                    <div>
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        Enter your registered Safe2Odds email address. We will verify your account and provide a password reset authorization code.
                      </p>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800">
                        Authorization code received. Enter your code and chosen new password below.
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Reset Authorization Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. RESET-481920"
                          value={resetToken}
                          onChange={e => setResetToken(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-hidden focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">New Password (min 8 chars) *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setResetStep(1); }}
                      className="px-3 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      {loading ? 'Verifying...' : resetStep === 1 ? 'Request Reset Code' : 'Save New Password'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">Password *</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setResetStep(1); }}
                          className="text-[11px] text-green-700 hover:underline"
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
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-green-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </>
              )}
            </form>

            {/* Google OAuth Button */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
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
            <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Quick 1-Click Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickAccount('superadmin@safe2odds.ng', 'Safe2Odds2026!')}
                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded text-[10px] font-bold"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('moderator@safe2odds.ng', 'Safe2Odds2026!')}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-[10px] font-bold"
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('punter@safe2odds.ng', 'Safe2Odds2026!')}
                  className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-900 rounded text-[10px] font-bold"
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
