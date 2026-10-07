import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MinusCircle, 
  Settings, 
  Users, 
  Newspaper, 
  Database, 
  Eye, 
  EyeOff, 
  Flag, 
  AlertTriangle,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  FileCode,
  Ban,
  Activity,
  Award
} from 'lucide-react';
import { 
  BettingTip, 
  CommunityPrediction, 
  NewsArticle, 
  AppSettings, 
  TipStatus,
  CommunityPredictionStatus,
  PredictionMarket,
  Report,
  AdminAuditLog,
  UserProfile,
  UserRole
} from '../types';
import { ApiClient } from '../services/apiClient';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onCloseAdmin: () => void;
  officialTips: BettingTip[];
  news: NewsArticle[];
  settings: AppSettings;
  onSaveOfficialTip: (tipData: any, id?: string) => Promise<void>;
  onDeleteOfficialTip: (id: string) => Promise<void>;
  onSaveNews: (article: any, id?: string) => Promise<void>;
  onDeleteNews: (id: string) => Promise<void>;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  onRefreshAllData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenLogin,
  onCloseAdmin,
  officialTips,
  news,
  settings,
  onSaveOfficialTip,
  onDeleteOfficialTip,
  onSaveNews,
  onDeleteNews,
  onSaveSettings,
  onRefreshAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'reports' | 'audit' | 'tips' | 'settings'>('verification');

  // Admin Data State
  const [stats, setStats] = useState<any>(null);
  const [pendingPredictions, setPendingPredictions] = useState<CommunityPrediction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification action loading state
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Official Tip Form State
  const [showTipForm, setShowTipForm] = useState(false);
  const [editingTipId, setEditingTipId] = useState<string | null>(null);
  const [tipForm, setTipForm] = useState({
    homeTeam: '',
    awayTeam: '',
    league: 'Premier League',
    date: 'Today',
    time: '19:30',
    prediction: 'Over 1.5' as PredictionMarket,
    predictionDetail: '',
    odds: 1.35,
    analysis: '',
    status: 'Pending' as TipStatus,
    isVip: false,
    resultScore: '',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  const isStaff = currentUser && ['moderator', 'admin', 'super_admin'].includes(currentUser.role);
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    if (!isStaff) return;
    loadAdminData();
  }, [isStaff]);

  const loadAdminData = async () => {
    setLoading(true);
    const [statsRes, feedRes, reportsRes, auditRes] = await Promise.all([
      ApiClient.getAdminStats(),
      ApiClient.getCommunityFeed({ limit: 40 }),
      ApiClient.getAdminReports(),
      ApiClient.getAdminAuditLogs(),
    ]);

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (feedRes.success && feedRes.data) setPendingPredictions(feedRes.data.items);
    if (reportsRes.success && reportsRes.data) setReports(reportsRes.data);
    if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data);
    setLoading(false);
  };

  const handleVerify = async (predictionId: string, status: CommunityPredictionStatus) => {
    setProcessingId(predictionId);
    const res = await ApiClient.verifyPrediction(predictionId, status);
    setProcessingId(null);
    if (res.success) {
      loadAdminData();
      onRefreshAllData();
    } else {
      alert(res.error || 'Verification failed');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'RESOLVED' | 'DISMISSED') => {
    const res = await ApiClient.resolveReport(reportId, action);
    if (res.success) {
      loadAdminData();
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    const res = await ApiClient.suspendUser(userId, suspend);
    if (res.success) {
      loadAdminData();
      alert(`User account ${suspend ? 'suspended' : 'unsuspended'} successfully.`);
    }
  };

  const handleAssignRole = async (userId: string, role: UserRole) => {
    if (!isSuperAdmin) return;
    const res = await ApiClient.setUserRole(userId, role);
    if (res.success) {
      loadAdminData();
      alert(`Role updated to ${role}.`);
    }
  };

  // Official Tip Save
  const handleSaveTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveOfficialTip({
      ...tipForm,
      odds: Number(tipForm.odds),
    }, editingTipId || undefined);
    setShowTipForm(false);
    setEditingTipId(null);
  };

  if (!currentUser || !isStaff) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-200 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-900 text-green-400 mx-auto flex items-center justify-center mb-4 shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">
          Restricted Staff Console
        </h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Access to this area requires an authenticated Moderator, Admin, or Super Admin account.
        </p>

        <div className="space-y-3">
          <button
            onClick={onOpenLogin}
            className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-colors"
          >
            Sign In with Staff Account
          </button>
          <button
            onClick={onCloseAdmin}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors"
          >
            ← Return to Public Website
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 text-left bg-gray-50 p-3 rounded-xl">
          <strong>Pre-configured Demo Staff Accounts:</strong>
          <div className="mt-1 font-mono text-[10px]">
            • Super Admin: <span className="text-green-700 font-bold">superadmin@safe2odds.ng</span>
            <br />
            • Password: <span className="text-gray-900 font-bold">Safe2Odds2026!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-green-500/20 text-green-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Safe2Odds Staff Control Center
            </h2>
            <span className="text-[10px] font-bold bg-green-500 text-gray-950 px-2 py-0.5 rounded-full uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Authenticated as <strong className="text-white">@{currentUser.username}</strong> ({currentUser.displayName}). Server-enforced permissions active.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={onCloseAdmin}
            className="px-4 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
          >
            Public Site
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Registered</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 tabular-nums">{stats.totalUsers}</span>
            <span className="text-[10px] text-green-700 font-semibold block">{stats.activeUsers} active</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Verification</span>
            <span className="text-xl sm:text-2xl font-black text-amber-800 tabular-nums">{stats.pendingPredictions}</span>
            <span className="text-[10px] text-amber-700 block">Needs review</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Verified Wins</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">{stats.wonPredictions}</span>
            <span className="text-[10px] text-emerald-700 block">+10 pts awarded</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending Reports</span>
            <span className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums">{stats.pendingReports}</span>
            <span className="text-[10px] text-gray-500 block">Flagged items</span>
          </div>

          <div className="bg-gray-900 text-white p-4 rounded-2xl border border-gray-800 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-green-400 block">Points Issued</span>
            <span className="text-xl sm:text-2xl font-black text-green-400 tabular-nums">{stats.totalPointsIssued}</span>
            <span className="text-[10px] text-gray-400 block">Immutable ledger</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'verification', label: "Prediction Verification", count: pendingPredictions.length },
          { id: 'reports', label: "Reports Queue", count: reports.filter(r => r.status === 'PENDING').length },
          { id: 'audit', label: "Audit Logs", count: auditLogs.length },
          { id: 'tips', label: "Official Tips", count: officialTips.length },
          { id: 'settings', label: "Settings & Affiliate" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PREDICTION VERIFICATION & ATOMIC POINTS */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                Community Prediction Settlement Queue
              </h3>
              <p className="text-xs text-gray-500">
                Verifying a prediction as <strong className="text-green-700">WON</strong> triggers an atomic, idempotent server-side transaction awarding exactly <strong>+10 points</strong> and recalculates the author's verified win rate.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {pendingPredictions.length === 0 ? (
              <div className="p-10 text-center text-xs text-gray-400">
                No predictions in the verification queue.
              </div>
            ) : (
              pendingPredictions.map(pred => (
                <div key={pred.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-bold text-gray-900">@{pred.authorUsername}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-green-700 font-semibold">{pred.league}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{new Date(pred.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-black text-sm text-gray-900">{pred.match}</h4>
                    <div className="text-xs text-gray-700 mt-0.5">
                      Prediction: <span className="font-extrabold text-green-700">{pred.prediction}</span> (@{pred.odds.toFixed(2)})
                    </div>

                    {pred.comment && (
                      <p className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-2 rounded-lg">
                        "{pred.comment}"
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">Current Status:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        pred.status === 'WON' ? 'bg-emerald-100 text-emerald-800' :
                        pred.status === 'LOST' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {pred.status}
                      </span>
                    </div>
                  </div>

                  {/* Verification Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(pred.id, 'WON')}
                      disabled={processingId === pred.id}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify WON (+10 pts)</span>
                    </button>

                    <button
                      onClick={() => handleVerify(pred.id, 'LOST')}
                      disabled={processingId === pred.id}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Mark LOST</span>
                    </button>

                    <button
                      onClick={() => handleVerify(pred.id, 'VOID')}
                      disabled={processingId === pred.id}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                    >
                      Mark VOID
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS REVIEW */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                User Reports & Moderation Queue
              </h3>
              <p className="text-xs text-gray-500">
                Investigate flagged spam, abusive language, or misleading scam claims.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No active reports.</div>
            ) : (
              reports.map(rep => (
                <div key={rep.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-gray-400">Reported by @{rep.reporterUsername}</span>
                      <span className="text-xs text-gray-400">· {new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-gray-900">{rep.targetSummary}</h4>
                    {rep.description && (
                      <p className="text-xs text-gray-600 mt-1 italic bg-gray-50 p-2 rounded-lg">
                        "{rep.description}"
                      </p>
                    )}

                    <span className="text-[10px] text-gray-400 mt-1 block">Status: {rep.status}</span>
                  </div>

                  {rep.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold"
                      >
                        Action Taken & Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
            <h3 className="font-extrabold text-base text-gray-900">
              Immutable Admin Action Audit Logs
            </h3>
            <p className="text-xs text-gray-500">
              Every sensitive operation (verifying predictions, adjusting roles, suspensions) is logged with SHA-256 IP hash and admin identity.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-3 px-4">Timestamp</th>
                    <th scope="col" className="py-3 px-4">Staff Member</th>
                    <th scope="col" className="py-3 px-4">Action</th>
                    <th scope="col" className="py-3 px-4">Target ID</th>
                    <th scope="col" className="py-3 px-4">IP Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-gray-900 font-sans">
                        @{log.adminUsername}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-green-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">
                        {log.targetId}
                      </td>
                      <td className="py-2.5 px-4 text-gray-400 truncate max-w-xs">
                        {log.ipHash.slice(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL TIPS */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900">
              Official Safe 2 Odds Slips ({officialTips.length})
            </h3>
            <button
              onClick={() => {
                setEditingTipId(null);
                setTipForm({
                  homeTeam: '',
                  awayTeam: '',
                  league: 'Premier League',
                  date: 'Today',
                  time: '19:30',
                  prediction: 'Over 1.5',
                  predictionDetail: '',
                  odds: 1.35,
                  analysis: '',
                  status: 'Pending',
                  isVip: false,
                  resultScore: '',
                });
                setShowTipForm(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#16A34A] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Official Tip
            </button>
          </div>

          {showTipForm && (
            <div className="bg-white p-6 rounded-3xl border-2 border-green-500 shadow-xl">
              <h4 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {editingTipId ? 'Edit Tip' : 'Publish Official Match Tip'}
              </h4>
              <form onSubmit={handleSaveTipSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Home Team</label>
                    <input
                      type="text"
                      required
                      value={tipForm.homeTeam}
                      onChange={e => setTipForm({ ...tipForm, homeTeam: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Away Team</label>
                    <input
                      type="text"
                      required
                      value={tipForm.awayTeam}
                      onChange={e => setTipForm({ ...tipForm, awayTeam: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">League</label>
                    <input
                      type="text"
                      required
                      value={tipForm.league}
                      onChange={e => setTipForm({ ...tipForm, league: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Odds</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={tipForm.odds}
                      onChange={e => setTipForm({ ...tipForm, odds: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Prediction</label>
                    <input
                      type="text"
                      required
                      value={tipForm.predictionDetail}
                      onChange={e => setTipForm({ ...tipForm, predictionDetail: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Analysis</label>
                    <input
                      type="text"
                      required
                      value={tipForm.analysis}
                      onChange={e => setTipForm({ ...tipForm, analysis: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTipForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-green-600 text-white font-bold text-xs"
                  >
                    Save Tip
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {officialTips.map(tip => (
              <div key={tip.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-extrabold text-sm text-gray-900">{tip.homeTeam} vs {tip.awayTeam}</div>
                  <div className="text-gray-500">{tip.league} · Pick: <strong className="text-green-700">{tip.predictionDetail || tip.prediction}</strong> (@{tip.odds.toFixed(2)})</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    tip.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                    tip.status === 'Lost' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tip.status}
                  </span>
                  <button
                    onClick={() => onDeleteOfficialTip(tip.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-lg text-gray-900">Platform Settings & Community Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">WhatsApp Community Link</label>
              <input
                type="text"
                value={settingsForm.whatsAppLink}
                onChange={e => setSettingsForm({ ...settingsForm, whatsAppLink: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Telegram Link</label>
              <input
                type="text"
                value={settingsForm.telegramLink}
                onChange={e => setSettingsForm({ ...settingsForm, telegramLink: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Affiliate Link</label>
              <input
                type="text"
                value={settingsForm.affiliateLink}
                onChange={e => setSettingsForm({ ...settingsForm, affiliateLink: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Odds</label>
              <input
                type="number"
                step="0.05"
                value={settingsForm.targetOdds}
                onChange={e => setSettingsForm({ ...settingsForm, targetOdds: Number(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onSaveSettings(settingsForm)}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
