import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  Calendar, 
  Percent, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  Edit3, 
  Save, 
  Share2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { UserProfile, CommunityPrediction, UserRole } from '../types';
import { ApiClient } from '../services/apiClient';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername?: string;
  currentUser: UserProfile | null;
  onUserBlocked?: (userId: string) => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  targetUsername,
  currentUser,
  onUserBlocked,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'WON' | 'LOST' | 'PENDING'>('ALL');
  
  // Predictions history pagination
  const [predictions, setPredictions] = useState<CommunityPrediction[]>([]);
  const [loadingPreds, setLoadingPreds] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Edit bio state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  // Blocked status
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const isOwner = currentUser && profile && currentUser.id === profile.id;

  useEffect(() => {
    if (!isOpen) return;

    const usernameToFetch = targetUsername || currentUser?.username;
    if (!usernameToFetch) return;

    setLoading(true);
    ApiClient.getProfile(usernameToFetch).then(res => {
      setLoading(false);
      if (res.success && res.data) {
        setProfile(res.data);
        setBioInput(res.data.bio || '');
        setDisplayNameInput(res.data.displayName || res.data.username);
        loadUserPredictions(res.data.id, 'ALL');

        // Check if blocked
        const profileId = res.data.id;
        if (currentUser && currentUser.id !== profileId) {
          ApiClient.getBlockedUsers().then(blkRes => {
            if (blkRes.success && blkRes.data) {
              setIsBlocked(blkRes.data.includes(profileId));
            }
          });
        }
      }
    });
  }, [isOpen, targetUsername, currentUser]);

  const loadUserPredictions = async (userId: string, statusTab: string, cursor?: string) => {
    setLoadingPreds(true);
    const res = await ApiClient.getUserPredictions(userId, statusTab === 'ALL' ? undefined : statusTab, cursor, 8);
    setLoadingPreds(false);

    if (res.success && res.data) {
      if (cursor) {
        setPredictions(prev => [...prev, ...res.data!.items]);
      } else {
        setPredictions(res.data.items);
      }
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    }
  };

  const handleTabChange = (tab: 'ALL' | 'WON' | 'LOST' | 'PENDING') => {
    setActiveTab(tab);
    if (profile) {
      loadUserPredictions(profile.id, tab);
    }
  };

  const handleSaveBio = async () => {
    if (!isOwner) return;
    setSavingBio(true);
    const res = await ApiClient.updateMyProfile({
      displayName: displayNameInput,
      bio: bioInput,
    });
    setSavingBio(false);
    if (res.success && res.data) {
      setProfile(res.data);
      setIsEditingBio(false);
      if (onProfileUpdated) onProfileUpdated(res.data);
    }
  };

  const handleToggleBlock = async () => {
    if (!profile || !currentUser) return;
    setBlocking(true);
    if (isBlocked) {
      await ApiClient.unblockUser(profile.id);
      setIsBlocked(false);
    } else {
      await ApiClient.blockUser(profile.id);
      setIsBlocked(true);
      if (onUserBlocked) onUserBlocked(profile.id);
    }
    setBlocking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-gray-900">
              {isOwner ? 'My Official Profile' : 'Tipster Profile'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !profile ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading profile credentials...
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-6">
            
            {/* Profile Header Box */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-green-500/40 bg-gray-800 shrink-0 shadow-lg">
                    <img
                      src={profile.avatar || '/src/assets/images/vip_club_crest_1791379729058.jpg'}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {profile.displayName || profile.username}
                      </h3>
                      {profile.role === 'super_admin' && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          SUPER ADMIN
                        </span>
                      )}
                      {profile.role === 'admin' && (
                        <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ADMIN
                        </span>
                      )}
                      {profile.role === 'moderator' && (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          MODERATOR
                        </span>
                      )}
                      {profile.isVip && (
                        <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          VIP PRO
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      @{profile.username} · Joined {new Date(profile.dateJoined).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions (Block if not owner) */}
                {!isOwner && currentUser && (
                  <button
                    onClick={handleToggleBlock}
                    disabled={blocking}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
                      isBlocked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-gray-800 text-gray-300 hover:text-rose-400 border border-gray-700'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isBlocked ? 'Blocked (Click to Unblock)' : 'Block User'}</span>
                  </button>
                )}
              </div>

              {/* Bio Section */}
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs">
                {isEditingBio ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayNameInput}
                        onChange={e => setDisplayNameInput(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Bio</label>
                      <textarea
                        rows={2}
                        value={bioInput}
                        onChange={e => setBioInput(e.target.value)}
                        placeholder="Tell the community about your betting strategy..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBio}
                        disabled={savingBio}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save Bio
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-300 italic">
                      "{profile.bio || 'Disciplined Nigerian sports tipster.'}"
                    </p>
                    {isOwner && (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="text-green-400 hover:text-green-300 p-1 text-xs flex items-center gap-1 shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Verified Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Verified Points</span>
                <span className="text-xl sm:text-2xl font-black text-green-700 tabular-nums">
                  {profile.points} pts
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Win Rate</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900 tabular-nums">
                  {profile.winRate.toFixed(1)}%
                </span>
                <span className="text-[9px] text-gray-400 block">Won / Settled</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Verified Wins</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">
                  {profile.totalWins}
                </span>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Settled Losses</span>
                <span className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums">
                  {profile.totalLosses}
                </span>
              </div>
            </div>

            {/* Earned Badges Row */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Earned Platform Badges ({profile.badges.length})</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map(b => (
                    <span key={b} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs flex items-center gap-1">
                      <span>{b.includes('👑') || b.includes('🎯') || b.includes('🛡️') || b.includes('🔒') || b.includes('⭐') ? b : `🎖️ ${b}`}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prediction History Tabs */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <h4 className="font-extrabold text-sm text-gray-900">
                  Prediction History ({profile.totalPredictions})
                </h4>

                <div className="flex items-center gap-1">
                  {(['ALL', 'WON', 'LOST', 'PENDING'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                        activeTab === tab
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Predictions List */}
              {loadingPreds ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading prediction log...</div>
              ) : predictions.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                  No predictions found under this filter.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {predictions.map(pred => (
                    <div
                      key={pred.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-0.5">
                          <span className="font-bold text-green-700">{pred.league}</span>
                          <span>·</span>
                          <span>{new Date(pred.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h5 className="font-extrabold text-gray-900">{pred.match}</h5>
                        <div className="text-gray-600 mt-0.5">
                          Pick: <span className="font-bold text-gray-900">{pred.prediction}</span> (@{pred.odds.toFixed(2)})
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {pred.status === 'WON' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> WON (+10 pts)
                          </span>
                        )}
                        {pred.status === 'LOST' && (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> LOST
                          </span>
                        )}
                        {pred.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" /> PENDING
                          </span>
                        )}
                        {pred.status === 'VOID' && (
                          <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[11px]">
                            VOID
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Load more cursor pagination */}
                  {hasMore && (
                    <button
                      onClick={() => profile && loadUserPredictions(profile.id, activeTab, nextCursor || undefined)}
                      disabled={loadingPreds}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
                    >
                      Load More Predictions
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
